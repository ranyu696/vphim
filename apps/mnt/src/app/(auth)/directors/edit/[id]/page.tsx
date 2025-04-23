'use client';

import { Edit, ListButton, RefreshButton, useForm } from '@refinedev/antd';
import { type DirectorType } from '~api/app/directors/director.type';
import { PersonResourceForm } from '~mnt/components/form/resource/person-resource-form';
import { MNT_DIRECTOR_QUERY, MNT_DIRECTOR_UPDATE } from '~mnt/queries/director.query';

export type EditDirectorPageProps = {
    params: { id: string };
};

export default function EditDirector({ params }: EditDirectorPageProps) {
    const { formProps, saveButtonProps } = useForm<DirectorType>({
        dataProviderName: 'graphql',
        resource: 'directors',
        action: 'edit',
        meta: {
            gqlQuery: MNT_DIRECTOR_QUERY,
            gqlMutation: MNT_DIRECTOR_UPDATE,
            operation: 'director',
            variables: {
                input: {
                    _id: params.id,
                },
            },
        },
        errorNotification: {
            type: 'error',
            message: 'Lỗi khi chỉnh sửa đạo diễn, vui lòng thử lại',
        },
        successNotification: {
            type: 'success',
            message: 'Đạo diễn đã được chỉnh sửa thành công',
        },
    });

    return (
        <Edit
            title={`Chỉnh sửa đạo diễn "${formProps.initialValues?.name}"`}
            headerButtons={({ listButtonProps, refreshButtonProps }) => (
                <>
                    <ListButton {...listButtonProps}>Danh sách đạo diễn</ListButton>
                    <RefreshButton {...refreshButtonProps}>Làm mới</RefreshButton>
                </>
            )}
            saveButtonProps={saveButtonProps}
        >
            <PersonResourceForm
                formProps={formProps}
                gqlQuery={MNT_DIRECTOR_QUERY}
                type="edit"
                operation="director"
            />
        </Edit>
    );
}
