import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
    title: 'Khu vực',
    description: 'Quản lý khu vực/quốc gia',
};

export default function RegionsLayout({ children }: PropsWithChildren) {
    return <>{children}</>;
}
