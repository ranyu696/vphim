import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Text, useTheme } from '@ui-kitten/components';
import { EyeIcon, Calendar } from 'lucide-react-native';
import { getOptimizedImageUrl } from '~fe/libs/utils/movie.util';
import { movieTypeTranslations } from '~fe/constants/translation-enum';
import MovieRatings from './movie-ratings';
import type { MovieType } from '~api/app/movies/movie.type';
import { MovieContentRating } from '~mb/components/tag/movie-content-rating';

interface SearchMovieCardProps {
    movie: MovieType;
    onPress: () => void;
}

export const SearchMovieCard: React.FC<SearchMovieCardProps> = ({ movie, onPress }) => {
    const theme = useTheme();

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[
                styles.listItemContainer,
                { backgroundColor: theme['background-basic-color-1'] },
            ]}
        >
            <View style={styles.row}>
                <Image
                    source={{
                        uri: getOptimizedImageUrl(movie.posterUrl || movie.thumbUrl, {
                            width: 240,
                            height: 360,
                            quality: 70,
                        }),
                    }}
                    style={styles.poster}
                    resizeMode="cover"
                />
                <View style={styles.infoContainer}>
                    <Text category="s1" style={styles.title} numberOfLines={2}>
                        {movie.name}
                    </Text>
                    {movie.originName && (
                        <Text
                            category="p2"
                            appearance="hint"
                            style={styles.originName}
                            numberOfLines={1}
                        >
                            {movie.originName}
                        </Text>
                    )}

                    {/* Year & View Row */}
                    <View style={styles.rowMetaWrap}>
                        {movie.year && (
                            <View style={styles.metaItem}>
                                <Calendar size={13} color={theme['text-hint-color']} />
                                <Text style={styles.metaText}>{movie.year}</Text>
                            </View>
                        )}
                        <View style={styles.metaItem}>
                            <EyeIcon size={13} color={theme['text-hint-color']} />
                            <Text style={styles.metaText}>
                                {movie.view && movie.view > 1000
                                    ? `${(movie.view / 1000).toFixed(1)}k`
                                    : movie.view || '0'}
                            </Text>
                        </View>
                    </View>

                    {/* Quality, Lang, ContentRating Row */}
                    <View style={styles.rowMetaWrap}>
                        {movie.quality && (
                            <View style={styles.qualityBadge}>
                                <Text style={styles.qualityText}>
                                    {movie.quality.toUpperCase()}
                                </Text>
                            </View>
                        )}
                        {movie.contentRating && <MovieContentRating rating={movie.contentRating} />}
                        {movie.lang && (
                            <View style={styles.langBadge}>
                                <Text style={styles.langText}>{movie.lang.toUpperCase()}</Text>
                            </View>
                        )}
                    </View>

                    {/* Type badge (compact) */}
                    {movie.type &&
                        movieTypeTranslations[movie.type as keyof typeof movieTypeTranslations] && (
                            <View style={styles.typeBadgeCompact}>
                                <Text style={styles.typeTextCompact}>
                                    {
                                        movieTypeTranslations[
                                            movie.type as keyof typeof movieTypeTranslations
                                        ]
                                    }
                                </Text>
                            </View>
                        )}

                    {/* Regions (countries) as chips */}
                    {movie.countries && movie.countries.length > 0 && (
                        <View style={styles.chipScrollContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {movie.countries.map((region) => (
                                    <View key={region.name} style={styles.chip}>
                                        <Text style={styles.chipText}>{region.name}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                    {/* Categories as chips, wrapping to multiple lines if needed */}
                    {movie.categories && movie.categories.length > 0 && (
                        <View style={styles.chipWrapContainer}>
                            {movie.categories.map((cat) => (
                                <View key={cat.name} style={styles.chip}>
                                    <Text style={styles.chipText}>{cat.name}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <MovieRatings
                        imdbId={movie.imdb?.id}
                        tmdbId={movie.tmdb?.id}
                        tmdbType={movie.tmdb?.type}
                        size="small"
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    listItemContainer: {
        marginVertical: 4,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#181818',
        padding: 0,
        elevation: 1,
    },
    row: {
        flexDirection: 'row',
    },
    poster: {
        width: 90,
        height: 135,
        borderRadius: 8,
        backgroundColor: '#222',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'flex-start',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 17,
        marginBottom: 2,
        color: '#fff',
    },
    originName: {
        fontSize: 13,
        marginBottom: 2,
    },
    rowMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 1,
        gap: 8,
    },
    rowMetaWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 1,
        gap: 8,
        rowGap: 4,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        gap: 3,
    },
    metaText: {
        fontSize: 13,
        color: '#bbb',
        marginLeft: 3,
    },
    typeBadgeCompact: {
        alignSelf: 'flex-start',
        backgroundColor: '#262626',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginVertical: 2,
        minWidth: 0,
    },
    typeTextCompact: {
        fontSize: 12,
        color: '#FF747D',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    qualityBadge: {
        backgroundColor: '#E50914',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    qualityText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
    },
    statusBadge: {
        backgroundColor: '#333',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
        marginRight: 8,
    },
    statusText: {
        fontSize: 12,
        color: '#FFD700',
        fontWeight: 'bold',
    },
    langBadge: {
        backgroundColor: '#333',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    langText: {
        fontSize: 12,
        color: '#46D369',
        fontWeight: 'bold',
    },
    categories: {
        fontSize: 12,
        color: '#aaa',
        marginBottom: 1,
    },
    chipScrollContainer: {
        flexDirection: 'row',
        marginBottom: 2,
        marginTop: 2,
    },
    chipWrapContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 2,
        marginTop: 2,
    },
    chip: {
        backgroundColor: '#222',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    chipText: {
        color: '#bbb',
        fontSize: 12,
    },
    countries: {
        fontSize: 12,
        color: '#aaa',
        marginBottom: 1,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    ratingLabel: {
        fontSize: 12,
        color: '#FFD700',
        fontWeight: 'bold',
    },
    ratingValue: {
        fontSize: 12,
        color: '#FFD700',
    },
    contentRatingBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFD700',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginBottom: 3,
        marginTop: 2,
    },
    contentRatingText: {
        fontSize: 12,
        color: '#222',
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    plot: {
        fontSize: 13,
        color: '#ccc',
        marginTop: 3,
    },
    divider: {
        backgroundColor: '#222',
        height: 1,
        marginHorizontal: 0,
        marginTop: 8,
    },
});

export default SearchMovieCard;
