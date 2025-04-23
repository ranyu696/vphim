import React from 'react';
import { StyleSheet, FlatList, Dimensions, SafeAreaView, View, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useList } from '@refinedev/core';
import { useTheme, Spinner } from '@ui-kitten/components';

import { MOVIES_LIST_QUERY, MOVIES_LIST_FOR_SWIPER_QUERY } from '~fe/queries/movies';
import { type MovieType } from '~api/app/movies/movie.type';
import ImmersiveMovieSwiper from '~mb/components/swiper/movie-swiper';
import { MovieSection } from '~mb/components/list/movie-section';
import { ShimmerPlaceholder } from '~mb/components/animation/shimmer-placeholder';
import { FadeInView } from '~mb/components/animation/fade-in';
import { useRefreshControl } from '~mb/hooks/use-refresh-control';

const { width } = Dimensions.get('window');

interface SectionItem {
    id: string;
    type: 'swiper' | 'movieSection';
    title?: string;
    movies?: MovieType[];
}

export default function HomeScreen() {
    const theme = useTheme();
    const router = useRouter();

    const { data: mostViewed, refetch: refetchMostViewed } = useList<MovieType>({
        dataProviderName: 'graphql',
        meta: { gqlQuery: MOVIES_LIST_FOR_SWIPER_QUERY, operation: 'movies' },
        resource: 'movies',
        sorters: [{ field: 'view', order: 'desc' }],
    });

    const { data: newMovies, refetch: refetchNewMovies } = useList<MovieType>({
        dataProviderName: 'graphql',
        meta: { gqlQuery: MOVIES_LIST_QUERY, operation: 'movies' },
        resource: 'movies',
        filters: [{ field: 'years', value: `${new Date().getFullYear()},${new Date().getFullYear() - 1}` , operator: 'eq' }],
        sorters: [{ field: 'year', order: 'desc' }],
    });

    const { data: cinemaVietMovies, refetch: refetchCinemaVietMovies } = useList<MovieType>({
        dataProviderName: 'graphql',
        meta: { gqlQuery: MOVIES_LIST_QUERY, operation: 'movies' },
        resource: 'movies',
        filters: [
            { field: 'cinemaRelease', value: true, operator: 'eq' },
            { field: 'countries', value: 'viet-nam', operator: 'eq' },
        ],
        sorters: [{ field: 'view', order: 'desc' }],
    });

    const { data: singleHotMovies, refetch: refetchSingleHotMovies } = useList<MovieType>({
        dataProviderName: 'graphql',
        meta: { gqlQuery: MOVIES_LIST_QUERY, operation: 'movies' },
        resource: 'movies',
        filters: [{ field: 'type', value: 'SINGLE', operator: 'eq' }],
        sorters: [{ field: 'view', order: 'desc' }],
    });

    const { data: seriesHotMovies, refetch: refetchSeriesHotMovies } = useList<MovieType>({
        dataProviderName: 'graphql',
        meta: { gqlQuery: MOVIES_LIST_QUERY, operation: 'movies' },
        resource: 'movies',
        filters: [{ field: 'type', value: 'SERIES', operator: 'eq' }],
        sorters: [{ field: 'view', order: 'desc' }],
    });

    const { data: tvShows, refetch: refetchTvShows } = useList<MovieType>({
        dataProviderName: 'graphql',
        meta: { gqlQuery: MOVIES_LIST_QUERY, operation: 'movies' },
        resource: 'movies',
        filters: [{ field: 'type', value: 'TV_SHOWS', operator: 'eq' }],
        sorters: [{ field: 'view', order: 'desc' }],
    });

    const { data: schoolMovies, refetch: refetchSchoolMovies } = useList<MovieType>({
        dataProviderName: 'graphql',
        meta: { gqlQuery: MOVIES_LIST_QUERY, operation: 'movies' },
        resource: 'movies',
        filters: [{ field: 'categories', value: 'hoc-duong', operator: 'eq' }],
        sorters: [{ field: 'view', order: 'desc' }],
    });

    const { data: kidsMovies, refetch: refetchKidsMovies } = useList<MovieType>({
        dataProviderName: 'graphql',
        meta: { gqlQuery: MOVIES_LIST_QUERY, operation: 'movies' },
        resource: 'movies',
        filters: [{ field: 'categories', value: 'tre-em', operator: 'eq' }],
        sorters: [{ field: 'view', order: 'desc' }],
    });

    const { data: actionMovies, refetch: refetchActionMovies } = useList<MovieType>({
        dataProviderName: 'graphql',
        meta: { gqlQuery: MOVIES_LIST_QUERY, operation: 'movies' },
        resource: 'movies',
        filters: [{ field: 'categories', value: 'hanh-dong', operator: 'eq' }],
        sorters: [{ field: 'year', order: 'desc' }],
    });

    const { data: cartoonMovies, refetch: refetchCartoonMovies } = useList<MovieType>({
        dataProviderName: 'graphql',
        meta: { gqlQuery: MOVIES_LIST_QUERY, operation: 'movies' },
        resource: 'movies',
        filters: [{ field: 'categories', value: 'hoat-hinh', operator: 'eq' }],
        sorters: [{ field: 'year', order: 'desc' }],
    });

    const { data: sciFiMovies, refetch: refetchSciFiMovies } = useList<MovieType>({
        dataProviderName: 'graphql',
        meta: { gqlQuery: MOVIES_LIST_QUERY, operation: 'movies' },
        resource: 'movies',
        filters: [{ field: 'categories', value: 'vien-tuong', operator: 'eq' }],
        sorters: [{ field: 'year', order: 'desc' }],
    });

    const { data: mythMovies, refetch: refetchMythMovies } = useList<MovieType>({
        dataProviderName: 'graphql',
        meta: { gqlQuery: MOVIES_LIST_QUERY, operation: 'movies' },
        resource: 'movies',
        filters: [{ field: 'categories', value: 'than-thoai', operator: 'eq' }],
        sorters: [{ field: 'year', order: 'desc' }],
    });

    const { isLoading, fadeAnim, overlayStyle, RefreshControl } = useRefreshControl({
        onRefresh: async () => {
            await Promise.allSettled([
                refetchMostViewed(),
                refetchNewMovies(),
                refetchCinemaVietMovies(),
                refetchSingleHotMovies(),
                refetchSeriesHotMovies(),
                refetchTvShows(),
                refetchSchoolMovies(),
                refetchKidsMovies(),
                refetchActionMovies(),
                refetchCartoonMovies(),
                refetchSciFiMovies(),
                refetchMythMovies(),
            ]);
        },
    });

    const onMoviePress = (movie: MovieType) => {
        router.push(`/movie/${movie.slug}`);
    };

    const getSections = (): SectionItem[] => {
        const sections: SectionItem[] = [];

        // Add swiper section
        sections.push({
            id: 'swiper',
            type: 'swiper',
        });

        // Add new movies section if available
        if (newMovies?.data && newMovies.data.length > 0) {
            sections.push({
                id: 'new-movies',
                type: 'movieSection',
                title: 'PHIM MỚI',
                movies: newMovies.data,
            });
        }
        if (cinemaVietMovies?.data && cinemaVietMovies.data.length > 0) {
            sections.push({
                id: 'cinema-viet',
                type: 'movieSection',
                title: 'PHIM VIỆT CHIẾU RẠP',
                movies: cinemaVietMovies.data,
            });
        }
        if (singleHotMovies?.data && singleHotMovies.data.length > 0) {
            sections.push({
                id: 'single-hot',
                type: 'movieSection',
                title: 'PHIM LẺ ĐANG HOT',
                movies: singleHotMovies.data,
            });
        }
        if (seriesHotMovies?.data && seriesHotMovies.data.length > 0) {
            sections.push({
                id: 'series-hot',
                type: 'movieSection',
                title: 'PHIM BỘ ĐANG NỔI',
                movies: seriesHotMovies.data,
            });
        }
        if (tvShows?.data && tvShows.data.length > 0) {
            sections.push({
                id: 'tv-shows',
                type: 'movieSection',
                title: 'TV SHOWS XEM NHIỀU',
                movies: tvShows.data,
            });
        }
        if (schoolMovies?.data && schoolMovies.data.length > 0) {
            sections.push({
                id: 'school',
                type: 'movieSection',
                title: 'THẾ GIỚI HỌC ĐƯỜNG',
                movies: schoolMovies.data,
            });
        }
        if (kidsMovies?.data && kidsMovies.data.length > 0) {
            sections.push({
                id: 'kids',
                type: 'movieSection',
                title: 'VƯƠNG QUỐC TRẺ EM',
                movies: kidsMovies.data,
            });
        }
        if (actionMovies?.data && actionMovies.data.length > 0) {
            sections.push({
                id: 'action-movies',
                type: 'movieSection',
                title: 'PHIM HÀNH ĐỘNG',
                movies: actionMovies.data,
            });
        }
        if (cartoonMovies?.data && cartoonMovies.data.length > 0) {
            sections.push({
                id: 'cartoon',
                type: 'movieSection',
                title: 'PHIM HOẠT HÌNH',
                movies: cartoonMovies.data,
            });
        }
        if (sciFiMovies?.data && sciFiMovies.data.length > 0) {
            sections.push({
                id: 'sci-fi',
                type: 'movieSection',
                title: 'PHIM VIỄN TƯỞNG',
                movies: sciFiMovies.data,
            });
        }
        if (mythMovies?.data && mythMovies.data.length > 0) {
            sections.push({
                id: 'myth',
                type: 'movieSection',
                title: 'PHIM THẦN THOẠI',
                movies: mythMovies.data,
            });
        }

        return sections;
    };


    const renderItem = ({ item }: { item: SectionItem }) => {
        if (item.type === 'swiper') {
            return (
                <Animated.View style={{ opacity: fadeAnim }}>
                    {mostViewed?.data && mostViewed.data.length > 0 ? (
                        <FadeInView delay={200}>
                            <ImmersiveMovieSwiper movies={mostViewed.data} />
                        </FadeInView>
                    ) : (
                        <ShimmerPlaceholder width={width} height={300} />
                    )}
                </Animated.View>
            );
        } else if (item.type === 'movieSection' && item.movies) {
            return (
                <Animated.View style={{ opacity: fadeAnim }}>
                    <FadeInView delay={400}>
                        <MovieSection
                            title={item.title || ''}
                            movies={item.movies}
                            onMoviePress={onMoviePress}
                        />
                    </FadeInView>
                </Animated.View>
            );
        }
        return null;
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme['background-basic-color-1'] }]}
        >
            <FlatList
                data={getSections()}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                style={[styles.container, { backgroundColor: theme['background-basic-color-1'] }]}
                contentContainerStyle={styles.contentContainer}
                refreshControl={RefreshControl}
            />
            {isLoading && (
                <View style={overlayStyle}>
                    <Spinner size="large" status="primary" />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 20,
    },
});
