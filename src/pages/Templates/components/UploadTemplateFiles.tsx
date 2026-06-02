import FileUploader from "@/components/generics/FileUploader";
import { API_ROUTES } from "@/constants/api";
import useRequestQuery from "@/hooks/useRequestQuery";
import { ITemplate } from "@/interfaces/templates";
import useUploadStore from "@/store/uploadStore";
import { publishEvent } from "@/utils/events";
import { useState } from "react";
import { toast } from "sonner";

interface UploadTemplateFileProps {
    template: ITemplate
    onSuccess?: (template: ITemplate) => void
}

const UploadTemplateFiles = ({ template, onSuccess }: UploadTemplateFileProps) => {
    const [uploadLoading, setUploadLoading] = useState(false)
    const startUpload = useUploadStore(state => state.startUpload)
    const { request } = useRequestQuery()

    const onUploadFile = async (files: File[], key: 'template_file_uri' | 'reference_file_url') => {
        if (!files || !files.length) return;

        try {
            setUploadLoading(true)
            await new Promise((resolve) => {
                startUpload(
                    files,
                    {
                        uploadUri: `/public/templates/posts/${template.slug}-${template.month}-${template.template_asset_type}`,
                        onAllSuccess: async (uploadedResults) => {
                            const newTemplate = await request<{ [key in 'template_file_uri' | 'reference_file_url']?: string }, ITemplate>(
                                'PUT',
                                API_ROUTES.TEMPLATES.UPDATE.replace('{id}', template.id),
                                { [key]: uploadedResults[0]?.fileUri }
                            )
                            toast.success('El archivo de la plantilla se ha cargado correctamente')
                            onSuccess?.(newTemplate.data)
                            publishEvent('clear-file-uploader', true)
                            resolve(true)
                        }
                    }
                )
            })
        } catch (error) {
            toast.error('Error al cargar el archivo de la plantilla')
            console.error(error)
        } finally {
            setUploadLoading(false)
        }
    }

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <FileUploader
                    title="Carga la plantilla vacia"
                    buttonText="Subir plantilla"
                    fileAccepts=".mp4,.mov,.jpg,.jpeg,.png"
                    loading={uploadLoading}
                    onUploadFiles={e => onUploadFile(e, 'template_file_uri')}
                />
                <div className="flex-1 min-h-0 col-span-1 flex items-center justify-center bg-muted/30 rounded-md overflow-hidden">
                    {template.template_asset_type === "video" ? (
                        <video
                            src={template.template_file_url || undefined}
                            controls
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <img
                            src={template.template_file_url || undefined}
                            alt={`Preview ${template.name}`}
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>
            </div>
            <div className="space-y-4">
                <FileUploader
                    title="Carga la referencia del diseño"
                    buttonText="Subir plantilla"
                    fileAccepts=".mp4,.mov,.jpg,.jpeg,.png"
                    loading={uploadLoading}
                    onUploadFiles={e => onUploadFile(e, 'reference_file_url')}
                />
                <div className="flex-1 min-h-0 col-span-1 flex items-center justify-center bg-muted/30 rounded-md overflow-hidden">
                    {template.template_asset_type === "video" ? (
                        <video
                            src={template.reference_file_url || undefined}
                            controls
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <img
                            src={template.reference_file_url || undefined}
                            alt={`Preview ${template.name}`}
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default UploadTemplateFiles