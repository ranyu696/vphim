'use client';

import { Edit, ListButton, RefreshButton, useForm } from '@refinedev/antd';
import { type ActorType } from '~api/app/actors/actor.type';
import { PersonResourceForm } from '~mnt/components/form/resource/person-resource-form';
import { MNT_ACTOR_QUERY, MNT_ACTOR_UPDATE } from '~mnt/queries/actor.query';

export type EditActorPageProps = {
    params: { id: string };
};

export default function EditActor({ params }: EditActorPageProps) {
    const { formProps, saveButtonProps } = useForm<ActorType>({
        dataProviderName: 'graphql',
        resource: 'actors',
        action: 'edit',
        meta: {
            gqlQuery: MNT_ACTOR_QUERY,
            gqlMutation: MNT_ACTOR_UPDATE,
            operation: 'actor',
            variables: {
                input: {
                    _id: params.id,
                },
            },
        },
        errorNotification: {
            type: 'error',
            message: 'Lỗi khi chỉnh sửa diễn viên, vui lòng thử lại',
        },
        successNotification: {
            type: 'success',
            message: 'Diễn viên đã được chỉnh sửa thành công',
        },
    });

    return (
        <Edit
            title={`Chỉnh sửa diễn viên "${formProps.initialValues?.name}"`}
            headerButtons={({ listButtonProps, refreshButtonProps }) => (
                <>
                    <ListButton {...listButtonProps}>Danh sách diễn viên</ListButton>
                    <RefreshButton {...refreshButtonProps}>Làm mới</RefreshButton>
                </>
            )}
            saveButtonProps={saveButtonProps}
        >
            <PersonResourceForm
                formProps={formProps}
                gqlQuery={MNT_ACTOR_QUERY}
                type="edit"
                operation="actor"
            />
        </Edit>
    );
}
