/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpService } from '@nestjs/axios';
import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import slugify from 'slugify';
import { removeDiacritics, removeTone } from '@vn-utils/text';
import { Types } from 'mongoose';
import type { MovieReleaseDatesResponse, ShowContentRatingResponse } from 'moviedb-promise';
import { Movie as OPhimMovie } from 'ophim-js';

import { RedisService } from '../../../libs/modules/redis';
import { MovieRepository } from '../../movies/movie.repository';
import { ActorRepository } from '../../actors';
import { CategoryRepository } from '../../categories';
import { DirectorRepository } from '../../directors';
import { RegionRepository } from '../../regions/region.repository';
import { Episode, EpisodeServerData, Movie } from '../../movies/movie.schema';
import {
    isNullOrUndefined,
    resolveUrl,
    sleep,
    slugifyVietnamese,
} from '../../../libs/utils/common';
import { determineContentRating, mappingNameSlugEpisode } from '../mapping-data';
import { TmdbService } from '../../../libs/modules/themoviedb.org/tmdb.service';
import { ImdbType, TmdbType } from '../../movies/movie.type';
import { MovieContentRatingEnum } from '../../movies/movie.constant';

export interface ICrawlerConfig {
    name: string;
    host: string;
    cronSchedule: string;
    forceUpdate: boolean;
    imgHost?: string;
    maxRetries?: number;
    rateLimitDelay?: number;
    maxConcurrentRequests?: number;
    maxContinuousSkips?: number;
}

export interface ICrawlerDependencies {
    config: ICrawlerConfig;
    configService: ConfigService;
    schedulerRegistry: SchedulerRegistry;
    redisService: RedisService;
    httpService: HttpService;
    movieRepo: MovieRepository;
    actorRepo: ActorRepository;
    categoryRepo: CategoryRepository;
    directorRepo: DirectorRepository;
    regionRepo: RegionRepository;
    tmdbService: TmdbService;
}

export interface ICrawlerStatus {
    isRunning: boolean;
    lastRun?: Date;
    currentPage?: number;
    totalPages?: number;
    processedItems: number;
    failedItems: number;
    startTime?: Date;
    endTime?: Date;
    error?: string;
}

export abstract class BaseCrawler implements OnModuleInit, OnModuleDestroy {
    protected readonly logger: Logger;
    protected readonly RETRY_DELAY = 5000;
    protected readonly REVALIDATION_BATCH_SIZE = 40;
    protected moviesToRevalidate: string[] = [];

    protected readonly config: ICrawlerConfig;
    protected readonly configService: ConfigService;
    protected readonly schedulerRegistry: SchedulerRegistry;
    protected readonly redisService: RedisService;
    protected readonly httpService: HttpService;
    protected readonly movieRepo: MovieRepository;
    protected readonly actorRepo: ActorRepository;
    protected readonly categoryRepo: CategoryRepository;
    protected readonly directorRepo: DirectorRepository;
    protected readonly regionRepo: RegionRepository;
    protected readonly tmdbService: TmdbService;

    private crawlerJob: CronJob;
    private isCrawling = false;
    private status: ICrawlerStatus = {
        isRunning: false,
        processedItems: 0,
        failedItems: 0,
    };
    private requestQueue: Promise<void>[] = [];
    private activeRequests = 0;
    private continuousSkips = 0;

    constructor(protected readonly dependencies: ICrawlerDependencies) {
        this.validateConfig(dependencies.config);

        this.config = {
            maxRetries: 3,
            rateLimitDelay: 1000,
            maxConcurrentRequests: 3,
            maxContinuousSkips: parseInt(
                dependencies.configService.get('MAX_CONTINUOUS_SKIPS') || '100',
            ),
            ...dependencies.config,
        };

        this.configService = dependencies.configService;
        this.schedulerRegistry = dependencies.schedulerRegistry;
        this.redisService = dependencies.redisService;
        this.httpService = dependencies.httpService;
        this.movieRepo = dependencies.movieRepo;
        this.actorRepo = dependencies.actorRepo;
        this.categoryRepo = dependencies.categoryRepo;
        this.directorRepo = dependencies.directorRepo;
        this.regionRepo = dependencies.regionRepo;
        this.tmdbService = dependencies.tmdbService;

        this.logger = new Logger(this.config.name);
        this.logger.log({
            host: this.config.host,
            cron: this.config.cronSchedule,
            forceUpdate: this.config.forceUpdate,
            timeZone: process.env.TZ,
            tzOffset: new Date().getTimezoneOffset(),
            maxContinuousSkips: this.config.maxContinuousSkips,
        });
    }

    private validateConfig(config: ICrawlerConfig) {
        if (!config.name) throw new Error('Crawler name is required');
        if (!config.host) throw new Error('Crawler host is required');
        if (!config.cronSchedule) throw new Error('Crawler cron schedule is required');
        if (typeof config.forceUpdate !== 'boolean')
            throw new Error('forceUpdate must be a boolean');
    }

    private get jobName(): string {
        return `${this.crawlMovies.name}_${this.config.name}`;
    }

    private async enqueueRequest<T>(request: () => Promise<T>): Promise<T> {
        while (this.activeRequests >= this.config.maxConcurrentRequests) {
            await sleep(100);
        }

        this.activeRequests++;
        try {
            await sleep(this.config.rateLimitDelay);
            return await request();
        } finally {
            this.activeRequests--;
        }
    }

    /**
     * Check if this crawler is enabled based on configuration.
     * Override this method to implement custom enable/disable logic.
     * By default, checks:
     * 1. Global DISABLE_CRAWL flag
     * 2. EXCLUDE_MOVIE_SRC list
     * 3. Crawler-specific disable flag (DISABLE_[NAME]_CRAWL)
     */
    protected isEnabled(): boolean {
        // Check global crawler disable flag
        const disableCrawl = this.configService.get<string>('DISABLE_CRAWL');
        if (disableCrawl === 'true') {
            return false;
        }

        // Check excluded movie sources
        const excludedSources = this.configService.get<string>('EXCLUDE_MOVIE_SRC');
        if (excludedSources) {
            const excludedList = excludedSources.split(',').map((s) => s.trim().toLowerCase());
            if (excludedList.includes(this.config.name.toLowerCase())) {
                return false;
            }
        }

        // Check specific crawler disable flag
        const specificDisableFlag = this.configService.get<string>(
            `DISABLE_${this.config.name.toUpperCase()}_CRAWL`,
        );
        if (specificDisableFlag === 'true') {
            return false;
        }

        return this.shouldEnable();
    }

    /**
     * Override this method to implement custom enable/disable logic for specific crawlers.
     * This will be called after checking the standard disable flags.
     * @returns boolean - true if the crawler should be enabled, false otherwise
     */
    protected abstract shouldEnable(): boolean;

    onModuleInit() {
        if (!this.isEnabled()) {
            this.logger.warn(`Crawler ${this.config.name} is disabled by configuration`);
            return;
        }

        // Check if the crawler was auto-stopped due to continuous skips
        const autoStopKey = `crawler:${this.config.name}:auto-stopped`;
        this.redisService.get(autoStopKey).then((lastStopTime) => {
            if (lastStopTime) {
                const stopTime = new Date(lastStopTime);
                const hoursSinceStop =
                    (new Date().getTime() - stopTime.getTime()) / (1000 * 60 * 60);

                // If it's been less than 20 hours since auto-stop, don't restart
                if (hoursSinceStop < 20) {
                    this.logger.warn(
                        `Crawler ${this.config.name} was auto-stopped ${Math.round(
                            hoursSinceStop,
                        )} hours ago due to no updates. Will not restart until 20 hours have passed.`,
                    );
                    return;
                } else {
                    // Clear the auto-stop flag and start normally
                    this.redisService.del(autoStopKey);
                }
            }

            this.crawlerJob = new CronJob(this.config.cronSchedule, this.crawlMovies.bind(this));
            this.schedulerRegistry.addCronJob(this.jobName, this.crawlerJob);
            this.crawlerJob.start();
        });
    }

    onModuleDestroy() {
        if (this.schedulerRegistry.doesExist('cron', this.jobName)) {
            this.schedulerRegistry.deleteCronJob(this.jobName);
        }
    }

    /**
     * Manually trigger a crawl operation
     * @returns Promise that resolves when crawling is complete
     */
    public async triggerCrawl(): Promise<void> {
        if (!this.isEnabled()) {
            this.logger.warn(
                `Cannot trigger crawl: Crawler ${this.config.name} is disabled by configuration`,
            );
            return;
        }

        if (this.isCrawling) {
            this.logger.warn('Crawler is already running');
            return;
        }
        return this.crawl();
    }

    /**
     * Stop the crawler's cron job
     */
    public stopCrawler(): void {
        if (this.crawlerJob) {
            this.crawlerJob.stop();
            this.logger.log('Crawler stopped');
        }
    }

    /**
     * Resume the crawler's cron job, clearing any auto-stop state
     */
    public async resumeCrawler(): Promise<void> {
        if (!this.isEnabled()) {
            this.logger.warn(
                `Cannot resume: Crawler ${this.config.name} is disabled by configuration`,
            );
            return;
        }

        // Clear the auto-stop flag
        const autoStopKey = `crawler:${this.config.name}:auto-stopped`;
        await this.redisService.del(autoStopKey);

        if (!this.crawlerJob) {
            this.crawlerJob = new CronJob(this.config.cronSchedule, this.crawlMovies.bind(this));
            this.schedulerRegistry.addCronJob(this.jobName, this.crawlerJob);
        }

        if (!this.crawlerJob.running) {
            this.crawlerJob.start();
            this.logger.log('Crawler resumed');
        }
    }

    protected async crawl() {
        if (this.isCrawling) {
            this.logger.warn('Crawler is already running');
            return;
        }

        this.isCrawling = true;
        this.status = {
            isRunning: true,
            processedItems: 0,
            failedItems: 0,
            startTime: new Date(),
        };
        this.continuousSkips = 0;

        const today = new Date().toISOString().slice(0, 10);
        const crawlKey = `crawled-pages:${this.config.host.replace('https://', '')}:${today}`;

        try {
            const latestMovies = await this.enqueueRequest(() => this.getNewestMovies(1));
            const totalPages = this.getTotalPages(latestMovies);
            this.status.totalPages = totalPages;

            let lastCrawledPage = 0;
            try {
                lastCrawledPage = parseInt(await this.redisService.get(crawlKey)) || 0;
            } catch (error) {
                this.logger.error(`Error getting last crawled page from Redis: ${error}`);
            }

            for (let i = lastCrawledPage; i <= totalPages; i++) {
                this.status.currentPage = i;
                await this.crawlPage(i);
                await this.redisService.set(crawlKey, i, 60 * 60 * 24 * 1000);

                if (this.continuousSkips >= this.config.maxContinuousSkips) {
                    this.logger.warn(
                        `Stopping crawler: ${this.continuousSkips} movies skipped continuously without updates`,
                    );

                    // Stop the cron job
                    if (this.crawlerJob && this.schedulerRegistry.doesExist('cron', this.jobName)) {
                        this.crawlerJob.stop();
                        this.logger.log(`Stopped cron job ${this.jobName}`);

                        // Set a Redis key to remember that this crawler was auto-stopped
                        const autoStopKey = `crawler:${this.config.name}:auto-stopped`;
                        await this.redisService.set(autoStopKey, new Date().toISOString());
                    }
                    break;
                }

                if (
                    this.moviesToRevalidate.length > 0 &&
                    this.moviesToRevalidate.length >= this.REVALIDATION_BATCH_SIZE
                ) {
                    await this.revalidateMovies();
                }
            }

            // Retry failed movies and pages
            await this.retryFailedCrawls();
            await this.retryFailedPages();

            if (this.moviesToRevalidate.length > 0) {
                await this.revalidateMovies();
            }
        } catch (error) {
            this.logger.error(`Error crawling movies: ${error}`);
            this.status.error = error.message;
        } finally {
            this.isCrawling = false;
            this.status.isRunning = false;
            this.status.endTime = new Date();
        }
    }

    protected abstract crawlMovies(): Promise<void>;
    protected abstract getNewestMovies(page: number): Promise<any>;
    protected abstract fetchAndSaveMovieDetail(slug: string, retryCount?: number): Promise<boolean>;
    /**
     * Save movie details to the database
     * @param movieDetail The movie details to save
     * @returns boolean - true if the movie was updated/created, false if skipped
     */
    protected abstract saveMovieDetail(movieDetail: any): Promise<boolean>;
    protected abstract getTotalPages(response: any): number;
    protected abstract getMovieItems(response: any): any[];

    protected async processImages(
        data: {
            thumbUrl?: string;
            posterUrl?: string;
            host?: string;
            tmdb?: TmdbType;
        },
        options?: { preferTmdb?: boolean },
    ): Promise<{ thumbUrl: string; posterUrl: string }> {
        const preferTmdb = options?.preferTmdb || false;

        // If both thumbUrl and posterUrl are provided and we prefer manual images, return them immediately
        if (!preferTmdb && data?.thumbUrl && data?.posterUrl) {
            return {
                thumbUrl: resolveUrl(data?.thumbUrl, data.host),
                posterUrl: resolveUrl(data?.posterUrl, data.host),
            };
        }

        // Get TMDB images (either as primary source or fallback)
        const tmdbImages = await this.tmdbService.getImages({
            id: data?.tmdb?.id,
            type: data?.tmdb?.type,
        });

        // Process thumbnail image
        let thumb =
            !isNullOrUndefined(data?.thumbUrl) && data?.thumbUrl?.trim() !== ''
                ? resolveUrl(data?.thumbUrl, data.host)
                : null;
        let poster =
            !isNullOrUndefined(data?.posterUrl) && data?.posterUrl?.trim() !== ''
                ? resolveUrl(data?.posterUrl, data.host)
                : null;

        const tmdbBackdrops = (tmdbImages?.backdrops || []).filter((b) => b?.file_path);
        const tmdbThumb =
            tmdbBackdrops?.length > 0
                ? resolveUrl(tmdbBackdrops[0].file_path, this.tmdbService.config.imgHost)
                : null;

        const tmdbPosters = (tmdbImages?.posters || []).filter((p) => p?.file_path);
        const tmdbPoster =
            tmdbPosters?.length > 0
                ? resolveUrl(tmdbPosters[0].file_path, this.tmdbService.config.imgHost)
                : null;

        // If preferring TMDB, use TMDB images first, then fall back to manual
        if (preferTmdb) {
            thumb = tmdbThumb || thumb;
            poster = tmdbPoster || poster;
        } else {
            // Original behavior: use manual images first, then fall back to TMDB
            thumb = thumb || tmdbThumb;
            poster = poster || tmdbPoster;
        }

        return {
            thumbUrl: thumb,
            posterUrl: poster,
        };
    }

    protected async crawlPage(page: number) {
        try {
            const movies = await this.enqueueRequest(() => this.getNewestMovies(page));
            const items = this.getMovieItems(movies).map((m) => ({
                ...m,
                slug: slugifyVietnamese(m.slug),
            }));

            await Promise.all(
                items.map(async (movie) => {
                    if (movie?.slug) {
                        try {
                            const wasUpdated = await this.fetchAndSaveMovieDetail(movie.slug);
                            if (wasUpdated) {
                                this.status.processedItems++;
                                // Reset continuous skips when a movie is updated
                                this.resetSkipCount();
                            } else {
                                // Only increment skip count if movie was not updated
                                this.incrementSkipCount();
                            }
                        } catch (error) {
                            this.status.failedItems++;
                            this.logger.error(`Error processing movie ${movie.slug}: ${error}`);
                            await this.addToFailedCrawls(movie.slug, error.message);
                            // Continue with next movie instead of throwing
                        }
                    } else {
                        // Invalid movie (no slug), count as skip
                        this.incrementSkipCount();
                    }
                }),
            );
        } catch (error) {
            this.logger.error(`Error crawling page ${page}: ${error}`);
            await this.addToFailedPages(page, error.message);
            // Don't retry immediately, let the retry mechanism handle it
        }
    }

    protected calculateBackoff(retryCount: number): number {
        const baseDelay = 1000;
        const maxDelay = 60000;
        const exponentialDelay = Math.min(maxDelay, baseDelay * Math.pow(2, retryCount));
        const jitter = Math.random() * 1000;
        return exponentialDelay + jitter;
    }

    protected async addToFailedCrawls(slug: string, error: string) {
        try {
            const hostStr = this.config.host.replace('https://', '');
            const key = `failed-movie-crawls:${hostStr}`;
            await this.redisService.getClient.hset(
                key,
                slug,
                JSON.stringify({
                    error,
                    retryCount: 0,
                    lastAttempt: new Date().toISOString(),
                }),
            );
            await this.redisService.getClient.expire(key, 60 * 60 * 24); // 24 hours expiry
        } catch (error) {
            this.logger.error(`Error adding slug ${slug} to failed crawls: ${error}`);
        }
    }

    protected async addToFailedPages(page: number, error: string) {
        try {
            const hostStr = this.config.host.replace('https://', '');
            const key = `failed-pages:${hostStr}`;
            await this.redisService.getClient.hset(
                key,
                page.toString(),
                JSON.stringify({
                    error,
                    retryCount: 0,
                    lastAttempt: new Date().toISOString(),
                }),
            );
            await this.redisService.getClient.expire(key, 60 * 60 * 24); // 24 hours expiry
        } catch (error) {
            this.logger.error(`Error adding page ${page} to failed pages: ${error}`);
        }
    }

    protected async retryFailedCrawls() {
        try {
            const hostStr = this.config.host.replace('https://', '');
            const failedMoviesKey = `failed-movie-crawls:${hostStr}`;

            // Get all failed movies
            const failedMovies = await this.redisService.getClient.hgetall(failedMoviesKey);
            if (!failedMovies) return;

            for (const [slug, dataStr] of Object.entries(failedMovies)) {
                try {
                    const data = JSON.parse(dataStr);
                    if (data.retryCount >= this.config.maxRetries) {
                        this.logger.warn(`Max retries reached for movie ${slug}, skipping`);
                        continue;
                    }

                    // Add exponential backoff delay
                    const backoffDelay = this.calculateBackoff(data.retryCount);
                    await sleep(backoffDelay);

                    const success = await this.fetchAndSaveMovieDetail(slug);
                    if (success) {
                        await this.redisService.getClient.hdel(failedMoviesKey, slug);
                        this.logger.log(`Successfully retried and saved movie: ${slug}`);
                    } else {
                        // Update retry count
                        data.retryCount++;
                        data.lastAttempt = new Date().toISOString();
                        await this.redisService.getClient.hset(
                            failedMoviesKey,
                            slug,
                            JSON.stringify(data),
                        );
                    }
                } catch (error) {
                    this.logger.error(`Error retrying movie ${slug}: ${error}`);
                    // Update retry count even on error
                    const data = JSON.parse(dataStr);
                    data.retryCount++;
                    data.lastAttempt = new Date().toISOString();
                    data.error = error.message;
                    await this.redisService.getClient.hset(
                        failedMoviesKey,
                        slug,
                        JSON.stringify(data),
                    );
                }
            }
        } catch (error) {
            this.logger.error(`Error during retryFailedCrawls: ${error}`);
        }
    }

    protected async retryFailedPages() {
        try {
            const hostStr = this.config.host.replace('https://', '');
            const failedPagesKey = `failed-pages:${hostStr}`;

            // Get all failed pages
            const failedPages = await this.redisService.getClient.hgetall(failedPagesKey);
            if (!failedPages) return;

            for (const [pageStr, dataStr] of Object.entries(failedPages)) {
                try {
                    const data = JSON.parse(dataStr);
                    if (data.retryCount >= this.config.maxRetries) {
                        this.logger.warn(`Max retries reached for page ${pageStr}, skipping`);
                        continue;
                    }

                    // Add exponential backoff delay
                    const backoffDelay = this.calculateBackoff(data.retryCount);
                    await sleep(backoffDelay);

                    const page = parseInt(pageStr);
                    await this.crawlPage(page);
                    await this.redisService.getClient.hdel(failedPagesKey, pageStr);
                    this.logger.log(`Successfully retried page: ${page}`);
                } catch (error) {
                    this.logger.error(`Error retrying page ${pageStr}: ${error}`);
                    // Update retry count
                    const data = JSON.parse(dataStr);
                    data.retryCount++;
                    data.lastAttempt = new Date().toISOString();
                    data.error = error.message;
                    await this.redisService.getClient.hset(
                        failedPagesKey,
                        pageStr,
                        JSON.stringify(data),
                    );
                }
            }
        } catch (error) {
            this.logger.error(`Error during retryFailedPages: ${error}`);
        }
    }

    protected async revalidateMovies() {
        try {
            const res = await this.httpService.axiosRef.post(
                this.configService.getOrThrow<string>('REVALIDATE_WEBHOOK_URL'),
                { movieSlug: this.moviesToRevalidate },
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

            this.logger.log(
                `Revalidated on front-end side: ${this.moviesToRevalidate.length} movies - ${res.statusText}`,
            );
            this.moviesToRevalidate = [];
        } catch (error) {
            this.logger.error(`Error during revalidateMovies: ${error}`);
        }
    }

    protected processEpisodes(newEpisodes: any[], existingEpisodes: Episode[] = []): Episode[] {
        const processedEpisodes: Episode[] = [...existingEpisodes];
        const existingServers = new Map(
            existingEpisodes?.map((ep) => [`${ep.serverName}-${ep.originSrc}`, ep]),
        );

        (newEpisodes || []).forEach((episode) => {
            if (!episode || !episode.server_name) return;

            const serverName = episode.server_name;
            const originSrc = this.config.name.toLowerCase();

            const serverData = (episode.server_data || episode.items || [])
                .filter(
                    (item: any) =>
                        item && (item.link_embed || item.embed || item.link_m3u8 || item.m3u8),
                )
                ?.map((item: any, index): EpisodeServerData => {
                    const { name, slug } = mappingNameSlugEpisode(item, index);
                    return {
                        name: name,
                        slug: slug,
                        filename: item.name || item.filename || '',
                        linkEmbed: item.link_embed || item.embed || '',
                        linkM3u8: item.link_m3u8 || item.m3u8 || '',
                    };
                });

            if (serverData.length === 0) return;

            const serverKey = `${serverName}-${originSrc}`;

            if (existingServers.has(serverKey)) {
                const existingEpisode = existingServers.get(serverKey);
                existingEpisode.serverData = [
                    ...existingEpisode.serverData,
                    ...serverData.filter(
                        (newData) =>
                            !existingEpisode.serverData.some(
                                (existingData) => existingData.slug === newData.slug,
                            ),
                    ),
                ];
            } else {
                processedEpisodes.push({
                    originSrc: originSrc,
                    serverName: serverName,
                    serverData,
                });
            }
        });

        return processedEpisodes;
    }

    /**
     * Call this method when a movie is skipped due to no updates needed
     */
    protected incrementSkipCount(): void {
        this.continuousSkips++;
        this.logger.debug(
            `Continuous skips: ${this.continuousSkips}/${this.config.maxContinuousSkips}`,
        );
    }

    /**
     * Call this method when a movie is successfully updated
     */
    protected resetSkipCount(): void {
        if (this.continuousSkips > 0) {
            this.logger.debug(`Reset continuous skips counter from ${this.continuousSkips} to 0`);
        }
        this.continuousSkips = 0;
    }

    /**
     * Compares two quality values and returns true if newQuality is better than currentQuality
     */
    protected isQualityBetter(newQuality: string, currentQuality: string): boolean {
        const qualityRank = {
            '4k': 5,
            fhd: 4,
            fullhd: 4,
            hd: 3,
            sd: 2,
            cam: 1,
        };

        const newRank = qualityRank[newQuality?.toLowerCase()] || 0;
        const currentRank = qualityRank[currentQuality?.toLowerCase()] || 0;

        return newRank > currentRank;
    }

    /**
     * Gets the best quality between existing and new quality
     */
    protected getBestQuality(existingQuality: string, newQuality: string): string {
        if (!existingQuality) return newQuality;
        if (!newQuality) return existingQuality;

        return this.isQualityBetter(newQuality, existingQuality) ? newQuality : existingQuality;
    }

    protected async processExternalData(movieDetail: OPhimMovie): Promise<{
        tmdb?: TmdbType;
        imdb?: ImdbType;
    }> {
        try {
            // Find movie by IMDB ID
            if (movieDetail?.imdb?.id) {
                const tmdbData = await this.tmdbService.findTmdbByImdbId(movieDetail.imdb.id);
                return {
                    tmdb: tmdbData || null,
                    imdb: movieDetail.imdb,
                };
            }

            // Find movie by TMDB ID
            if (movieDetail?.tmdb?.id) {
                const ids = await this.tmdbService.getExternalIds({
                    id: movieDetail?.tmdb?.id?.toString(),
                    type: movieDetail.tmdb.type,
                });

                // Check if we got valid results
                if (!ids) {
                    return { tmdb: null, imdb: null };
                }

                return {
                    tmdb: {
                        ...movieDetail.tmdb,
                        id: ids?.id?.toString(),
                        type: movieDetail.tmdb.type,
                        voteAverage: movieDetail?.tmdb?.vote_average,
                        voteCount: movieDetail?.tmdb?.vote_count,
                    },
                    imdb: ids?.imdb_id ? { id: ids.imdb_id } : null,
                };
            }
        } catch (error) {
            this.logger.error(`Error processing external data: ${error.message}`);
        }

        return { tmdb: movieDetail?.tmdb || null, imdb: movieDetail?.imdb || null };
    }

    protected async processActors(
        actors?: string[],
        externalData?: { tmdbData?: TmdbType; imdbData?: ImdbType },
    ): Promise<Types.ObjectId[]> {
        // Handle TMDB data processing
        if (externalData?.tmdbData?.id) {
            try {
                const creditData = await this.tmdbService.getCreditDetails(externalData.tmdbData);

                if (creditData && creditData.cast?.length > 0) {
                    // Process cast members
                    const actorIds: Types.ObjectId[] = [];
                    const processedCastIds = new Set<number>();

                    // Process each cast member individually
                    for (const cast of creditData.cast) {
                        if (!cast?.id || !cast?.name || processedCastIds.has(cast.id)) continue;

                        processedCastIds.add(cast.id);

                        // Try to find by TMDB ID first
                        let actor = await this.actorRepo.findOne({
                            filterQuery: { tmdbPersonId: cast.id },
                        });

                        if (!actor) {
                            // Generate simple slug
                            let simpleSlug = slugifyVietnamese(cast.name, { lower: true });

                            // If slug is empty, use fallbacks
                            if (!simpleSlug || simpleSlug.trim() === '') {
                                simpleSlug = slugify(removeDiacritics(cast.name), { lower: true });

                                // Last resort: use tmdb ID as part of slug
                                if (!simpleSlug || simpleSlug.trim() === '') {
                                    simpleSlug = `actor-${cast.id}`;
                                }
                            }

                            // Try to find by slug
                            actor = await this.actorRepo.findOne({
                                filterQuery: { slug: simpleSlug },
                            });

                            const imgUrl = cast.profile_path
                                ? resolveUrl(cast.profile_path, this.tmdbService.config.imgHost)
                                : null;

                            if (actor) {
                                // Update existing actor with TMDB data if it doesn't have it already
                                if (!actor.tmdbPersonId) {
                                    await this.actorRepo.updateOne({
                                        filterQuery: { _id: actor._id },
                                        updateQuery: {
                                            $set: {
                                                tmdbPersonId: cast.id,
                                                thumbUrl: imgUrl || actor.thumbUrl,
                                                posterUrl: imgUrl || actor.posterUrl,
                                            },
                                        },
                                    });
                                }
                            } else {
                                // Create new actor with simple slug
                                try {
                                    // Create a new document without specifying _id
                                    const newActor = await this.actorRepo.create({
                                        document: {
                                            name: cast.name,
                                            originalName: cast.original_name || cast.name,
                                            slug: simpleSlug,
                                            tmdbPersonId: cast.id,
                                            thumbUrl: imgUrl,
                                            posterUrl: imgUrl,
                                        },
                                    });

                                    actor = newActor;
                                } catch (err) {
                                    if (err.code === 11000) {
                                        // Handle duplicate key error by fetching the existing actor
                                        this.logger.warn(
                                            `Duplicate key error for actor ${simpleSlug}, fetching existing record`,
                                        );
                                        actor = await this.actorRepo.findOne({
                                            filterQuery: { slug: simpleSlug },
                                        });
                                    } else {
                                        this.logger.error(
                                            `Error creating actor with slug ${simpleSlug}: ${err.message}`,
                                        );
                                    }
                                }
                            }
                        }

                        if (actor) {
                            actorIds.push(actor._id);
                        }
                    }

                    if (actorIds?.length !== 0) {
                        return actorIds;
                    }

                    this.logger.warn(`No actors found for TMDB ID ${externalData?.tmdbData?.id}`);
                }
            } catch (error) {
                this.logger.error(`Error processing TMDB actors: ${error.message}`);
                // Fall back to processing actors from the manual list
            }
        }

        // Handle manual actors list
        if (actors?.length) {
            // Filter out empty strings and invalid values
            const validActors = actors.filter(
                (actor) => actor && typeof actor === 'string' && actor.trim() !== '',
            );

            if (validActors.length === 0) {
                return [];
            }

            // Use an array to collect actor IDs
            const actorIds: Types.ObjectId[] = [];
            const processedSlugs = new Set<string>();

            // Process each actor using upsert to prevent duplicates
            for (const actorName of validActors) {
                // Generate slug with fallback for non-Latin characters
                let slug = slugifyVietnamese(actorName, { lower: true });

                // If slug is empty or null, create a fallback using transliteration
                if (!slug || slug.trim() === '') {
                    // Try to remove diacritics first as a fallback
                    slug = slugify(removeDiacritics(actorName), { lower: true });

                    // If still empty, use a generated ID
                    if (!slug || slug.trim() === '') {
                        slug = `actor-${new Types.ObjectId().toString()}`;
                    }
                }

                // Skip if we've already processed this slug in the current batch
                if (processedSlugs.has(slug)) continue;
                processedSlugs.add(slug);

                try {
                    // First check if actor already exists
                    let actor = await this.actorRepo.findOne({
                        filterQuery: { slug },
                    });

                    if (!actor) {
                        // If not found, create a new actor
                        actor = await this.actorRepo.create({
                            document: {
                                name: actorName,
                                originalName: actorName,
                                slug,
                            },
                        });
                    }

                    if (actor) {
                        actorIds.push(actor._id);
                    }
                } catch (err) {
                    if (err.code === 11000) {
                        // Handle duplicate key error by fetching the existing actor
                        this.logger.warn(
                            `Duplicate key error for actor ${slug}, fetching existing record`,
                        );
                        const actor = await this.actorRepo.findOne({
                            filterQuery: { slug },
                        });
                        if (actor) {
                            actorIds.push(actor._id);
                        }
                    } else {
                        this.logger.error(
                            `Error processing manual actor with slug ${slug}: ${err.message}`,
                        );
                    }
                }
            }

            return actorIds;
        }

        return [];
    }

    protected async processDirectors(
        directors?: string[],
        externalData?: { tmdbData?: TmdbType; imdbData?: ImdbType },
    ): Promise<Types.ObjectId[]> {
        const directorIds: Types.ObjectId[] = [];
        const processedSlugs = new Set<string>();

        // Handle TMDB data processing
        if (externalData?.tmdbData?.id) {
            try {
                const creditData = await this.tmdbService.getCreditDetails(externalData.tmdbData);

                if (creditData && creditData.crew?.length > 0) {
                    // Find all directors (case insensitive job match)
                    const directorCrew = creditData.crew
                        .filter((crew) => crew?.job && crew?.name) // Ensure crew has valid job and name
                        .filter((crew) => crew.job.toLowerCase() === 'director');

                    // Process each director
                    for (const director of directorCrew) {
                        if (!director?.name) continue; // Skip if name is missing

                        // Generate simple slug
                        let simpleSlug = slugifyVietnamese(director.name, { lower: true });

                        // If slug is empty, use fallbacks
                        if (!simpleSlug || simpleSlug.trim() === '') {
                            simpleSlug = slugify(removeDiacritics(director.name), { lower: true });

                            // Last resort: use tmdb ID as part of slug
                            if (!simpleSlug || simpleSlug.trim() === '') {
                                simpleSlug = `director-${director.id}`;
                            }
                        }

                        // Skip if we've already processed this slug in the current batch
                        if (processedSlugs.has(simpleSlug)) continue;
                        processedSlugs.add(simpleSlug);

                        // Try to find by TMDB ID first
                        let existingDirector = await this.directorRepo.findOne({
                            filterQuery: { tmdbPersonId: director.id },
                        });

                        if (!existingDirector) {
                            // Try to find by slug
                            existingDirector = await this.directorRepo.findOne({
                                filterQuery: { slug: simpleSlug },
                            });

                            const imgUrl = director.profile_path
                                ? resolveUrl(director.profile_path, this.tmdbService.config.imgHost)
                                : null;

                            if (existingDirector) {
                                // Update existing director with TMDB data if it doesn't have it already
                                if (!existingDirector.tmdbPersonId) {
                                    await this.directorRepo.updateOne({
                                        filterQuery: { _id: existingDirector._id },
                                        updateQuery: {
                                            $set: {
                                                tmdbPersonId: director.id,
                                                thumbUrl: imgUrl || existingDirector.thumbUrl,
                                                posterUrl: imgUrl || existingDirector.posterUrl,
                                            },
                                        },
                                    });
                                }
                            } else {
                                // Create new director with simple slug
                                try {
                                    const newDirector = await this.directorRepo.create({
                                        document: {
                                            name: director.name,
                                            originalName: director.original_name || director.name,
                                            slug: simpleSlug,
                                            tmdbPersonId: director.id,
                                            thumbUrl: imgUrl,
                                            posterUrl: imgUrl,
                                        },
                                    });

                                    existingDirector = newDirector;
                                } catch (err) {
                                    if (err.code === 11000) {
                                        // Handle duplicate key error by fetching the existing director
                                        this.logger.warn(
                                            `Duplicate key error for director ${simpleSlug}, fetching existing record`,
                                        );
                                        existingDirector = await this.directorRepo.findOne({
                                            filterQuery: { slug: simpleSlug },
                                        });
                                    } else {
                                        this.logger.error(
                                            `Error creating director with slug ${simpleSlug}: ${err.message}`,
                                        );
                                    }
                                }
                            }
                        }

                        if (existingDirector) {
                            directorIds.push(existingDirector._id);
                        }
                    }
                }
            } catch (error) {
                this.logger.error(`Error processing TMDB directors: ${error.message}`);
                // Fall back to processing directors from the manual list
            }
        }

        // Handle manual directors list
        if (directors?.length && directorIds.length === 0) {
            // Filter out empty strings and invalid values
            const validDirectors = directors.filter(
                (director) => director && typeof director === 'string' && director.trim() !== '',
            );

            for (const directorName of validDirectors) {
                // Generate slug with fallback for non-Latin characters
                let slug = slugifyVietnamese(directorName, { lower: true });

                // If slug is empty or null, create a fallback using transliteration
                if (!slug || slug.trim() === '') {
                    // Try to remove diacritics first as a fallback
                    slug = slugify(removeDiacritics(directorName), { lower: true });

                    // If still empty, use a generated ID
                    if (!slug || slug.trim() === '') {
                        slug = `director-${new Types.ObjectId().toString()}`;
                    }
                }

                // Skip if we've already processed this slug in the current batch
                if (processedSlugs.has(slug)) continue;
                processedSlugs.add(slug);

                try {
                    // Check if director already exists
                    let director = await this.directorRepo.findOne({
                        filterQuery: { slug },
                    });

                    if (!director) {
                        // Create new director
                        director = await this.directorRepo.create({
                            document: {
                                name: directorName,
                                originalName: directorName,
                                slug,
                            },
                        });
                    }

                    if (director) {
                        directorIds.push(director._id);
                    }
                } catch (err) {
                    if (err.code === 11000) {
                        // Handle duplicate key error by fetching the existing director
                        this.logger.warn(
                            `Duplicate key error for director ${slug}, fetching existing record`,
                        );
                        const director = await this.directorRepo.findOne({
                            filterQuery: { slug },
                        });
                        if (director) {
                            directorIds.push(director._id);
                        }
                    } else {
                        this.logger.error(
                            `Error processing manual director with slug ${slug}: ${err.message}`,
                        );
                    }
                }
            }
        }

        return directorIds;
    }

    protected async findExistingMovie(movieDetail: {
        tmdb?: TmdbType;
        imdb?: ImdbType;
        slug?: string;
    }): Promise<Movie | null> {
        // Try to find by TMDB ID first
        if (movieDetail?.tmdb?.id && movieDetail?.tmdb?.type) {
            const movieByTmdb = await this.movieRepo.findOne({
                filterQuery: { 'tmdb.id': movieDetail.tmdb.id, 'tmdb.type': movieDetail.tmdb.type },
            });
            if (movieByTmdb) return movieByTmdb;
        }

        // Try to find by IMDB ID
        if (movieDetail?.imdb?.id) {
            const movieByImdb = await this.movieRepo.findOne({
                filterQuery: { 'imdb.id': movieDetail.imdb.id },
            });
            if (movieByImdb) return movieByImdb;
        }

        // Finally try by slug
        const movieSlug = removeTone(removeDiacritics(movieDetail?.slug || ''));
        return this.movieRepo.findOne({
            filterQuery: { slug: movieSlug },
        });
    }

    protected mergeEpisodes(
        existingEpisodes: Episode[] = [],
        newEpisodes: Episode[],
        sourceName: string,
    ): Episode[] {
        const mergedEpisodes = [...existingEpisodes];

        newEpisodes.forEach((newEp) => {
            // Find matching episode by source and server name
            const existingEpIndex = mergedEpisodes.findIndex(
                (ep) => ep.originSrc === sourceName && ep.serverName === newEp.serverName,
            );

            if (existingEpIndex === -1) {
                // If no matching episode exists, add the new one
                mergedEpisodes.push({
                    ...newEp,
                    originSrc: sourceName,
                });
            } else {
                // If matching episode exists, merge server data
                const existingEp = mergedEpisodes[existingEpIndex];
                const uniqueServerData = newEp.serverData.filter(
                    (newData) =>
                        !existingEp.serverData.some(
                            (existingData) => existingData.slug === newData.slug,
                        ),
                );

                mergedEpisodes[existingEpIndex] = {
                    ...existingEp,
                    serverData: [...existingEp.serverData, ...uniqueServerData],
                };
            }
        });

        return mergedEpisodes;
    }

    protected async processContentRating(movieDetail: {
        tmdb: TmdbType;
    }): Promise<MovieContentRatingEnum> {
        let tmdbReleases: MovieReleaseDatesResponse | ShowContentRatingResponse | null = null;
        switch (movieDetail?.tmdb?.type) {
            case 'movie':
                tmdbReleases = await this.tmdbService.moviedb.movieReleaseDates({
                    id: movieDetail.tmdb.id,
                });
                break;
            case 'tv':
                tmdbReleases = await this.tmdbService.moviedb.tvContentRatings({
                    id: movieDetail.tmdb.id,
                });
                break;
        }
        return determineContentRating(tmdbReleases);
    }
}
