import { StorageDisks } from '@/interfaces/common'
import { uploadS3 } from '.'
import { getSignUploadUrl } from "./apiUtils"
import { FileTypes } from '@/interfaces/files'

export const uploadFile = async (params: { file: File, fileType: FileTypes, filename: string, disk?: StorageDisks, clientId?: string }) => {
    const signUrl = await getSignUploadUrl({
        fileName: params.filename,
        fileType: params.fileType,
        disk: params.disk || 'private',
        clientId: params.clientId,
    })
    if (signUrl.url) {
        await uploadS3(params.file, signUrl.url)
        return signUrl.key
    } else {
        throw new Error('Error al obtener la url de subida')
    }
}

/**
 * Sube una imagen a `folder` (termina en «/») con un nombre al azar y su propio tipo de contenido; devuelve su
 * llave. La registra quien la usa (la base de un reto o de una plantilla se guarda con sus medidas).
 */
export const uploadImageTo = async (file: File, folder: string, prefix = 'subida') => {
    const extension = (file.name.split('.').pop() || 'png').toLowerCase()
    const random = Math.random().toString(36).slice(2, 10)
    const type = file.type || 'image/png'
    const { url, key } = await getSignUploadUrl({ fileName: `${folder}${prefix}-${random}.${extension}`, fileType: type as FileTypes, disk: 'private' })
    const response = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': type } })
    if (!response.ok) throw new Error('No se pudo subir la imagen')
    return key
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