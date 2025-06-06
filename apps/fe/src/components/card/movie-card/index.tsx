'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Grid } from 'antd';
import { PlayCircleOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';

import type { MovieType } from 'apps/api/src/app/movies/movie.type';

import { ImageOptimized } from '@/components/image/image-optimized';
import { MovieQualityTag } from '@/components/tag/movie-quality';
import { MovieContentRating } from '@/components/tag/movie-content-rating';
import styles from './movie-card.module.css';

const { useBreakpoint } = Grid;

interface MovieCardProps {
    movie: MovieType;
    loadType?: 'lazy' | 'eager';
    fromParam?: string;
    hoverDelay?: number;
}

export function MovieCard({ movie, loadType, fromParam, hoverDelay }: MovieCardProps) {
    const router = useRouter();
    const { md } = useBreakpoint();

    const handleViewMovie = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const url = fromParam
            ? `/phim/${movie.slug}?from=${encodeURIComponent(fromParam)}`
            : `/phim/${movie.slug}`;
        router.push(url);
    };

    // Create a formatted description
    const formatDescription = () => {
        if (!movie?.content) return '';

        // Limit to a reasonable length (100 characters)
        const maxLength = 100;
        const text =
            movie?.content.length > maxLength
                ? `${movie.content.substring(0, maxLength)}...`
                : movie.content;

        return text;
    };

    const formatEpisodeCurrent = useCallback(() => {
        if (!movie?.episodeCurrent) return '';

        if (md) {
            return movie.episodeCurrent;
        }

        if (movie.episodeCurrent?.length >= 14) {
            const split = movie.episodeCurrent?.split(' ');
            return split[split.length - 1];
        }

        return movie.episodeCurrent;
    }, [movie?.episodeCurrent, md]);

    return (
        <div
            className={styles.container}
            role="article"
            aria-label={`Movie: ${movie.name}`}
            onClick={handleViewMovie}
            style={
                hoverDelay
                    ? ({ '--hover-delay': `${hoverDelay}ms` } as React.CSSProperties)
                    : undefined
            }
        >
            <div className={styles.link}>
                <div className={styles.poster}>
                    <div className={styles.imageWrapper}>
                        <ImageOptimized
                            alt={movie.name}
                            url={movie.posterUrl}
                            width={480}
                            height={854}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '0.5rem',
                            }}
                            loadType={loadType}
                        />
                    </div>

                    {/* Quality tag badge */}
                    {movie.quality && (
                        <MovieQualityTag
                            quality={movie.quality}
                            variant="cardBadge"
                            withLink={false}
                        />
                    )}

                    {/* Content rating badge */}
                    {movie.contentRating && (
                        <MovieContentRating
                            rating={movie.contentRating}
                            variant="cardBadge"
                            withLink={false}
                        />
                    )}

                    <div className={styles.overlay}>
                        <div className={styles.overlayContent}>
                            <h4 className={styles.title}>
                                {movie.name}
                                {movie.originName && (
                                    <span className={styles.originName}>{movie.originName}</span>
                                )}
                            </h4>

                            <div className={styles.meta}>
                                {movie.view && (
                                    <span className={styles.metaBadge}>
                                        <EyeOutlined />{' '}
                                        {movie.view > 1000
                                            ? `${Math.floor(movie.view / 1000)}K`
                                            : movie.view}
                                    </span>
                                )}
                            </div>

                            {movie.categories && movie.categories.length > 0 && (
                                <div className={styles.categories}>
                                    {movie.categories.slice(0, 3).map((category) => (
                                        <span
                                            key={category._id.toString()}
                                            className={styles.category}
                                        >
                                            {category.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className={styles.description}>{formatDescription()}</p>

                            <Button
                                type="primary"
                                size="small"
                                icon={<PlayCircleOutlined />}
                                className={styles.watchNowBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewMovie();
                                }}
                            >
                                Xem phim
                            </Button>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <h5 className={styles.footerTitle}>{movie.name}</h5>

                    <div className={styles.footerMeta}>
                        {movie.year && (
                            <span className={styles.yearSmall}>
                                <CalendarOutlined /> {movie.year}
                            </span>
                        )}

                        {movie.episodeCurrent && (
                            <span className={styles.episodeSmall}>{formatEpisodeCurrent()}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
