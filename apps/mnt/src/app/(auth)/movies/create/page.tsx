'use client';

import { useForm } from '@refinedev/antd';
import { Create } from '@refinedev/antd';

import { CREATE_MOVIE } from '~mnt/queries/movie.query';
import { MovieType } from '~api/app/movies/movie.type';
import { MovieForm } from '~mnt/components/form/movie';
import { useFormLocalStorage } from '~mnt/hooks/useFormLocalStorage';

const STORAGE_KEY = 'vephim_movieCreateFormData';

export default function MovieCreatePage() {
    const { formProps, saveButtonProps, onFinish, form } = useForm<MovieType>({
        dataProviderName: 'graphql',
        resource: 'movies',
        action: 'create',
        meta: {
            gqlQuery: CREATE_MOVIE,
            operation: 'createMovie',
        },
        invalidates: ['list', 'detail'],
        errorNotification: {
            type: 'error',
            message: 'Lỗi khi thêm phim, vui lòng thử lại',
        },
        successNotification: {
            type: 'success',
            message: 'Phim đã được thêm thành công',
        },
    });

    const { ClearFormButton, handleValuesChange, handleFormFinish } = useFormLocalStorage({
        form,
        storageKey: STORAGE_KEY,
        onFinish,
    });

    return (
        <Create
            title={'Thêm phim'}
            saveButtonProps={saveButtonProps}
            headerButtons={<ClearFormButton />}
        >
            <MovieForm
                formProps={{
                    ...formProps,
                    onFinish: handleFormFinish,
                    onValuesChange: handleValuesChange,
                }}
                mode="create"
            />
        </Create>
    );
}
