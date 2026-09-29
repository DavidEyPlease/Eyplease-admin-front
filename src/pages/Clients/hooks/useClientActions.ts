import { API_ROUTES } from "@/constants/api";
import useFiles from "@/hooks/useFiles";
import useRequestQuery from "@/hooks/useRequestQuery";
import { IClient, IClientUpdate } from "@/interfaces/clients";
import { PaginationResponse } from "@/interfaces/common";
import { FileTypes } from "@/interfaces/files";
import { queryKeys } from "@/utils/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const useClientActions = () => {
    const queryClient = useQueryClient()

    const { onUploadFile } = useFiles()
    const [loading, setLoading] = useState(false)
    const { request, requestState } = useRequestQuery()

    const patchUpdateClient = async (clientId: string, data: Partial<IClientUpdate>) => {
        await request('PUT', API_ROUTES.CLIENTS.UPDATE.replace('{id}', clientId), data);
    }

    const onChangePhoto = async (clientId: string, filename: string, file: File) => {
        try {
            setLoading(true)
            await onUploadFile({
                file,
                filename,
                fileType: FileTypes.SPONSOR_PHOTO,
                // callback: () => patchUpdateClient(clientId, { photo: filename })
            })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const onChangeLogo = async (clientId: string, filename: string, file: File) => {
        try {
            setLoading(true)
            await onUploadFile({
                file,
                filename,
                fileType: FileTypes.USER_LOGOTYPE,
                callback: () => patchUpdateClient(clientId, { logo: filename })
            })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateList = (client: Partial<IClient>) => {
        queryClient.setQueriesData<PaginationResponse<IClient>>(
            { queryKey: queryKeys.listBase('clients/list') },
            (oldData) => {
                if (!oldData) return oldData
                return {
                    ...oldData,
                    items: oldData.items.map(item => item.id === client.id
                        ? { ...item, ...client, user: { ...item.user, ...(client.user || {}) } }
                        : item
                    )
                }
            }
        )
    }

    return {
        loading: requestState.loading || loading,
        patchUpdateClient,
        onChangePhoto,
        onChangeLogo,
        handleUpdateList,
    }
}

export default useClientActions;