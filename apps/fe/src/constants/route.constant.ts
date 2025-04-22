export const RouteNamePublic = {
    HOME_PAGE: '/',
    MOVIE_PAGE: '/phim',
    MOVIE_LIST_PAGE: '/danh-sach-phim',
    TERMS_OF_SERVICE_PAGE: '/dieu-khoan',
    CONTACT_PAGE: '/lien-he',
    ABOUT_PAGE: '/ve-chung-toi',
} as const;

export const RouteNameEnumAuth = {
    HISTORY_PAGE: '/lich-su',
    USER_PROFILE_PAGE: '/nguoi-dung',
    UPDATE_USER_PROFILE_PAGE: '/nguoi-dung/cap-nhat-thong-tin',
    MOVIE_FAVORITE_PAGE: '/tu-phim',
} as const;

export const RouteNameEnumNotAuth = {
    LOGIN_PAGE: '/dang-nhap',
} as const;

export const RouteNameEnum = {
    ...RouteNamePublic,
    ...RouteNameEnumAuth,
    ...RouteNameEnumNotAuth,
} as const;
