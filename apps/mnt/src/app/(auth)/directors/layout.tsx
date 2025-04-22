import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
    title: 'Đạo diễn',
    description: 'Quản lý đạo diễn',
};

export default function DirectorsLayout({ children }: PropsWithChildren) {
    return <>{children}</>;
}
