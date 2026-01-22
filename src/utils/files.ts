import { StorageDisks } from '@/interfaces/common'
import { uploadS3 } from '.'
import { getSignUploadUrl } from "./apiUtils"
import { FileTypes } from '@/interfaces/files'

export const uploadFile = async (params: { file: File, fileType: FileTypes, filename: string, disk?: StorageDisks }) => {
    const signUrl = await getSignUploadUrl({
        fileName: params.filename,
        fileType: params.fileType,
        disk: params.disk || 'private',
    })
    if (signUrl.url) {
        await uploadS3(params.file, signUrl.url)
        return signUrl.key
    } else {
        throw new Error('Error al obtener la url de subida')
    }
}

export const anchorDownload = (url: string, fileName: string, target?: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    if (target) {
        a.target = target
    }
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
}

export const downloadBlob = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob)
    anchorDownload(url, fileName)
}