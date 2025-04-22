import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
    title: 'Người dùng',
    description: 'Quản lý người dùng',
};

export default function UsersLayout({ children }: PropsWithChildren) {
    return <>{children}</>;
}
