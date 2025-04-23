'use client';

import { Edit, ListButton, RefreshButton, useForm } from '@refinedev/antd';
import { type RegionType } from '~api/app/regions/region.type';
import { BaseResourceForm } from '~mnt/components/form/resource/base-resource-form';
import { MNT_REGION_QUERY, MNT_REGION_UPDATE } from '~mnt/queries/region.query';

export type EditRegionPageProps = {
    params: { id: string };
};

export default function EditRegion({ params }: EditRegionPageProps) {
    const { formProps, saveButtonProps } = useForm<RegionType>({
        dataProviderName: 'graphql',
        resource: 'countries',
        action: 'edit',
        meta: {
            gqlQuery: MNT_REGION_QUERY,
            gqlMutation: MNT_REGION_UPDATE,
            operation: 'region',
            variables: {
                input: {
                    _id: params.id,
                },
            },
        },
        errorNotification: {
            type: 'error',
            message: 'Lỗi khi chỉnh sửa khu vực/quốc gia, vui lòng thử lại',
        },
        successNotification: {
            type: 'success',
            message: 'Khu vực/quốc gia đã được chỉnh sửa thành công',
        },
    });

    return (
        <Edit
            title={`Chỉnh sửa quốc gia "${formProps.initialValues?.name}"`}
            headerButtons={({ listButtonProps, refreshButtonProps }) => (
                <>
                    <ListButton {...listButtonProps}>Danh sách khu vực/quốc gia</ListButton>
                    <RefreshButton {...refreshButtonProps}>Làm mới</RefreshButton>
                </>
            )}
            saveButtonProps={saveButtonProps}
        >
            <BaseResourceForm
                formProps={formProps}
                type="create"
                gqlQuery={MNT_REGION_QUERY}
                operation="region"
            />
        </Edit>
    );
}
