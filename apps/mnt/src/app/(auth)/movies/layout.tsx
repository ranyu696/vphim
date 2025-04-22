import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
    title: 'Phim',
    description: 'Quản lý phim',
};

export default function MoviesLayout({ children }: PropsWithChildren) {
    return <>{children}</>;
}
