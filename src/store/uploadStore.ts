import { FileTypes } from '@/interfaces/files'
import { getFileType } from '@/utils'
import { getSignUploadUrl } from '@/utils/apiUtils'
import { create } from 'zustand'

type UploadSuccessCallback = (meta: {
    fileUri: string
    name: string
    id: string
    extension: string
}[]) => Promise<void>


export type UploadFile = {
    id: string
    name: string
    progress: number
    status: 'uploading' | 'success' | 'error'
    uploadUrl?: string
    fileUri?: string
    phase: 'preparing' | 'uploading' | 'saving' | 'success' | 'error'
    abortController?: AbortController
}

type UploadStoreOptions = { fileType?: FileTypes, uploadUri?: string, customUploadUrl?: string, headers?: Record<string, string>, onAllSuccess?: UploadSuccessCallback }

interface UploadState {
    uploads: UploadFile[]
    startUpload: (files: File[], options: UploadStoreOptions) => void
    updateProgress: (id: string, progress: number) => void
    setStatus: (id: string, status: UploadFile['status']) => void
    removeUpload: (id: string) => void
    updateUploadItem: (id: string, data: Partial<UploadFile>) => void
    cleanUploads: () => void
}

const useUploadStore = create<UploadState>((set, get) => ({
    uploads: [],

    updateUploadItem: (id: string, data: Partial<UploadFile>) => {
        set(state => ({
            uploads: state.uploads.map(u => u.id === id ? { ...u, ...data } : u)
        }))
    },

    startUpload: async (
        files: File[],
        options: UploadStoreOptions
    ) => {
        if (!options.uploadUri && !options.customUploadUrl) {
            return
        }
        const uploadedResults: Array<{ fileUri: string; name: string; extension: string, id: string }> = []
        for (const file of files) {
            const id = crypto.randomUUID()
            const abortController = new AbortController()

            const uploadItem: UploadFile = {
                id,
                name: file.name,
                progress: 0,
                status: 'uploading',
                phase: 'preparing',
                abortController,
            }

            set(state => ({ uploads: [...state.uploads, uploadItem] }))

            try {
                const fileExtension = getFileType(file.type)

                let uploadUrl = ''
                let fileUri = ''
                if (options.uploadUri) {
                    const { key, url } = await getSignUploadUrl({
                        fileName: `${options.uploadUri}/${file.name}`,
                        fileType: options.fileType || file.type as FileTypes,
                        disk: 'private',
                        // uri: 
                    })
                    if (!url) {
                        throw new Error('Error al obtener la URL de subida')
                    }
                    fileUri = key
                    uploadUrl = url
                    get().updateUploadItem(id, { fileUri, phase: 'uploading' })
                } else if (options.customUploadUrl) {
                    uploadUrl = options.customUploadUrl
                    get().updateUploadItem(id, { phase: 'uploading' })
                }

                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest()
                    xhr.open('PUT', uploadUrl, true)
                    if (options.headers) {
                        Object.entries(options.headers).forEach(([key, value]) => {
                            xhr.setRequestHeader(key, value)
                        })
                    } else {
                        xhr.setRequestHeader('Content-Type', file.type)
                    }

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const progress = Math.round((event.loaded / event.total) * 100)
                            get().updateProgress(id, progress)
                        }
                    }

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            get().updateProgress(id, 100)
                            resolve()
                        } else {
                            reject(new Error('Error en la subida'))
                        }
                    }

                    xhr.onerror = () => reject(new Error('Error en la subida'))
                    xhr.onabort = () => reject(new Error('Subida cancelada'))

                    xhr.send(file)
                })

                get().updateProgress(id, 100)
                get().updateUploadItem(id, { phase: 'saving' })

                get().updateUploadItem(id, { phase: 'success', status: 'success' })

                setTimeout(() => {
                    get().removeUpload(id)
                }, 1500)

                uploadedResults.push({ fileUri, name: file.name, extension: fileExtension, id })
            } catch (err) {
                console.log('Upload error:', err)
                get().updateUploadItem(id, { phase: 'error', status: 'error' })
            }
        }
        if (options.onAllSuccess && uploadedResults.length === files.length) {
            try {
                await options.onAllSuccess(uploadedResults)
            } catch (err) {
                console.error('Error en callback post-upload:', err)
            }
        }
    },

    updateProgress: (id, progress) => {
        set(state => ({
            uploads: state.uploads.map(u => (u.id === id ? { ...u, progress } : u))
        }))
    },

    setStatus: (id, status) => {
        set(state => ({
            uploads: state.uploads.map(u => (u.id === id ? { ...u, status } : u))
        }))
    },

    removeUpload: (id) => {
        set(state => ({ uploads: state.uploads.filter(u => u.id !== id) }))
    },

    cleanUploads: () => set(() => ({
        uploads: []
    })),
}))

export default useUploadStore