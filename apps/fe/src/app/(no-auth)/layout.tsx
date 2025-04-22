'use client';

import { PropsWithChildren } from 'react';
import { useIsAuthenticated } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { Layout } from 'antd';
import '@/components/layout/layout.css';

const { Content } = Layout;

export default function NoAuthLayout({ children }: PropsWithChildren) {
    const router = useRouter();
    const { data, isLoading } = useIsAuthenticated();

    if (!isLoading && data?.authenticated) {
        router.replace('/');
        return <></>;
    }

    if (isLoading) {
        return <></>;
    }

    return (
        <Layout className="auth-layout">
            <Content>
                <div className="layout-space-container">{children}</div>
            </Content>
        </Layout>
    );
}
