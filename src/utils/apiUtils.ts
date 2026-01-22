import { ApiResponse, StorageDisks } from '@/interfaces/common'
import { API_ROUTES } from '@/constants/api'
import HttpService from '@/services/http'
import { FileTypes } from '@/interfaces/files'

export const getSignUploadUrl = async (data: { fileName: string, fileType: FileTypes, disk: StorageDisks }) => {
    const response = await HttpService.post<ApiResponse<{ url: string, key: string, disk: StorageDisks }>>(API_ROUTES.SIGN_URL, data)
    if (response.success) {
        return response.data
    }

    throw new Error('Error al obtener la url de subida')
}

export const buildQueryString = (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.set(key, String(value))
        }
    })
    return searchParams.toString()
}

export const getFileByUri = async (uri: string) => {
    try {
        const response = await HttpService.get<Blob>(API_ROUTES.GET_FILE + `?uri=${encodeURIComponent(uri)}`, { responseType: 'blob' })
        return response
    } catch (error) {
        console.error(error)
        throw new Error('Error al obtener el archivo por URI')
    }
}