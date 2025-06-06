'use client';

import { AuthProvider } from '@refinedev/core';
import { signIn, getSession, signOut } from 'next-auth/react';
import { AxiosError, AxiosInstance } from 'axios';
import { print } from 'graphql/language/printer';
import { axiosInstance } from '@/libs/axios';

import type { ProblemDetails } from 'apps/api/src/libs/dtos/problem-details.dto';
import type { LoginResponseDto } from 'apps/api/src/app/auth/dtos/login-response.dto';

import type { LoginActionPayload, LoginAction, RequestLoginAction } from './types/login.type';
import {
    RegisterAction,
    RegisterActionPayload,
    RequestRegisterAction,
} from './types/register.type';
import { RouteNameEnum } from '@/constants/route.constant';
import { GET_ME_QUERY } from '@/queries/users';

export const authProvider = (
    _axios: AxiosInstance = axiosInstance,
    authAxios: AxiosInstance = axiosInstance,
): AuthProvider => {
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api`;

    return {
        login: async ({ type, ...data }: LoginActionPayload) => {
            if (type === 'request-login') {
                const path = `${baseUrl}/auth/login/pwdless`;
                const requestData = data as RequestLoginAction;

                return _axios
                    .post<void>(path, requestData)
                    .then(() => {
                        return {
                            success: true,
                            redirectTo: data?.['redirectTo'] || RouteNameEnum.LOGIN_PAGE,
                            redirect: true,
                            successNotification: {
                                description: 'Thành công',
                                message: `Kiểm tra email của bạn, bấm vào đường link để tiếp tục đăng nhập`,
                            },
                        };
                    })
                    .catch((error: AxiosError<ProblemDetails>) => {
                        const resultResponse = {
                            success: false,
                            error: {
                                name: 'Thất bại',
                                message:
                                    'Đăng nhập thất bại, kiểm tra lại email của bạn và thử lại sau',
                            },
                        };

                        if (error.response?.status === 429) {
                            resultResponse.error.name = 'Giới hạn yêu cầu';
                            const resetTime =
                                error.response.headers['x-ratelimit-reset-request-passwordless'];

                            if (resetTime) {
                                resultResponse.error.message = `Bạn đã yêu cầu quá nhiều lần. Vui lòng đợi ${resetTime} giây trước khi thử lại.`;
                            } else {
                                resultResponse.error.message =
                                    'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.';
                            }

                            return resultResponse;
                        }

                        if (error.response?.data?.errors) {
                            const errors = error.response.data.errors;

                            if (errors['email']) {
                                const err = errors['email'] as string;
                                switch (err) {
                                    case 'notFound': {
                                        resultResponse.error.message =
                                            'Email của bạn chưa được đăng ký, vui lòng đăng ký trước';
                                        break;
                                    }
                                    default: {
                                        resultResponse.error.message = error.response?.data?.detail;
                                        break;
                                    }
                                }
                            }
                        }

                        return resultResponse;
                    });
            } else {
                const loginData = data as LoginAction;
                const { hash, provider = null, to = '/' } = loginData;
                if (provider === 'google') {
                    signIn('google', {
                        callbackUrl: to,
                        redirect: true,
                    });

                    return {
                        success: true,
                        redirectTo: to,
                    };
                }

                try {
                    await signIn('credentials', { hash, redirect: true, callbackUrl: to, ...data });
                    return {
                        success: true,
                        redirect: data?.['redirect'] || true,
                        redirectTo: data?.['to'] || to,
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: {
                            name: 'Đăng nhập thất bại',
                            message:
                                'Đăng nhập thất bại, kiểm tra lại email của bạn và thử lại sau',
                        },
                    };
                }
            }
        },
        register: async ({ type, ...data }: RegisterActionPayload) => {
            if (type === 'request-register') {
                const loginData = data as RequestRegisterAction;
                const { email, fullName = undefined, returnUrl } = loginData;
                const path = `${baseUrl}/auth/register`;

                return _axios
                    .post<void>(path, { email, fullName, returnUrl })
                    .then(() => {
                        return {
                            success: true,
                            redirectTo: '/',
                            successNotification: {
                                description: 'Thành công',
                                message: `Kiểm tra email của bạn, bấm vào đường link để tiếp tục đăng ký`,
                            },
                        };
                    })
                    .catch((error) => {
                        const resultResponse = {
                            success: false,
                            error: {
                                name: 'Lỗi đăng ký',
                                message: 'Đã xảy ra lỗi, vui lòng thử lại sau',
                            },
                        };

                        if (error.response?.status === 429) {
                            resultResponse.error.name = 'Giới hạn yêu cầu';
                            const resetTime =
                                error.response.headers['x-ratelimit-reset-request-passwordless'];

                            if (resetTime) {
                                resultResponse.error.message = `Bạn đã yêu cầu quá nhiều lần. Vui lòng đợi ${resetTime} giây trước khi thử lại.`;
                            } else {
                                resultResponse.error.message =
                                    'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.';
                            }

                            return resultResponse;
                        }

                        if (error.response?.data?.errors) {
                            const errors = error.response.data.errors;

                            if (errors['email']) {
                                const err = errors['email'] as string;
                                switch (err) {
                                    case 'emailAlreadyExists': {
                                        resultResponse.error.message =
                                            'Email của bạn đã được đăng ký, vui lòng đăng nhập';
                                        break;
                                    }
                                    default: {
                                        resultResponse.error.message = error.response?.data?.detail;
                                        break;
                                    }
                                }
                            }
                        }

                        return resultResponse;
                    });
            } else {
                const path = `${baseUrl}/auth/register/confirm`;
                const registerData = data as RegisterAction;
                const { hash } = registerData;

                return _axios
                    .post<void>(path, { hash })
                    .then(() => {
                        return {
                            success: true,
                            redirectTo: RouteNameEnum.LOGIN_PAGE,
                            successNotification: {
                                message: 'Bạn đã đăng ký thành công',
                                description: 'Quay lại trang đăng nhập và tiếp tục truy cập VePhim',
                            },
                        };
                    })
                    .catch((error) => {
                        const resultResponse = {
                            success: false,
                            error: {
                                name: 'Lỗi đăng ký',
                                message: 'Đã xảy ra lỗi, vui lòng thử lại sau',
                            },
                        };

                        if (error.response?.data?.errors) {
                            const errors = error.response.data.errors;

                            if (errors['hash']) {
                                const err = errors['hash'] as string;
                                switch (err) {
                                    case 'invalidHash': {
                                        resultResponse.error.message =
                                            'Đường dẫn xác nhận của bạn đã hết hạn hoặc không hợp lệ';
                                        break;
                                    }
                                    default: {
                                        resultResponse.error.message = error.response?.data?.detail;
                                        break;
                                    }
                                }
                            } else if (errors['user']) {
                                const err = errors['user'] as string;
                                switch (err) {
                                    case 'alreadyConfirmed': {
                                        resultResponse.error.message =
                                            'Email của bạn đã được xác nhận, vui lòng đăng nhập';
                                        break;
                                    }
                                    case 'userNotFound': {
                                        resultResponse.error.message =
                                            'Email của bạn chưa được đăng ký, vui lòng đăng ký trước';
                                        break;
                                    }
                                    default: {
                                        resultResponse.error.message = error.response?.data?.detail;
                                        break;
                                    }
                                }
                            } else {
                                resultResponse.error.message = error.response?.data?.detail;
                            }
                        }

                        return resultResponse;
                    });
            }
        },
        logout: async () => {
            await signOut();
            return {
                success: true,
                redirectTo: '/',
            };
        },
        check: async () => {
            const auth = await getSession();
            if (auth) {
                return {
                    authenticated: true,
                };
            }

            return {
                authenticated: false,
            };
        },
        getIdentity: async () => {
            const auth = await getSession();
            if (!auth?.user) {
                return null;
            }

            const { refreshToken, accessToken, ...user } = auth.user as LoginResponseDto;
            if (!accessToken) {
                return null;
            }

            const {
                data: { data: res },
            } = await authAxios.post<any>(
                `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
                {
                    query: print(GET_ME_QUERY),
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );
            const getMe = res?.['getMe'];
            if (!getMe) {
                return null;
            }
            return { ...user, ...getMe };
        },
        onError: async (error) => {
            if (error.response?.status === 401) {
                return {
                    logout: true,
                };
            }

            return { error };
        },
    };
};
