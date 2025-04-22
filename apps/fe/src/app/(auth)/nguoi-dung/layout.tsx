import { Layout } from 'antd';
import { PropsWithChildren } from 'react';
import '@/components/layout/layout.css'; // Import the global layout CSS
import { LayoutComponent } from '@/components/layout';
import { getCategories } from '@/services/categories';
import { getRegions } from '@/services/regions';

export default async function UserPageLayout({ children }: PropsWithChildren) {
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
            <Layout
                className="auth-layout"
                style={{
                    height: '100vh',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <div className="layout-space-container">{children}</div>
            </Layout>
        </LayoutComponent>
    );
}
