'use client';

import { PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useGetIdentity } from '@refinedev/core';

import { UserType } from '~api/app/users/user.type';
import { UserRoleEnum } from '~api/app/users/users.enum';

import Loading from '~mnt/app/loading';

type AuthWrapperProps = PropsWithChildren<{
    accessType: 'public' | 'authenticated' | 'not-authenticated';
}>;

export function AuthWrapper({ children, accessType }: AuthWrapperProps) {
    const router = useRouter();
    const { data: user, isLoading: isIdentityLoading } = useGetIdentity<UserType>();

    if (isIdentityLoading) {
        return <Loading />;
    }

    const isAuthenticated = !!user;
    const isAdmin = user?.role === UserRoleEnum.Admin;
    const isBlocked = user?.block?.isBlocked;

    if (isBlocked) {
        signOut({ redirect: true, callbackUrl: '/login?e=blocked' });
        return <></>;
    }

    switch (accessType) {
        case 'public': {
            return <>{children}</>;
        }

        // This is authenticated layout, if user is not authenticated, redirect to login
        // This is used for the dashboard page
        case 'authenticated': {
            if (!isAuthenticated) {
                signOut({ redirect: true, callbackUrl: '/login' });
            } else if (!isAdmin) {
                signOut({ redirect: true, callbackUrl: '/login?e=not-admin' });
            } else {
                return <>{children}</>;
            }
            break;
        }

        // This is not-authenticated layout, if user is authenticated, redirect to dashboard
        // This is used for the login page
        case 'not-authenticated': {
            if (isAuthenticated) {
                router.replace('/dashboard');
            } else {
                return <>{children}</>;
            }
            break;
        }
        default: {
            return <>{children}</>;
        }
    }

    return <Loading />;
}
