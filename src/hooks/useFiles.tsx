import { StorageDisks } from "@/interfaces/common"
import { FileTypes } from "@/interfaces/files"
import { downloadBlob, uploadFile } from "@/utils/files"
import { useState } from "react"
import { toast } from "sonner"
import { getFileByUri } from "@/utils/apiUtils"


interface OnUploadParams {
    file: File
    fileType: FileTypes
    filename?: string
    disk?: StorageDisks
    callback?: (fileKey: string) => Promise<void>
}

const useFiles = () => {
    const [fileLoadingAction, setFileLoadingAction] = useState('')
    const [executing, setExecuting] = useState(false)

    const downloadFile = async (fileId: string, uri: string) => {
        setFileLoadingAction(fileId)
        try {
            const blob = await getFileByUri(uri)
            downloadBlob(blob, uri.split('/').pop() || 'file')
        } catch (error) {
            console.log(error)
            toast.error('Error al descargar el archivo')
        } finally {
            setFileLoadingAction('')
        }
    }

    const onUploadFile = async (params: OnUploadParams) => {
        try {
            setExecuting(true)
            const fileKey = await uploadFile({
                file: params.file,
                filename: params.filename || params.file.name,
                fileType: params.fileType,
                disk: params.disk || 'private',
            })
            if (fileKey) {
                await params.callback?.(fileKey)
            }
        } catch (error) {
            console.log(error)
            toast.error('Error al subir la portada de la plantilla')
        } finally {
            setExecuting(false)
        }
    }

    return {
        executing,
        fileLoadingAction,
        downloadFile,
        onUploadFile,
    }
}

export default useFiles