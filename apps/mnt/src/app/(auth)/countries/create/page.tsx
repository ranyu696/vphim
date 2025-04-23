'use client';

import { Create, useForm } from '@refinedev/antd';
import { type RegionType } from '~api/app/regions/region.type';
import { BaseResourceForm } from '~mnt/components/form/resource/base-resource-form';
import { useFormLocalStorage } from '~mnt/hooks/useFormLocalStorage';
import { MNT_REGION_QUERY, MNT_REGION_CREATE } from '~mnt/queries/region.query';

const STORAGE_KEY = 'vephim_regionCreateFormData';

export default function CreateRegion() {
    const { formProps, saveButtonProps, form, onFinish } = useForm<RegionType>({
        dataProviderName: 'graphql',
        action: 'create',
        resource: 'regions',
        redirect: 'show',
        id: '',
        meta: {
            gqlMutation: MNT_REGION_CREATE,
            operation: 'createRegion',
        },
        errorNotification: {
            type: 'error',
            message: 'Lỗi khi thêm khu vực/quốc gia, vui lòng thử lại',
        },
        successNotification: {
            type: 'success',
            message: 'Khu vực/quốc gia đã được thêm thành công',
        },
    });

    const { ClearFormButton, handleValuesChange, handleFormFinish } = useFormLocalStorage({
        form,
        storageKey: STORAGE_KEY,
        onFinish,
    });

    return (
        <Create
            title="Thêm khu vực/quốc gia"
            saveButtonProps={saveButtonProps}
            headerButtons={<ClearFormButton />}
        >
            <BaseResourceForm
                formProps={{
                    ...formProps,
                    onFinish: handleFormFinish,
                    onValuesChange: handleValuesChange,
                }}
                type="create"
                gqlQuery={MNT_REGION_QUERY}
                operation="region"
            />
        </Create>
    );
}
