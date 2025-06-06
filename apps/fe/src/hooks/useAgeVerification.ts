import { useState, useEffect } from 'react';
import { MovieContentRatingEnum, MovieQualityEnum } from 'apps/api/src/app/movies/movie.constant';

// Restricted content types that require verification
const RESTRICTED_RATINGS = [
    MovieContentRatingEnum.C,
    MovieContentRatingEnum.K,
    MovieContentRatingEnum.T13,
    MovieContentRatingEnum.T16,
    MovieContentRatingEnum.T18,
];

// Non-restricted content that should never need verification
const UNRESTRICTED_RATINGS = [MovieContentRatingEnum.P];

const RESTRICTED_QUALITIES = [MovieQualityEnum._4K, MovieQualityEnum.FHD];

// Session storage key to avoid showing the modal again in the same session
const AGE_VERIFICATION_KEY = 'vphim_age_verified';

type VerificationState = {
    [key: string]: boolean;
};

export const useAgeVerification = (
    contentRating?: string,
    quality?: string,
    isAuthenticated = false,
) => {
    const [needsVerification, setNeedsVerification] = useState<boolean>(false);
    const [isVerificationModalVisible, setIsVerificationModalVisible] = useState<boolean>(false);
    const [verifiedContent, setVerifiedContent] = useState<VerificationState>(() => {
        if (typeof window === 'undefined') return {}; // Server-side rendering check

        // Load previously verified content from session storage
        const storedData = sessionStorage.getItem(AGE_VERIFICATION_KEY);
        return storedData ? JSON.parse(storedData) : {};
    });

    // Check if verification is needed
    useEffect(() => {
        if (typeof window === 'undefined') return; // Server-side rendering check

        // Check if this content is restricted using the utility function
        const isRestricted = checkContentRestriction(contentRating, quality);

        // If content is not restricted, no verification needed
        if (!isRestricted) {
            setNeedsVerification(false);
            return;
        }

        // If user is not authenticated, they always need verification for restricted content
        if (!isAuthenticated) {
            setNeedsVerification(true);
            setIsVerificationModalVisible(true);
            return;
        }

        // For authenticated users, check if they've verified this content before
        const hasVerifiedBefore =
            getContentVerificationKey(contentRating, quality) in verifiedContent;

        const needsToVerify = isRestricted && !hasVerifiedBefore;

        setNeedsVerification(needsToVerify);

        // Show modal immediately if verification is needed
        if (needsToVerify) {
            setIsVerificationModalVisible(true);
        }
    }, [contentRating, quality, verifiedContent, isAuthenticated]);

    // Generate a unique key for the content
    const getContentVerificationKey = (contentRating?: string, quality?: string): string => {
        return `${contentRating?.toLowerCase() || 'none'}_${quality?.toLowerCase() || 'none'}`;
    };

    // Mark content as verified and store in session storage
    const markContentAsVerified = () => {
        if (typeof window === 'undefined') return; // Server-side rendering check

        const key = getContentVerificationKey(contentRating, quality);
        const newVerifiedContent = {
            ...verifiedContent,
            [key]: true,
        };

        setVerifiedContent(newVerifiedContent);
        sessionStorage.setItem(AGE_VERIFICATION_KEY, JSON.stringify(newVerifiedContent));
        setIsVerificationModalVisible(false);
        setNeedsVerification(false);
    };

    // Check if content needs verification
    const checkContentRestriction = (contentRating?: string, quality?: string): boolean => {
        // If no content rating or quality provided, default to unrestricted
        if (!contentRating && !quality) return false;

        // Normalize content rating to lowercase to match enum values
        const normalizedRating = contentRating?.toLowerCase();
        const normalizedQuality = quality?.toLowerCase();

        // Check quality restriction first - high quality always needs verification
        const needsQualityRestriction =
            normalizedQuality &&
            RESTRICTED_QUALITIES.includes(normalizedQuality as MovieQualityEnum);

        // If it's high quality, always require verification
        if (needsQualityRestriction) {
            return true;
        }

        // If it's explicitly a non-restricted rating, it doesn't need verification
        if (
            normalizedRating &&
            UNRESTRICTED_RATINGS.includes(normalizedRating as MovieContentRatingEnum)
        ) {
            return false;
        }

        // Check content rating restriction
        const needsContentRatingRestriction =
            normalizedRating &&
            RESTRICTED_RATINGS.includes(normalizedRating as MovieContentRatingEnum);

        return needsContentRatingRestriction;
    };

    // Show the verification modal on demand
    const showVerificationModal = () => {
        setIsVerificationModalVisible(true);
    };

    // Hide the verification modal
    const hideVerificationModal = () => {
        setIsVerificationModalVisible(false);
    };

    return {
        needsVerification,
        isVerificationModalVisible,
        showVerificationModal,
        hideVerificationModal,
        markContentAsVerified,
        checkContentRestriction,
    };
};
