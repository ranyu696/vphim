import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
    title: 'Thể loại',
    description: 'Quản lý thể loại',
};

export default function CategoriesLayout({ children }: PropsWithChildren) {
    return <>{children}</>;
}
