import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    SafeAreaView,
    Keyboard,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    Layout,
    Input,
    Text,
    useTheme,
    Divider,
    Button,
    Modal,
    Card,
    Toggle,
} from '@ui-kitten/components';
import {
    Search,
    ArrowLeft,
    X,
    Filter as FilterIcon,
    SortDesc,
    AlertCircle,
    Zap,
} from 'lucide-react-native';
import { useInfiniteList, CrudFilters, LogicalFilter, useList } from '@refinedev/core';
import { useDebounce } from 'use-debounce';
import Animated, {
    FadeIn,
    FadeOut,
    LinearTransition,
    SlideInDown,
    SlideOutUp,
} from 'react-native-reanimated';

import type { MovieType } from '~api/app/movies/movie.type';
import type { Category } from '~api/app/categories/category.schema';
import type { Region } from '~api/app/regions/region.schema';

import { CATEGORIES_LIST_QUERY } from '~fe/queries/categories';
import { REGIONS_LIST_QUERY } from '~fe/queries/regions';
import { movieTypeTranslations } from '~fe/constants/translation-enum';

import { removeStyleProperty } from '~mb/libs/utils';
import { useAuth } from '~mb/hooks/use-auth';
import { AgeVerificationModal } from '~mb/components/modals/age-verification-modal';
import { MOVIES_MOBILE_SEARCH_QUERY } from '~mb/queries/movie';
import { SearchMovieCard } from '../components/card/search-movie-card';

// Define movie type translations (matches web version)

// Quality options (matches web version)
const qualityOptions = [
    { value: '4k', label: '4K', color: '#f5222d', textColor: '#fff' },
    { value: 'fhd', label: 'FHD', color: '#52c41a', textColor: '#fff' },
    { value: 'hd', label: 'HD', color: '#1890ff', textColor: '#fff' },
    { value: 'sd', label: 'SD', color: '#13c2c2', textColor: '#000' },
    { value: 'cam', label: 'CAM', color: '#a0d911', textColor: '#000' },
];

const contentRatingOptions = [
    { value: 'p', label: 'P', color: '#52c41a', textColor: '#fff' },
    { value: 'k', label: 'K', color: '#73d13d', textColor: '#000' },
    { value: 't13', label: 'T13', color: '#1890ff', textColor: '#fff' },
    { value: 't16', label: 'T16', color: '#fa8c16', textColor: '#fff' },
    { value: 't18', label: 'T18', color: '#fa541c', textColor: '#fff' },
    { value: 'c', label: 'C', color: '#f5222d', textColor: '#fff' },
];

// Status options (matches web version)
const statusOptions = [
    { value: 'trailer', label: 'Trailer' },
    { value: 'completed', label: 'Đã hoàn thành' },
    { value: 'ongoing', label: 'Đang chiếu' },
    { value: 'updating', label: 'Đang cập nhật' },
];

// Sort options (matches web version)
const sortOptions = [
    { value: 'bestMatch,asc', label: 'Phù hợp nhất' },
    { value: 'view,desc', label: 'Phổ biến nhất' },
    { value: 'year,desc', label: 'Mới nhất' },
    { value: 'year,asc', label: 'Cũ nhất' },
    { value: 'updatedAt,desc', label: 'Cập nhật gần đây' },
];

const SkeletonLoader = () => {
    const theme = useTheme();

    return (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.skeletonContainer}>
            {[...Array(6)].map((_, index) => (
                <View
                    key={`skeleton-${index}`}
                    style={[
                        styles.skeletonItem,
                        { borderBottomColor: theme['border-basic-color-3'] },
                    ]}
                >
                    <View
                        style={[
                            styles.skeletonImage,
                            { backgroundColor: theme['background-basic-color-3'] },
                        ]}
                    />
                    <View style={styles.skeletonContent}>
                        <View
                            style={[
                                styles.skeletonTitle,
                                { backgroundColor: theme['background-basic-color-3'] },
                            ]}
                        />
                        <View
                            style={[
                                styles.skeletonDescription,
                                { backgroundColor: theme['background-basic-color-3'] },
                            ]}
                        />
                    </View>
                </View>
            ))}
        </Animated.View>
    );
};

export default function SearchScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { searchQuery: initialSearchQuery } = useLocalSearchParams();
    const [inputValue, setInputValue] = useState((initialSearchQuery as string) || '');
    const [debouncedSearchQuery] = useDebounce(inputValue, 300);
    const flatListRef = useRef<Animated.FlatList<MovieType>>(null);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<any>(null);
    const [filters, setFilters] = useState<CrudFilters>([]);
    const [filterVisible, setFilterVisible] = useState(false);
    const [useAI, setUseAI] = useState(false);
    const [sortOption, setSortOption] = useState<string>('view,desc');
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const { isAuthenticated } = useAuth();

    // Filters state
    const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
    const [selectedQuality, setSelectedQuality] = useState<string | undefined>(undefined);
    const [selectedContentRating, setSelectedContentRating] = useState<string | undefined>(
        undefined,
    );
    const [isCinemaRelease, setIsCinemaRelease] = useState<boolean | undefined>(undefined);
    const [isCopyright, setIsCopyright] = useState<boolean | undefined>(undefined);

    const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage, refetch } =
        useInfiniteList<MovieType>({
            resource: 'movies',
            dataProviderName: 'graphql',
            meta: {
                gqlQuery: MOVIES_MOBILE_SEARCH_QUERY,
            },
            pagination: {
                pageSize: 10,
            },
            filters: [
                ...filters,
                { field: 'keywords', operator: 'contains', value: debouncedSearchQuery },
                { field: 'useAI', operator: 'eq', value: useAI },
            ],
            sorters: sortOption
                ? [
                      {
                          field: sortOption.split(',')[0],
                          order: sortOption.split(',')[1] === 'asc' ? 'asc' : 'desc',
                      },
                  ]
                : [],
            errorNotification: false,
            successNotification: false,
        });

    const { data: categoriesData } = useList<Category>({
        dataProviderName: 'graphql',
        resource: 'categories',
        meta: {
            gqlQuery: CATEGORIES_LIST_QUERY,
            operation: 'categories',
        },
        pagination: {
            current: 1,
            pageSize: 1000,
        },
    });

    const { data: regionsData } = useList<Region>({
        dataProviderName: 'graphql',
        resource: 'regions',
        meta: {
            gqlQuery: REGIONS_LIST_QUERY,
            operation: 'regions',
        },
        pagination: {
            current: 1,
            pageSize: 1000,
        },
    });

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

    useEffect(() => {
        setIsSearching(true);
        const timer = setTimeout(() => setIsSearching(false), 500);
        return () => clearTimeout(timer);
    }, [debouncedSearchQuery, filters, sortOption]);

    const handleInputChange = useCallback(
        (text: string) => {
            setInputValue(text);
            if (flatListRef.current) {
                flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
            }
        },
        [flatListRef],
    );

    const handleSearch = useCallback(() => {
        if (inputValue.trim()) {
            Keyboard.dismiss();
            refetch();
        }
    }, [inputValue, refetch]);

    const handleClearInput = useCallback(() => {
        setInputValue('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleFilterChange = (key: string, value: unknown) => {
        setFilters((prevFilters) => {
            let newFilters = prevFilters.filter(
                (filter) => (filter as LogicalFilter).field !== key,
            );

            if (value !== undefined && value !== null && value?.toString()?.trim() !== '') {
                newFilters = [
                    ...newFilters,
                    {
                        field: key,
                        value: Array.isArray(value) ? value.join(',') : value,
                        operator: Array.isArray(value) ? 'in' : 'eq',
                    },
                ];
            }

            return newFilters;
        });
    };

    const applyFilters = () => {
        handleFilterChange('type', selectedType);
        handleFilterChange('status', selectedStatus);
        handleFilterChange('quality', selectedQuality);
        handleFilterChange('contentRating', selectedContentRating);
        if (isCinemaRelease !== undefined) handleFilterChange('cinemaRelease', isCinemaRelease);
        else handleFilterChange('cinemaRelease', undefined);
        if (isCopyright !== undefined) handleFilterChange('isCopyright', isCopyright);
        else handleFilterChange('isCopyright', undefined);
        handleFilterChange(
            'categories',
            selectedCategories.length > 0 ? selectedCategories : undefined,
        );
        handleFilterChange('countries', selectedRegions.length > 0 ? selectedRegions : undefined);
        setFilterVisible(false);
    };

    const clearFilters = () => {
        setSelectedType(undefined);
        setSelectedStatus(undefined);
        setSelectedQuality(undefined);
        setSelectedContentRating(undefined);
        setIsCinemaRelease(undefined);
        setIsCopyright(undefined);
        setSelectedCategories([]);
        setSelectedRegions([]);
        setFilters((prevFilters) =>
            prevFilters.filter(
                (filter) =>
                    (filter as LogicalFilter).field === 'keywords' ||
                    (filter as LogicalFilter).field === 'useAI',
            ),
        );
        setFilterVisible(false);
    };

    // Get active filter count
    const getActiveFilterCount = useCallback(() => {
        let count = 0;
        filters.forEach((filter) => {
            const f = filter as LogicalFilter;
            if (f.field !== 'keywords' && f.field !== 'useAI') {
                count += 1;
            }
        });
        return count;
    }, [filters]);

    // Function to handle sort selection
    const handleSortSelection = (value: string) => {
        setSortOption(value);
        setSortModalVisible(false);
    };

    // Handle AI toggle with login check
    const handleAIToggle = (checked: boolean) => {
        if (checked && !isAuthenticated) {
            setIsLoginModalVisible(true);
            return;
        }

        setUseAI(checked);
        handleFilterChange('useAI', checked);
    };

    // Import the SearchMovieCard component
    const renderMovieItem = useCallback(
        ({ item }: { item: MovieType }) => (
            <Animated.View
                entering={FadeIn.duration(300)}
                layout={LinearTransition}
                style={styles.movieItemContainer}
            >
                <SearchMovieCard movie={item} onPress={() => router.push(`/movie/${item.slug}`)} />
            </Animated.View>
        ),
        [router],
    );

    const keyExtractor = useCallback((item: MovieType) => item._id.toString(), []);

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footerLoader}>
                <Text style={{ color: theme['text-hint-color'] }}>Đang tải thêm...</Text>
            </View>
        );
    };

    const renderEmptyState = useCallback(() => {
        return (
            <Animated.View
                entering={SlideInDown.duration(300)}
                exiting={SlideOutUp.duration(300)}
                style={styles.emptyStateContainer}
            >
                <Text style={[styles.emptyStateTitle, { color: theme['text-basic-color'] }]}>
                    Không tìm thấy phim
                </Text>
                <Text style={[styles.emptyStateDescription, { color: theme['text-hint-color'] }]}>
                    {debouncedSearchQuery?.trim()
                        ? `Không thể tìm thấy phim phù hợp với "${debouncedSearchQuery?.trim()}"`
                        : 'Không có phim phù hợp với tìm kiếm của bạn'}
                </Text>
                <Button
                    appearance="outline"
                    onPress={() => handleClearInput()}
                    style={styles.emptyStateButton}
                >
                    Xóa tìm kiếm
                </Button>
            </Animated.View>
        );
    }, [debouncedSearchQuery, theme, handleClearInput]);

    const renderFilterModal = () => (
        <Modal
            visible={filterVisible}
            backdropStyle={styles.modalBackdrop}
            onBackdropPress={() => setFilterVisible(false)}
            style={styles.filterModal}
        >
            <Card disabled style={styles.filterCard}>
                <Text category="h6" style={styles.filterHeader}>
                    Bộ lọc nâng cao
                </Text>
                <Divider style={styles.filterDivider} />

                <ScrollView style={styles.filterContent}>
                    <View style={styles.filterSection}>
                        <Text category="s1" style={styles.filterSectionTitle}>
                            Định dạng phim
                        </Text>
                        <View style={styles.chipContainer}>
                            {Object.entries(movieTypeTranslations).map(([key, value]) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.chip,
                                        selectedType === key && styles.chipSelected,
                                        {
                                            borderColor: theme['border-basic-color-3'],
                                            backgroundColor:
                                                selectedType === key
                                                    ? theme['color-primary-100']
                                                    : theme['background-basic-color-1'],
                                        },
                                    ]}
                                    onPress={() =>
                                        setSelectedType((prevType) =>
                                            prevType === key ? undefined : key,
                                        )
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            {
                                                color:
                                                    selectedType === key
                                                        ? theme['color-primary-600']
                                                        : theme['text-basic-color'],
                                            },
                                        ]}
                                    >
                                        {value}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <Text category="s1" style={styles.filterSectionTitle}>
                            Trạng thái
                        </Text>
                        <View style={styles.chipContainer}>
                            {statusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.chip,
                                        selectedStatus === option.value && styles.chipSelected,
                                        {
                                            borderColor: theme['border-basic-color-3'],
                                            backgroundColor:
                                                selectedStatus === option.value
                                                    ? theme['color-primary-100']
                                                    : theme['background-basic-color-1'],
                                        },
                                    ]}
                                    onPress={() =>
                                        setSelectedStatus((prevStatus) =>
                                            prevStatus === option.value ? undefined : option.value,
                                        )
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            {
                                                color:
                                                    selectedStatus === option.value
                                                        ? theme['color-primary-600']
                                                        : theme['text-basic-color'],
                                            },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Movie Quality Filter */}
                    <View style={styles.filterSection}>
                        <Text category="s1" style={styles.filterSectionTitle}>
                            Chất lượng
                        </Text>
                        <View style={styles.chipContainer}>
                            {qualityOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.chip,
                                        selectedQuality === option.value && styles.chipSelected,
                                        {
                                            borderColor: option.color,
                                            backgroundColor:
                                                selectedQuality === option.value
                                                    ? option.color
                                                    : theme['background-basic-color-1'],
                                        },
                                    ]}
                                    onPress={() =>
                                        setSelectedQuality((prev) =>
                                            prev === option.value ? undefined : option.value,
                                        )
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            {
                                                color:
                                                    selectedQuality === option.value
                                                        ? option.textColor
                                                        : theme['text-basic-color'],
                                                fontWeight: 'bold',
                                            },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Content Rating Filter */}
                    <View style={styles.filterSection}>
                        <Text category="s1" style={styles.filterSectionTitle}>
                            Phân loại độ tuổi
                        </Text>
                        <View style={styles.chipContainer}>
                            {contentRatingOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.chip,
                                        selectedContentRating === option.value &&
                                            styles.chipSelected,
                                        {
                                            borderColor: option.color,
                                            backgroundColor:
                                                selectedContentRating === option.value
                                                    ? option.color
                                                    : theme['background-basic-color-1'],
                                        },
                                    ]}
                                    onPress={() =>
                                        setSelectedContentRating((prev) =>
                                            prev === option.value ? undefined : option.value,
                                        )
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            {
                                                color:
                                                    selectedContentRating === option.value
                                                        ? option.textColor
                                                        : theme['text-basic-color'],
                                                fontWeight: 'bold',
                                            },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <Text category="s1" style={styles.filterSectionTitle}>
                            Tùy chọn khác
                        </Text>
                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ color: theme['text-hint-color'], marginBottom: 4 }}>
                                Phim chiếu rạp:
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                {['Tất cả', 'Có', 'Không'].map((label, idx) => {
                                    const value = idx === 0 ? undefined : idx === 1 ? true : false;
                                    const selected =
                                        isCinemaRelease === value ||
                                        (idx === 0 && isCinemaRelease === undefined);
                                    return (
                                        <TouchableOpacity
                                            key={label}
                                            style={[
                                                styles.chip,
                                                {
                                                    paddingHorizontal: 16,
                                                    marginRight: idx < 2 ? 8 : 0,
                                                },
                                                selected && styles.chipSelected,
                                                {
                                                    borderColor: theme['border-basic-color-3'],
                                                    backgroundColor: selected
                                                        ? theme['color-primary-100']
                                                        : theme['background-basic-color-1'],
                                                },
                                            ]}
                                            onPress={() => setIsCinemaRelease(value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    {
                                                        color: selected
                                                            ? theme['color-primary-600']
                                                            : theme['text-basic-color'],
                                                        fontWeight: selected ? 'bold' : 'normal',
                                                    },
                                                ]}
                                            >
                                                {label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ color: theme['text-hint-color'], marginBottom: 4 }}>
                                Phim bản quyền:
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                {['Tất cả', 'Có', 'Không'].map((label, idx) => {
                                    const value = idx === 0 ? undefined : idx === 1 ? true : false;
                                    const selected =
                                        isCopyright === value ||
                                        (idx === 0 && isCopyright === undefined);
                                    return (
                                        <TouchableOpacity
                                            key={label}
                                            style={[
                                                styles.chip,
                                                {
                                                    paddingHorizontal: 16,
                                                    marginRight: idx < 2 ? 8 : 0,
                                                },
                                                selected && styles.chipSelected,
                                                {
                                                    borderColor: theme['border-basic-color-3'],
                                                    backgroundColor: selected
                                                        ? theme['color-primary-100']
                                                        : theme['background-basic-color-1'],
                                                },
                                            ]}
                                            onPress={() => setIsCopyright(value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    {
                                                        color: selected
                                                            ? theme['color-primary-600']
                                                            : theme['text-basic-color'],
                                                        fontWeight: selected ? 'bold' : 'normal',
                                                    },
                                                ]}
                                            >
                                                {label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <Text category="s1" style={styles.filterSectionTitle}>
                            Thể loại
                        </Text>
                        <View style={styles.chipContainer}>
                            {categoriesData?.data?.map((category) => (
                                <TouchableOpacity
                                    key={category.slug}
                                    style={[
                                        styles.chip,
                                        selectedCategories.includes(category.slug) &&
                                            styles.chipSelected,
                                        {
                                            borderColor: theme['border-basic-color-3'],
                                            backgroundColor: selectedCategories.includes(
                                                category.slug,
                                            )
                                                ? theme['color-primary-100']
                                                : theme['background-basic-color-1'],
                                        },
                                    ]}
                                    onPress={() => {
                                        setSelectedCategories((prev) => {
                                            if (prev.includes(category.slug)) {
                                                return prev.filter(
                                                    (slug) => slug !== category.slug,
                                                );
                                            } else {
                                                return [...prev, category.slug];
                                            }
                                        });
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            {
                                                color: selectedCategories.includes(category.slug)
                                                    ? theme['color-primary-600']
                                                    : theme['text-basic-color'],
                                            },
                                        ]}
                                    >
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <Text category="s1" style={styles.filterSectionTitle}>
                            Quốc gia
                        </Text>
                        <View style={styles.chipContainer}>
                            {regionsData?.data?.map((region) => (
                                <TouchableOpacity
                                    key={region.slug}
                                    style={[
                                        styles.chip,
                                        selectedRegions.includes(region.slug) &&
                                            styles.chipSelected,
                                        {
                                            borderColor: theme['border-basic-color-3'],
                                            backgroundColor: selectedRegions.includes(region.slug)
                                                ? theme['color-primary-100']
                                                : theme['background-basic-color-1'],
                                        },
                                    ]}
                                    onPress={() => {
                                        setSelectedRegions((prev) => {
                                            if (prev.includes(region.slug)) {
                                                return prev.filter((slug) => slug !== region.slug);
                                            } else {
                                                return [...prev, region.slug];
                                            }
                                        });
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            {
                                                color: selectedRegions.includes(region.slug)
                                                    ? theme['color-primary-600']
                                                    : theme['text-basic-color'],
                                            },
                                        ]}
                                    >
                                        {region.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <Divider style={styles.filterDivider} />
                <View style={styles.filterFooter}>
                    <Button appearance="outline" style={styles.clearButton} onPress={clearFilters}>
                        Xóa bộ lọc
                    </Button>
                    <Button style={styles.applyButton} onPress={applyFilters}>
                        Áp dụng
                    </Button>
                </View>
            </Card>
        </Modal>
    );

    const renderSortModal = () => (
        <Modal
            visible={sortModalVisible}
            backdropStyle={styles.modalBackdrop}
            onBackdropPress={() => setSortModalVisible(false)}
            style={styles.sortModal}
        >
            <Card disabled style={styles.sortCard}>
                <Text category="h6" style={styles.filterHeader}>
                    Sắp xếp theo
                </Text>
                <Divider style={styles.filterDivider} />

                <ScrollView style={styles.filterContent}>
                    {sortOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.sortOption,
                                sortOption === option.value && styles.sortOptionSelected,
                                {
                                    backgroundColor:
                                        sortOption === option.value
                                            ? theme['color-primary-100']
                                            : theme['background-basic-color-1'],
                                },
                            ]}
                            onPress={() => handleSortSelection(option.value)}
                        >
                            <Text
                                style={[
                                    styles.sortOptionText,
                                    {
                                        color:
                                            sortOption === option.value
                                                ? theme['color-primary-600']
                                                : theme['text-basic-color'],
                                    },
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Card>
        </Modal>
    );

    const allMovies = data?.pages.flatMap((page) => page.data) || [];

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme['background-basic-color-1'] }]}
        >
            <Layout
                style={[styles.container, { backgroundColor: theme['background-basic-color-1'] }]}
            >
                <Animated.View style={styles.searchContainer} layout={LinearTransition}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft color={theme['text-basic-color']} size={24} />
                    </TouchableOpacity>
                    <Input
                        ref={inputRef}
                        placeholder="Tìm phim theo tên, nội dung..."
                        value={inputValue}
                        onChangeText={handleInputChange}
                        onSubmitEditing={handleSearch}
                        style={styles.searchInput}
                        accessoryRight={(props) =>
                            inputValue ? (
                                <TouchableOpacity onPress={handleClearInput}>
                                    <X color={theme['text-hint-color']} size={20} />
                                </TouchableOpacity>
                            ) : (
                                <Search
                                    {...removeStyleProperty(props)}
                                    color={theme['text-basic-color']}
                                    size={20}
                                />
                            )
                        }
                    />
                </Animated.View>

                <View style={styles.filterContainer}>
                    <View style={styles.aiToggleContainer}>
                        <Text
                            style={{
                                color: theme['text-hint-color'],
                                marginRight: 8,
                                fontSize: 12,
                            }}
                        >
                            Tìm kiếm với AI
                        </Text>
                        <Toggle checked={useAI} onChange={handleAIToggle} style={styles.aiToggle} />
                    </View>

                    <View style={styles.filterButtonsContainer}>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                { borderColor: theme['border-basic-color-3'] },
                            ]}
                            onPress={() => setSortModalVisible(true)}
                        >
                            <SortDesc size={16} color={theme['text-basic-color']} />
                            <Text
                                style={{
                                    color: theme['text-basic-color'],
                                    marginLeft: 4,
                                    fontSize: 12,
                                }}
                            >
                                Sắp xếp
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                { borderColor: theme['border-basic-color-3'] },
                            ]}
                            onPress={() => setFilterVisible(true)}
                        >
                            <View style={styles.badgeContainer}>
                                {getActiveFilterCount() > 0 && (
                                    <View
                                        style={[
                                            styles.badge,
                                            { backgroundColor: theme['color-primary-500'] },
                                        ]}
                                    >
                                        <Text style={styles.badgeText}>
                                            {getActiveFilterCount()}
                                        </Text>
                                    </View>
                                )}
                                <FilterIcon size={16} color={theme['text-basic-color']} />
                            </View>
                            <Text
                                style={{
                                    color: theme['text-basic-color'],
                                    marginLeft: 4,
                                    fontSize: 12,
                                }}
                            >
                                Bộ lọc
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {useAI && sortOption !== 'bestMatch,asc' && (
                    <View style={styles.aiSuggestionContainer}>
                        <View
                            style={[
                                styles.aiSuggestion,
                                { backgroundColor: theme['color-info-100'] },
                            ]}
                        >
                            <AlertCircle size={16} color={theme['color-info-600']} />
                            <Text
                                style={[
                                    styles.aiSuggestionText,
                                    { color: theme['color-info-600'] },
                                ]}
                            >
                                Gợi ý: Chọn sắp xếp theo "Phù hợp nhất" để có kết quả tốt hơn với
                                tìm kiếm AI
                            </Text>
                            <TouchableOpacity
                                onPress={() => handleSortSelection('bestMatch,asc')}
                                style={styles.aiSuggestionButton}
                            >
                                <Text
                                    style={[
                                        styles.aiSuggestionButtonText,
                                        { color: theme['color-primary-500'] },
                                    ]}
                                >
                                    Đổi ngay
                                </Text>
                                <Zap size={14} color={theme['color-primary-500']} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {isError ? (
                    <TouchableOpacity style={styles.errorContainer} onPress={() => refetch()}>
                        <Text style={[styles.errorText, { color: theme['color-danger-500'] }]}>
                            Có lỗi xảy ra khi tìm kiếm phim. Chạm để thử lại.
                        </Text>
                    </TouchableOpacity>
                ) : isLoading || isSearching ? (
                    <SkeletonLoader />
                ) : (
                    // eslint-disable-next-line react/jsx-no-useless-fragment
                    <>
                        {allMovies.length === 0 ? (
                            renderEmptyState()
                        ) : (
                            <Animated.FlatList
                                ref={flatListRef}
                                data={allMovies}
                                renderItem={renderMovieItem}
                                keyExtractor={keyExtractor}
                                style={styles.resultsList}
                                contentContainerStyle={styles.resultsContent}
                                onEndReached={() => {
                                    if (hasNextPage) {
                                        fetchNextPage();
                                    }
                                }}
                                onEndReachedThreshold={0.5}
                                ListFooterComponent={renderFooter}
                                initialNumToRender={10}
                                maxToRenderPerBatch={10}
                                windowSize={10}
                                refreshing={isLoading}
                                onRefresh={refetch}
                                ItemSeparatorComponent={() => (
                                    <Divider
                                        style={{ backgroundColor: theme['border-basic-color-3'] }}
                                    />
                                )}
                            />
                        )}
                    </>
                )}
            </Layout>

            {renderFilterModal()}
            {renderSortModal()}

            <AgeVerificationModal
                visible={isLoginModalVisible}
                onClose={() => setIsLoginModalVisible(false)}
                onAccept={() => setIsLoginModalVisible(false)}
                isAuthenticated={isAuthenticated}
                maskClosable={true}
                contentRating={undefined}
                quality={undefined}
                title="Tính năng tìm kiếm AI"
                featureAccess={true}
                primaryMessage="Yêu cầu đăng nhập"
                primaryDescription="Bạn cần đăng nhập để sử dụng tính năng tìm kiếm thông minh với AI."
                reasonList={[
                    'Tìm kiếm AI là tính năng cao cấp dành cho người dùng đã đăng nhập.',
                    'Giúp chúng tôi cá nhân hóa kết quả tìm kiếm phù hợp với sở thích của bạn.',
                    'Cho phép bạn lưu trữ và theo dõi lịch sử tìm kiếm thông minh.',
                    'Bảo vệ hệ thống khỏi việc sử dụng quá mức và lạm dụng tài nguyên.',
                    'Hỗ trợ chúng tôi cải thiện chất lượng dịch vụ tìm kiếm AI.',
                ]}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginVertical: 12,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    searchInput: {
        flex: 1,
        borderRadius: 12,
    },
    filterContainer: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginBottom: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    aiToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiToggle: {
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    },
    filterButtonsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    badgeContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        right: -6,
        top: -6,
        width: 14,
        height: 14,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    badgeText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
    },
    aiSuggestionContainer: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    aiSuggestion: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
    },
    aiSuggestionText: {
        fontSize: 12,
        marginLeft: 8,
        flex: 1,
    },
    aiSuggestionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 6,
    },
    aiSuggestionButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 4,
    },
    resultsList: {
        flex: 1,
    },
    resultsContent: {
        paddingHorizontal: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        textAlign: 'center',
        fontSize: 14,
    },
    footerLoader: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    poster: {
        width: 70,
        height: 100,
        borderRadius: 8,
    },
    skeletonContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    skeletonItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
    },
    skeletonImage: {
        width: 50,
        height: 75,
        borderRadius: 8,
    },
    skeletonContent: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    skeletonTitle: {
        height: 20,
        width: '80%',
        marginBottom: 8,
        borderRadius: 4,
    },
    skeletonDescription: {
        height: 16,
        width: '60%',
        borderRadius: 4,
    },
    movieItemContainer: {
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    movieItemTouchable: {
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden',
        padding: 10,
    },
    posterContainer: {
        position: 'relative',
    },
    movieInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    movieTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    originalTitle: {
        fontSize: 13,
        marginBottom: 4,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    metaText: {
        fontSize: 12,
        marginLeft: 3,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    statText: {
        fontSize: 12,
        marginLeft: 3,
    },
    qualityBadge: {
        position: 'absolute',
        top: 5,
        left: 5,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    qualityText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    typeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 6,
    },
    typeText: {
        fontSize: 10,
    },
    langBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    langText: {
        fontSize: 10,
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    emptyStateImage: {
        width: 150,
        height: 150,
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyStateDescription: {
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 14,
    },
    emptyStateButton: {
        marginTop: 8,
    },
    modalBackdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    filterModal: {
        width: '90%',
        maxHeight: '80%',
    },
    sortModal: {
        width: '80%',
    },
    filterCard: {
        borderRadius: 12,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    sortCard: {
        borderRadius: 12,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    filterHeader: {
        marginVertical: 12,
        textAlign: 'center',
    },
    filterDivider: {
        marginVertical: 0,
    },
    filterContent: {
        padding: 16,
        maxHeight: 400,
    },
    filterSection: {
        marginBottom: 20,
    },
    filterSectionTitle: {
        marginBottom: 10,
        fontWeight: 'bold',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
    },
    chipSelected: {
        borderWidth: 1,
    },
    chipText: {
        fontSize: 12,
    },
    checkboxContainer: {
        marginTop: 8,
    },
    checkbox: {
        marginBottom: 12,
    },
    filterFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    clearButton: {
        flex: 1,
        marginRight: 8,
    },
    applyButton: {
        flex: 1,
        marginLeft: 8,
    },
    sortOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    sortOptionSelected: {
        borderWidth: 0,
    },
    sortOptionText: {
        fontSize: 14,
    },
});
