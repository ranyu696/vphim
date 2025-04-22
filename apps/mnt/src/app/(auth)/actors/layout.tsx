import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
    title: 'Diễn viên',
    description: 'Quản lý diễn viên',
};

export default function ActorsLayout({ children }: PropsWithChildren) {
    return <>{children}</>;
}
