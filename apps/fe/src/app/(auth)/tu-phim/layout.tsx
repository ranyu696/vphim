import type { Metadata } from 'next';

import { getCategories } from '@/services/categories';
import { getRegions } from '@/services/regions';
import { LayoutComponent } from '@/components/layout';

export const metadata: Metadata = {
    title: 'Tủ phim của bạn',
};

export default async function FollowedMoviesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [categories, regions] = await Promise.all([
        getCategories({
            pagination: {
                current: 1,
                pageSize: 200,
            },
        }),
        getRegions({
            pagination: {
                current: 1,
                pageSize: 200,
            },
        }),
    ]);

    return (
        <LayoutComponent categories={categories} regions={regions}>
            {children}
        </LayoutComponent>
    );
}
