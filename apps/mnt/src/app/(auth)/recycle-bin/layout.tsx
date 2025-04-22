import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
    title: 'Phim đã xóa',
    description: 'Quản lý phim đã xóa',
};

export default function RecycleBinLayout({ children }: PropsWithChildren) {
    return <>{children}</>;
}
