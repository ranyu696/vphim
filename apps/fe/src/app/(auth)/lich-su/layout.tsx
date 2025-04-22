import type { Metadata } from 'next';

import { getRegions } from '@/services/regions';
import { getCategories } from '@/services/categories';
import { LayoutComponent } from '@/components/layout';

export const metadata: Metadata = {
    title: 'Lịch sử xem phim',
};

export default async function WatchHistoryLayout({
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
