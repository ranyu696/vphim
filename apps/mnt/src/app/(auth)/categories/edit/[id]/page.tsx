'use client';

import { Edit, RefreshButton, ListButton, useForm } from '@refinedev/antd';
import { type CategoryType } from '~api/app/categories/category.type';
import { BaseResourceForm } from '~mnt/components/form/resource/base-resource-form';
import { MNT_CATEGORY_QUERY, MNT_CATEGORY_UPDATE } from '~mnt/queries/category.query';

export type EditCategoryPageProps = {
    params: { id: string };
};

export default function EditCategory({ params }: EditCategoryPageProps) {
    const { formProps, saveButtonProps } = useForm<CategoryType>({
        dataProviderName: 'graphql',
        resource: 'categories',
        action: 'edit',
        meta: {
            gqlQuery: MNT_CATEGORY_QUERY,
            gqlMutation: MNT_CATEGORY_UPDATE,
            operation: 'category',
            variables: {
                input: {
                    _id: params.id,
                },
            },
        },
        errorNotification: {
            type: 'error',
            message: 'Lỗi khi chỉnh sửa thể loại, vui lòng thử lại',
        },
        successNotification: {
            type: 'success',
            message: 'Thể loại đã được chỉnh sửa thành công',
        },
    });

    return (
        <Edit
            title={`Chỉnh sửa thể loại "${formProps.initialValues?.name}"`}
            headerButtons={({ listButtonProps, refreshButtonProps }) => (
                <>
                    <ListButton {...listButtonProps}>Danh sách thể loại</ListButton>
                    <RefreshButton {...refreshButtonProps}>Làm mới</RefreshButton>
                </>
            )}
            saveButtonProps={saveButtonProps}
        >
            <BaseResourceForm
                formProps={formProps}
                type="edit"
                gqlQuery={MNT_CATEGORY_QUERY}
                operation="category"
            />
        </Edit>
    );
}
