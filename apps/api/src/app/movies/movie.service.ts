import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import {
    QueryDslQueryContainer,
    SearchTotalHits,
    SortCombinations,
} from '@elastic/elasticsearch/lib/api/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { MovieRepository } from './movie.repository';
import { MovieResponseDto } from './dtos';
import { Movie } from './movie.schema';
import {
    convertToObjectId,
    isNullOrUndefined,
    isTrue,
    sortedStringify,
    isEmptyObject,
    extractJSON,
} from '../../libs/utils/common';
import { RedisService } from '../../libs/modules/redis/services';
import { MovieType } from './movie.type';
import { UpdateMovieInput } from './inputs/mutate-movie.input';
import { GetMovieInput } from './inputs/get-movie.input';
import { SearchService } from './search.service';
import { GetMoviesInput } from './inputs/get-movies.input';
import { MutateHardDeleteMovieInput } from './inputs/mutate-hard-delete-movie.input';
import { CreateMovieInput } from './inputs/create-movie.input';
import { GetMoviesAdminInput } from './inputs/get-movies-admin.input';
import { systemInstruction } from './ai-movie.prompt';
import { KEYWORDS_MAX_LENGTH, MovieContentRatingEnum } from './movie.constant';
import { mappingContentRating } from '../crawlers/mapping-data';

@Injectable()
export class MovieService {
    private readonly logger: Logger;
    private readonly EXCLUDE_MOVIE_SRC: ('ophim' | 'kkphim' | 'nguonc')[] = [];
    private readonly genAI: GoogleGenerativeAI;
    private readonly AI_MODELS: string[] = [
        'models/gemini-2.5-flash-preview-04-17',
        'models/gemini-2.0-flash-thinking-exp-01-21',
        'models/gemini-2.0-flash-thinking-exp-1219',
        'models/gemini-2.0-pro-exp-02-05',
        'models/gemini-2.0-flash-exp',
        'models/gemini-2.0-flash-lite-preview-02-05',
        'models/gemini-1.5-pro',
        'models/gemini-1.5-flash',
        'models/gemini-1.5-flash-8b',
    ];

    constructor(
        private readonly configService: ConfigService,
        private readonly movieRepo: MovieRepository,
        private readonly redisService: RedisService,
        private readonly searchService: SearchService,
        private readonly elasticsearchService: ElasticsearchService,
        private readonly httpService: HttpService,
    ) {
        this.logger = new Logger(MovieService.name);
        this.EXCLUDE_MOVIE_SRC = (this.configService
            .get<string>('EXCLUDE_MOVIE_SRC')
            ?.split(',')
            ?.map((s: string | undefined) => s?.toString()?.trim()) || []) as (
            | 'ophim'
            | 'kkphim'
            | 'nguonc'
        )[];
        const googleApiKey = this.configService.get<string>('GOOGLE_API_KEY');
        if (googleApiKey) {
            this.genAI = new GoogleGenerativeAI(googleApiKey);
            this.logger.log('[AI] Gemini AI initialized');
        } else {
            this.logger.warn('[AI] Google API Key not provided. AI disabled.');
        }
    }

    async createMovie(input: CreateMovieInput): Promise<MovieType> {
        const newMovie: Movie = {
            _id: new Types.ObjectId(),
            deletedAt: null,

            ...input,
            actors: input.actors?.map((c) => convertToObjectId(c)),
            categories: input.categories?.map((c) => convertToObjectId(c)),
            countries: input.countries?.map((c) => convertToObjectId(c)),
            directors: input.directors?.map((c) => convertToObjectId(c)),
            lastSyncModified: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            contentRating: mappingContentRating(input?.contentRating),
        };

        const createdMovie = await this.movieRepo.create({
            document: newMovie,
        });
        await this.searchService.indexMovie(createdMovie);

        return new MovieResponseDto(createdMovie, { excludeSrc: this.EXCLUDE_MOVIE_SRC });
    }

    async getMovie({ _id, slug }: GetMovieInput, { populate = true }: { populate?: boolean } = {}) {
        if (isNullOrUndefined(_id) && isNullOrUndefined(slug)) {
            return null;
        }
        const filter = !isNullOrUndefined(_id) ? { _id: convertToObjectId(_id) } : { slug };
        const movie = await this.movieRepo.findOneOrThrow({
            filterQuery: filter,
            queryOptions: {
                ...(populate && {
                    populate: [
                        {
                            path: 'actors',
                            justOne: false,
                        },
                        {
                            path: 'categories',
                            justOne: false,
                        },
                        {
                            path: 'countries',
                            justOne: false,
                        },
                        {
                            path: 'directors',
                            justOne: false,
                        },
                    ],
                }),
            },
        });
        return new MovieResponseDto(movie, { excludeSrc: this.EXCLUDE_MOVIE_SRC });
    }

    async getMoviesEs(
        dto: GetMoviesAdminInput | GetMoviesInput,
        isRestful = false,
        isAdmin = false,
    ) {
        const {
            useAI = false,
            resetCache = false,
            bypassCache = false,
            page = 1,
            limit = 10,
            categories,
            countries,
            years,
            ...restDto
        } = { resetCache: false, bypassCache: false, isDeleted: false, ...dto };

        let keywords = dto?.keywords;
        if (!isNullOrUndefined(keywords) && keywords.trim()?.length > KEYWORDS_MAX_LENGTH) {
            keywords = keywords.trim().slice(0, KEYWORDS_MAX_LENGTH);
        }

        const keywordsEncoded = encodeURIComponent(keywords);
        const cacheKey = `CACHED:MOVIES:ES:${sortedStringify({
            ...restDto,
            useAI,
            keywords: keywordsEncoded,
            page,
            limit,
            categories,
            countries,
            years,
        })}`;
        const aiFilterCacheKey = `CACHED:AI_FILTER:${sortedStringify({
            useAI,
            keywords: keywordsEncoded,
            categories,
            countries,
            years,
        })}`;

        if (isTrue(resetCache)) {
            await Promise.all([
                this.redisService.del(cacheKey),
                this.redisService.del(aiFilterCacheKey),
            ]);
        }
        if (!isTrue(bypassCache)) {
            const fromCache = await this.redisService.get<{ data: MovieType[]; total: number }>(
                cacheKey,
            );
            if (fromCache) {
                this.logger.log(`HIT: ${cacheKey}`);
                return {
                    data: fromCache.data.map((movie) => new MovieType(movie)),
                    total: fromCache.total,
                };
            }
        }

        this.logger.log(`MISS: ${cacheKey}`);

        let aiFilter: QueryDslQueryContainer | null = null;

        if (useAI && keywords && this.genAI) {
            try {
                const aiFilterFromCached = await this.redisService.get<string>(aiFilterCacheKey);
                aiFilter =
                    typeof aiFilterFromCached === 'string'
                        ? JSON.parse(aiFilterFromCached)
                        : aiFilterFromCached;

                if (!aiFilter) {
                    this.logger.log(`[AI] Analyzing: ${keywords}`);

                    const aiAnalysis = await this.analyzeSearchQuery({
                        keywords,
                        categories,
                        countries,
                        years,
                    });
                    if (aiAnalysis && !isEmptyObject(aiAnalysis)) {
                        aiFilter = await this.getAIFilter(aiAnalysis, {
                            categories,
                            countries,
                            years,
                        });

                        await this.redisService.set(
                            aiFilterCacheKey,
                            JSON.stringify(aiFilter),
                            1000 * 60 * 30,
                        );
                    }
                } else {
                    this.logger.log(`[AI] Using cached analysis for: ${keywords}`);
                }
            } catch (error) {
                this.logger.error(`[AI] Failed to analyze search query: ${error}`);
                aiFilter = null;
            }
        }

        // Build the final query - always ensuring user filters are applied
        let query: QueryDslQueryContainer;
        if (aiFilter) {
            // AI search with user filters preserved
            query = await this.combineAIWithUserFilters(aiFilter, dto, isAdmin);
            this.logger.log(`[Search] Using AI-enhanced search with user filters`);
        } else {
            // Traditional search
            query = await this.buildTraditionalQuery(dto, isAdmin);
            this.logger.log(`[Search] Using traditional search`);
        }

        const { data, total } = await this.executeSearch(query, dto, isRestful);

        const res = {
            data: data.map((d) => ({
                ...d,
                thumbUrl: d?.thumbUrl || '',
                posterUrl: d?.posterUrl || '',
                contentRating: d?.contentRating || MovieContentRatingEnum.P,
            })),
            total,
            count: data?.length || 0,
        };
        await this.redisService.set(cacheKey, res, 1000 * 30);

        return res;
    }

    private processYearFilter(years: string | undefined): QueryDslQueryContainer[] {
        const filter: QueryDslQueryContainer[] = [];
        if (!isNullOrUndefined(years)) {
            if (years.includes('-')) {
                const [startYear, endYear] = years.split('-').map(Number);
                filter.push({
                    range: {
                        year: {
                            gte: startYear,
                            lte: endYear,
                        },
                    },
                });
            } else {
                const yearList = years.split(',').map(Number).filter(Boolean);
                filter.push({ terms: { year: yearList } });
            }
        }
        return filter;
    }

    private async buildTraditionalQuery(
        dto: GetMoviesAdminInput | GetMoviesInput,
        isAdmin = false,
    ): Promise<QueryDslQueryContainer> {
        const {
            keywords,
            cinemaRelease,
            isCopyright,
            type,
            years,
            categories,
            countries,
            status,
            quality,
            contentRating,
            isDeleted = false,
        } = { isDeleted: false, ...dto };

        const must: QueryDslQueryContainer['bool']['must'] = [];
        const mustNot: QueryDslQueryContainer['bool']['must_not'] = [];
        const filter: QueryDslQueryContainer[] = [];

        if (keywords) {
            must.push({
                bool: {
                    should: [
                        // Stage 1: Exact phrase match in name and originName
                        {
                            multi_match: {
                                query: keywords,
                                fields: ['name', 'originName'],
                                type: 'phrase',
                            },
                        },
                        // Stage 2: Partial phrase match in name and originName
                        {
                            multi_match: {
                                query: keywords,
                                fields: ['name', 'originName'],
                                type: 'phrase_prefix',
                            },
                        },
                        // Stage 3: Term match in slug and content
                        {
                            multi_match: {
                                query: keywords,
                                fields: ['slug', 'content'],
                                type: 'best_fields',
                                operator: 'and',
                            },
                        },
                        // Stage 4: Exact match in related fields
                        {
                            multi_match: {
                                query: keywords,
                                fields: [
                                    'categories.name',
                                    'countries.name',
                                    'directors.name',
                                    'actors.name',
                                ],
                                type: 'phrase',
                            },
                        },
                    ],
                    minimum_should_match: 1,
                },
            });
        }

        if (!isNullOrUndefined(cinemaRelease)) filter.push({ term: { cinemaRelease } });
        if (!isNullOrUndefined(isCopyright)) filter.push({ term: { isCopyright } });
        if (!isNullOrUndefined(type)) filter.push({ term: { type } });
        if (!isNullOrUndefined(status)) filter.push({ term: { status } });
        if (!isNullOrUndefined(quality)) filter.push({ term: { quality } });
        if (!isNullOrUndefined(contentRating))
            filter.push({ term: { contentRating: contentRating?.toLowerCase() } });

        filter.push(...this.processYearFilter(years));

        if (!isNullOrUndefined(categories)) {
            const categorySlugs = categories
                .split(',')
                .filter((c) => !isNullOrUndefined(c))
                .map((c) => c.trim());

            must.push({
                terms: {
                    'categories.slug.keyword': categorySlugs,
                },
            });

            // Exclude sensitive content by default
            if (!categorySlugs.includes('phim-18') && !isAdmin) {
                mustNot.push({
                    term: {
                        'categories.slug.keyword': 'phim-18',
                    },
                });
            }
        } else if (!isAdmin) {
            // Exclude sensitive content by default
            mustNot.push({
                term: {
                    'categories.slug.keyword': 'phim-18',
                },
            });
        }

        if (!isNullOrUndefined(countries)) {
            must.push({
                terms: {
                    'countries.slug.keyword': countries
                        .split(',')
                        .filter((c) => !isNullOrUndefined(c))
                        .map((c) => c.trim()),
                },
            });
        }

        if (isDeleted) {
            filter.push({ exists: { field: 'deletedAt' } });
        } else {
            must.push({
                bool: {
                    must_not: [{ exists: { field: 'deletedAt' } }],
                },
            });
        }

        return {
            bool: {
                must,
                must_not: mustNot,
                filter,
            },
        };
    }

    private async getAIFilter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        aiAnalysis: Record<string, any>,
        userFilters: {
            categories?: string;
            countries?: string;
            years?: string;
        },
    ): Promise<QueryDslQueryContainer> {
        const { categories, countries, years } = userFilters;
        const must: QueryDslQueryContainer[] = [];
        const should: QueryDslQueryContainer[] = [];
        const filter: QueryDslQueryContainer[] = [];
        const mustNot: QueryDslQueryContainer[] = [];

        // Only use AI categories suggestion when user doesn't specify categories
        if (!categories && aiAnalysis.categories?.length) {
            should.push({
                terms: {
                    'categories.slug.keyword': aiAnalysis.categories,
                    boost: 1.5,
                },
            });
        }

        // Only use AI countries suggestion when user doesn't specify countries
        if (!countries && aiAnalysis.countries?.length) {
            should.push({
                terms: {
                    'countries.slug.keyword': aiAnalysis.countries,
                    boost: 1.3,
                },
            });
        }

        // Only use AI year range when user doesn't specify years
        if (!years && aiAnalysis.yearRange) {
            const yearRange: { gte?: number; lte?: number } = {};
            if (aiAnalysis.yearRange.min) yearRange.gte = aiAnalysis.yearRange.min;
            if (aiAnalysis.yearRange.max) yearRange.lte = aiAnalysis.yearRange.max;
            if (Object.keys(yearRange).length) {
                filter.push({ range: { year: yearRange } });
            }
        }

        // Add AI entity detection filters
        if (aiAnalysis.must) {
            if (aiAnalysis.must.name?.length) {
                should.push({
                    multi_match: {
                        query: aiAnalysis.must.name.join(' '),
                        fields: ['name^3', 'originName^2'],
                        type: 'best_fields',
                        operator: 'or',
                        boost: 2,
                    },
                });
            }

            if (aiAnalysis.must.content?.length) {
                should.push({
                    match: {
                        content: {
                            query: aiAnalysis.must.content.join(' '),
                            operator: 'or',
                            minimum_should_match: '50%',
                            boost: 1.5,
                        },
                    },
                });
            }

            if (aiAnalysis.must.actors?.length) {
                should.push({
                    terms: {
                        'actors.name.keyword': aiAnalysis.must.actors,
                        boost: 1.2,
                    },
                });
            }

            if (aiAnalysis.must.directors?.length) {
                should.push({
                    terms: {
                        'directors.name.keyword': aiAnalysis.must.directors,
                        boost: 1.2,
                    },
                });
            }
        }

        if (aiAnalysis.should) {
            if (aiAnalysis.should.name?.length) {
                should.push({
                    multi_match: {
                        query: aiAnalysis.should.name.join(' '),
                        fields: ['name^2', 'originName^1.5'],
                        type: 'best_fields',
                        operator: 'or',
                    },
                });
            }

            if (aiAnalysis.should.content?.length) {
                should.push({
                    match: {
                        content: {
                            query: aiAnalysis.should.content.join(' '),
                            operator: 'or',
                            minimum_should_match: '30%',
                            boost: 1.2,
                        },
                    },
                });
            }

            if (aiAnalysis.should.actors?.length) {
                should.push({
                    terms: {
                        'actors.name.keyword': aiAnalysis.should.actors,
                        boost: 1.1,
                    },
                });
            }

            if (aiAnalysis.should.directors?.length) {
                should.push({
                    terms: {
                        'directors.name.keyword': aiAnalysis.should.directors,
                        boost: 1.1,
                    },
                });
            }
        }

        if (aiAnalysis.keywords?.length) {
            should.push({
                multi_match: {
                    query: aiAnalysis.keywords.join(' '),
                    fields: [
                        'name^3',
                        'originName^2',
                        'content^1.5',
                        'actors.name^1.2',
                        'directors.name^1.2',
                        'categories.name',
                        'countries.name',
                    ],
                    type: 'best_fields',
                    operator: 'or',
                    minimum_should_match: '30%',
                },
            });
        }

        // Set minimum_should_match if we have any should clauses
        const minimumShouldMatch = should.length > 0 ? 1 : undefined;

        return {
            bool: {
                must,
                filter,
                must_not: mustNot,
                should,
                ...(minimumShouldMatch !== undefined && {
                    minimum_should_match: minimumShouldMatch,
                }),
            },
        };
    }

    private async executeSearch(
        query: QueryDslQueryContainer,
        dto: GetMoviesAdminInput | GetMoviesInput,
        isRestful: boolean,
    ): Promise<{ data: MovieType[]; total: number }> {
        const {
            limit = 10,
            page = 1,
            sortBy = 'year',
            sortOrder = 'desc',
            keywords,
            useAI = false,
        } = dto;

        // Build sort configuration
        const sortFields = sortBy.split(',');
        const sortOrders = sortOrder.split(',');

        // Priority sorting: If using AI or keywords, prioritize relevance score
        const sort = [] as SortCombinations[];

        // Add user-specified sort fields
        sort.push(
            ...(sortFields || []).map((field, index) => {
                const order = (
                    sortOrders[index] || sortOrders[sortOrders.length - 1]
                ).toLowerCase() as 'asc' | 'desc';
                return {
                    [field.trim()]: {
                        order,
                        unmapped_type: 'keyword',
                    },
                };
            }),
        );

        // If using AI or keywords search, prioritize relevance score
        if (useAI || keywords) {
            sort.push({
                _score: { order: 'desc' },
            });
        }

        // Add default sort as fallback
        sort.push({
            default: {
                order: 'desc' as const,
                unmapped_type: 'keyword',
            },
        });

        // Set minimum score for relevance filtering when using keywords or AI
        const minScore = useAI || keywords ? 0.3 : undefined;

        this.logger.log({ query, sort });
        const body = await this.elasticsearchService.search({
            index: 'movies',
            body: {
                query,
                sort,
                from: (page - 1) * Math.min(limit, 500),
                size: Math.min(limit, 500),
                track_total_hits: true,
                ...(minScore && { min_score: minScore }),
            },
        });

        let movies = body.hits.hits.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (hit) => new MovieType({ ...(hit as any)?.['_source'], _id: hit?._id }),
        );

        const total = (body.hits.total as SearchTotalHits).value;

        if (isRestful) {
            movies = movies?.map(
                (movie) =>
                    ({
                        _id: movie?._id,
                        slug: movie?.slug,
                        name: movie?.name,
                        originName: movie?.originName,
                        quality: movie?.quality,
                        year: movie?.year,
                        lastSyncModified: movie?.lastSyncModified,
                        createdAt: movie?.createdAt,
                        updatedAt: movie?.updatedAt,
                    } as MovieType),
            );
        }

        const res = {
            data: movies,
            total,
            count: movies?.length || 0,
        };

        return res;
    }

    async updateView(slug: string) {
        const movie = await this.movieRepo.findOneOrThrow({ filterQuery: { slug } });
        const movieUpdated = await this.movieRepo.findOneAndUpdateOrThrow({
            filterQuery: { slug },
            updateQuery: { view: (movie?.view || 0) + 1, lastViewChange: new Date() },
        });
        return {
            status: 'success',
            view: movie?.view || 0,
            newView: movieUpdated?.view || 0,
        };
    }

    async updateMovie(input: UpdateMovieInput): Promise<MovieType> {
        const {
            _id,
            actors,
            categories,
            countries,
            directors,
            deletedAt,
            contentRating,
            ...restUpdateData
        } = input;
        const movieToUpdate: Partial<Movie> = {
            ...restUpdateData,
            ...(contentRating && { contentRating: mappingContentRating(contentRating) }),
        };

        if (actors) {
            movieToUpdate.actors = actors?.map((c) => convertToObjectId(c));
        }
        if (categories) {
            movieToUpdate.categories = categories?.map((c) => convertToObjectId(c));
        }
        if (directors) {
            movieToUpdate.directors = directors?.map((c) => convertToObjectId(c));
        }
        if (countries) {
            movieToUpdate.countries = countries?.map((c) => convertToObjectId(c));
        }

        if (!isNullOrUndefined(deletedAt)) {
            if (deletedAt === 'delete') {
                movieToUpdate.deletedAt = new Date();
            } else if (deletedAt === 'restore') {
                movieToUpdate.deletedAt = null;
            }
        }

        const updatedMovie = await this.movieRepo.findOneAndUpdateOrThrow({
            filterQuery: { _id: convertToObjectId(_id) },
            updateQuery: { $set: { ...movieToUpdate, updatedAt: new Date() } },
            queryOptions: {
                new: true,
                populate: [
                    { path: 'actors', justOne: false },
                    { path: 'categories', justOne: false },
                    { path: 'countries', justOne: false },
                    { path: 'directors', justOne: false },
                ],
            },
        });
        await this.revalidateMovies({ movieSlug: [updatedMovie.slug] });

        return new MovieType(updatedMovie as unknown as MovieType);
    }

    async hardDeleteMovie(input: MutateHardDeleteMovieInput) {
        const movie = await this.movieRepo.findOneOrThrow({
            filterQuery: { _id: convertToObjectId(input._id) },
        });

        await Promise.allSettled([
            this.movieRepo.deleteOne({ _id: movie._id }),
            this.searchService.deleteMovie({ _id: movie._id }),
        ]);
        await this.revalidateMovies({ movieSlug: [movie.slug] });
        return 1;
    }

    /**
     * Analyze the search query using Google's Generative AI models.
     * @param query The search query to be analyzed.
     * @returns The analyzed result as a JSON object, or null if all models failed.
     * @throws if the Google API Key is not provided.
     * @private
     */
    private async analyzeSearchQuery({
        keywords,
        categories,
        countries,
        years,
    }: {
        keywords: string;
        categories?: string;
        countries?: string;
        years?: string;
    }) {
        if (!this.genAI) {
            this.logger.warn('Google API Key not provided. Skipping AI analysis.');
            return null;
        }

        for (const modelName of this.AI_MODELS) {
            try {
                this.logger.log(`[AI] Attempting to use model: ${modelName}`);
                const model = this.genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemInstruction,
                    generationConfig: {
                        temperature: 0.3,
                        topK: 35,
                        topP: 0.8,
                    },
                });

                let content = `User's query: "${keywords?.trim()}".`;
                if (categories) {
                    content += ` Categories: "${categories?.trim()}".`;
                }
                if (countries) {
                    content += ` Countries: "${countries?.trim()}".`;
                }
                if (years) {
                    content += ` Years: "${years?.trim()}".`;
                }

                const result = await model.generateContent({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: content }],
                        },
                    ],
                });
                const text = result.response.text();
                this.logger.log(
                    `[AI] Response from model ${modelName}: ${text.substring(0, 100)}...`,
                );

                try {
                    const jsonResult = extractJSON(text);
                    if (jsonResult) {
                        this.logger.log(`[AI] Successfully extracted JSON from model ${modelName}`);
                        return jsonResult;
                    } else {
                        this.logger.warn(
                            `[AI] No valid JSON found in response from model ${modelName}`,
                        );
                        // Continue to the next model if no JSON found
                    }
                } catch (error) {
                    this.logger.error(
                        `[AI] Failed to parse AI response from model ${modelName}: ${error}`,
                    );
                    this.logger.error(`[AI] Raw response: ${text.substring(0, 500)}...`);
                    // Continue to the next model if JSON parsing fails
                }
            } catch (error) {
                // Check for specific error types
                if (error instanceof Error) {
                    const errorMessage = error.message || '';
                    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
                        this.logger.error(
                            `[AI] Model ${modelName} quota or limit exceeded: ${errorMessage}`,
                        );
                    } else if (
                        errorMessage.includes('not found') ||
                        errorMessage.includes('does not exist')
                    ) {
                        this.logger.error(`[AI] Model ${modelName} not found: ${errorMessage}`);
                    } else if (
                        errorMessage.includes('permission') ||
                        errorMessage.includes('access')
                    ) {
                        this.logger.error(
                            `[AI] Permission denied for model ${modelName}: ${errorMessage}`,
                        );
                    } else {
                        this.logger.error(`[AI] Error with model ${modelName}: ${errorMessage}`);
                    }
                } else {
                    this.logger.error(`[AI] Unknown error with model ${modelName}: ${error}`);
                }

                // Continue to the next model regardless of error type
                this.logger.log(
                    `[AI] Switching to next model in the list after error with ${modelName}`,
                );
            }
        }

        this.logger.error('[AI] All AI models failed. Returning null.');
        return null;
    }

    protected async revalidateMovies({
        movieSlug,
        tag = null,
    }: {
        movieSlug: string[];
        tag?: string;
    }) {
        try {
            const res = await this.httpService.axiosRef.post(
                this.configService.getOrThrow<string>('REVALIDATE_WEBHOOK_URL'),
                { movieSlug, tags: tag ? [tag] : [] },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.configService.getOrThrow<string>('REVALIDATE_API_KEY'),
                    },
                },
            );

            if (res?.status !== 200) {
                this.logger.error(`Failed to revalidate on front-end side: ${res.statusText}`);
                return;
            }
        } catch (error) {
            this.logger.error(`Error during revalidateMovies: ${error}`);
        }
    }

    async countMovies(): Promise<number> {
        return this.movieRepo.countDocuments({});
    }

    async countCategories(): Promise<number> {
        const aggregation = await this.movieRepo.aggregate<{ count: number }>([
            { $unwind: '$categories' },
            { $group: { _id: '$categories._id' } },
            { $count: 'count' },
        ]);

        return aggregation.length > 0 ? aggregation[0].count : 0;
    }

    async countMoviesByType(): Promise<{ type: string; count: number }[]> {
        const aggregation = await this.movieRepo.aggregate<{ _id: string; count: number }>([
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        return aggregation.map((item) => ({
            type: item._id,
            count: item.count,
        }));
    }

    async getTopViewedMovies(limit = 5): Promise<any[]> {
        const movies = await this.movieRepo.find({
            filterQuery: {},
            queryOptions: {
                sort: { view: -1 },
                limit,
            },
        });

        return movies.map((movie) => ({
            _id: movie._id.toString(),
            name: movie.name,
            slug: movie.slug,
            thumbUrl: movie.thumbUrl,
            view: movie.view,
        }));
    }

    async countMoviesByDateRange(startDate: Date, endDate: Date): Promise<number> {
        return this.movieRepo.countDocuments({
            createdAt: { $gte: startDate, $lt: endDate },
        });
    }

    /**
     * Gets accurate count of movies created today
     */
    async countMoviesCreatedBetween(startDate: Date, endDate: Date): Promise<number> {
        return this.movieRepo.countDocuments({
            createdAt: { $gte: startDate, $lt: endDate },
        });
    }

    /**
     * Gets accurate count of movies updated today
     */
    async countMoviesUpdatedBetween(startDate: Date, endDate: Date): Promise<number> {
        return this.movieRepo.countDocuments({
            updatedAt: { $gte: startDate, $lt: endDate },
            createdAt: { $lt: startDate }, // Ensure we only count updates, not new creations
        });
    }

    async getTrendingMovies(startDate: Date, limit = 5): Promise<any[]> {
        // Enhanced implementation that uses the actual update date
        // and view count to determine trending movies
        const movies = await this.movieRepo.find({
            filterQuery: {
                lastViewChange: { $gte: startDate },
            },
            queryOptions: {
                sort: { view: -1, lastViewChange: -1 },
                limit,
            },
        });

        // Return more detailed information about trending movies
        return movies.map((movie) => ({
            _id: movie._id.toString(),
            name: movie.name,
            slug: movie.slug,
            thumbUrl: movie.thumbUrl,
            viewsToday: movie.view,
            updatedAt: movie.updatedAt,
        }));
    }

    async getRecentlyUpdatedMovies(limit = 5): Promise<any[]> {
        return this.movieRepo.find({
            filterQuery: {},
            queryOptions: {
                sort: { updatedAt: -1 },
                limit,
            },
        });
    }

    async getRecentlyAddedMovies(limit = 5): Promise<any[]> {
        return this.movieRepo.find({
            filterQuery: {},
            queryOptions: {
                sort: { createdAt: -1 },
                limit,
            },
        });
    }

    private async combineAIWithUserFilters(
        aiFilter: QueryDslQueryContainer,
        dto: GetMoviesAdminInput | GetMoviesInput,
        isAdmin = false,
    ): Promise<QueryDslQueryContainer> {
        const {
            keywords,
            cinemaRelease,
            isCopyright,
            type,
            years,
            categories,
            countries,
            status,
            quality,
            contentRating,
            isDeleted = false,
            useAI = false,
        } = { isDeleted: false, ...dto };

        const must: QueryDslQueryContainer[] = [];
        const mustNot: QueryDslQueryContainer[] = [];
        const filter: QueryDslQueryContainer[] = [];
        const should: QueryDslQueryContainer[] = [];

        // Only use direct keyword search when not in AI mode
        // In AI mode, keywords are already processed by the AI to create better semantic filters
        if (keywords && !useAI) {
            must.push({
                bool: {
                    should: [
                        // Stage 1: Exact phrase match in name and originName
                        {
                            multi_match: {
                                query: keywords,
                                fields: ['name', 'originName'],
                                type: 'phrase',
                            },
                        },
                        // Stage 2: Partial phrase match in name and originName
                        {
                            multi_match: {
                                query: keywords,
                                fields: ['name', 'originName'],
                                type: 'phrase_prefix',
                            },
                        },
                        // Stage 3: Term match in slug and content
                        {
                            multi_match: {
                                query: keywords,
                                fields: ['slug', 'content'],
                                type: 'best_fields',
                                operator: 'and',
                            },
                        },
                        // Stage 4: Exact match in related fields
                        {
                            multi_match: {
                                query: keywords,
                                fields: [
                                    'categories.name',
                                    'countries.name',
                                    'directors.name',
                                    'actors.name',
                                ],
                                type: 'phrase',
                            },
                        },
                    ],
                    minimum_should_match: 1,
                },
            });
        }

        if (!isNullOrUndefined(cinemaRelease)) filter.push({ term: { cinemaRelease } });
        if (!isNullOrUndefined(isCopyright)) filter.push({ term: { isCopyright } });
        if (!isNullOrUndefined(type)) filter.push({ term: { type } });
        if (!isNullOrUndefined(status)) filter.push({ term: { status } });
        if (!isNullOrUndefined(quality)) filter.push({ term: { quality } });
        if (!isNullOrUndefined(contentRating))
            filter.push({ term: { contentRating: contentRating?.toLowerCase() } });

        filter.push(...this.processYearFilter(years));

        if (!isNullOrUndefined(categories)) {
            const categorySlugs = categories
                .split(',')
                .filter((c) => !isNullOrUndefined(c))
                .map((c) => c.trim());

            must.push({
                terms: {
                    'categories.slug.keyword': categorySlugs,
                },
            });

            // Exclude sensitive content by default
            if (!categorySlugs.includes('phim-18') && !isAdmin) {
                mustNot.push({
                    term: {
                        'categories.slug.keyword': 'phim-18',
                    },
                });
            }
        } else if (!isAdmin) {
            // Exclude sensitive content by default
            mustNot.push({
                term: {
                    'categories.slug.keyword': 'phim-18',
                },
            });
        }

        if (!isNullOrUndefined(countries)) {
            must.push({
                terms: {
                    'countries.slug.keyword': countries
                        .split(',')
                        .filter((c) => !isNullOrUndefined(c))
                        .map((c) => c.trim()),
                },
            });
        }

        if (isDeleted) {
            filter.push({ exists: { field: 'deletedAt' } });
        } else {
            must.push({
                bool: {
                    must_not: [{ exists: { field: 'deletedAt' } }],
                },
            });
        }

        // Extract all AI filter parts
        if (aiFilter.bool) {
            // Handle AI must clauses - keep only those that don't conflict with user filters
            if (aiFilter.bool.must) {
                const aiMust = Array.isArray(aiFilter.bool.must)
                    ? aiFilter.bool.must
                    : [aiFilter.bool.must];

                // Move AI must clauses to should for boosting relevance without requiring matches
                should.push(...aiMust);
            }

            // Add AI should clauses directly to our should array
            if (aiFilter.bool.should) {
                const aiShould = Array.isArray(aiFilter.bool.should)
                    ? aiFilter.bool.should
                    : [aiFilter.bool.should];

                should.push(...aiShould);
            }

            // Add AI filter clauses to our filter array
            if (aiFilter.bool.filter) {
                const aiFilter2 = Array.isArray(aiFilter.bool.filter)
                    ? aiFilter.bool.filter
                    : [aiFilter.bool.filter];

                filter.push(...aiFilter2);
            }

            // Add AI must_not clauses to our mustNot array
            if (aiFilter.bool.must_not) {
                const aiMustNot = Array.isArray(aiFilter.bool.must_not)
                    ? aiFilter.bool.must_not
                    : [aiFilter.bool.must_not];

                mustNot.push(...aiMustNot);
            }
        }

        // Set minimum_should_match if we have any should clauses
        const minimumShouldMatch = should.length > 0 ? 1 : undefined;

        return {
            bool: {
                must,
                must_not: mustNot,
                filter,
                should,
                ...(minimumShouldMatch !== undefined && {
                    minimum_should_match: minimumShouldMatch,
                }),
            },
        };
    }

    async isImageInUse(url: string) {
        const movie = await this.movieRepo.findOne({
            filterQuery: {
                $or: [{ thumbUrl: url }, { posterUrl: url }],
            },
        });
        if (movie) {
            return true;
        }

        return false;
    }
}
