import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
    title: 'Hồ sơ',
    description: 'Chỉnh sửa hồ sơ',
};

export default function ProfileLayout({ children }: PropsWithChildren) {
    return <>{children}</>;
}
