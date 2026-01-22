import { useState } from "react";

import Button from "@/components/common/Button";
import FieldValue from "@/components/generics/FieldValue";
import FileUploader from "@/components/generics/FileUploader";
import { API_ROUTES } from "@/constants/api";
import useRequestQuery from "@/hooks/useRequestQuery";
import { ITemplate } from "@/interfaces/templates";
import useUploadStore from "@/store/uploadStore";
import { publishEvent } from "@/utils/events";
import { BROWSER_EVENTS } from "@/constants/browserEvents";
import { Separator } from "@/uishadcn/ui/separator";
import { Label } from "@/uishadcn/ui/label";
import NexrenderFormSettings from "./NexrenderFormSettings";
import { Alert, AlertDescription, AlertTitle } from "@/uishadcn/ui/alert";
import { InfoIcon, RefreshCwIcon } from "lucide-react";

interface Props {
    template: ITemplate
    isRefetching?: boolean
    onRefreshTemplate: () => void
}

type UploadAssetsData = { uploadUrl: string, headers: string, templateId: string }

const NexrenderConfiguration = ({ template, isRefetching, onRefreshTemplate }: Props) => {
    const [uploadLoading, setUploadLoading] = useState(false)
    const { request, requestState } = useRequestQuery()
    // const [uploadAssetsData, setUploadAssetsData] = useState<UploadAssetsData | null>(null)
    const startUpload = useUploadStore(state => state.startUpload)

    const getUploadAssetsInfo = async () => {
        try {
            const response = await request<unknown, UploadAssetsData>('POST', API_ROUTES.TEMPLATES.UPLOAD_ASSETS.replace('{id}', template.id))
            if (response.success) {
                // setUploadAssetsData(response.data)
                publishEvent<Partial<ITemplate>>(BROWSER_EVENTS.TEMPLATE_DETAIL_UPDATED, { render_provider_id: response.data.templateId, assets_data: { compositions: [], layers: [], upload_status: 'awaiting_upload' } })
            }
        } catch (error) {
            console.error(error)
        }
    }

    const processUploadFile = async (fileUri?: string) => {
        const response = await request<{ file_uri?: string }, unknown>(
            'POST',
            API_ROUTES.TEMPLATES.UPLOAD_TEMPLATE.replace('{id}', template.id),
            fileUri ? { file_uri: fileUri } : {}
        )
        if (response.success) {
            publishEvent<Partial<ITemplate>>(BROWSER_EVENTS.TEMPLATE_DETAIL_UPDATED, { assets_data: { compositions: [], layers: [], upload_status: 'processing' } })
        }
    }

    const onUploadFile = async (files: File[]) => {
        if (!files || !files.length) return;

        try {
            setUploadLoading(true)
            // const fd = new FormData();
            // fd.append("file", files[0]);
            // await request<FormData, unknown>('POST', API_ROUTES.TEMPLATES.UPLOAD_TEMPLATE.replace('{id}', template.id), fd)
            // const uploadData = uploadAssetsData

            await new Promise((resolve) => {
                startUpload(
                    files,
                    {
                        uploadUri: `/templates/${template.slug}/zip`,
                        onAllSuccess: async (uploadedResults) => {
                            await processUploadFile(uploadedResults[0]?.fileUri)
                            resolve(true)
                        }
                    }
                )
            })

            // if (!uploadAssetsData) {
            //     const response = await request<unknown, UploadAssetsData>('GET', API_ROUTES.TEMPLATES.GET_UPLOAD_ASSETS_URL.replace('{id}', template.id))
            //     uploadData = response.data
            // }
            // if (uploadData) {
            //     await new Promise((resolve) => {
            //         startUpload(
            //             files,
            //             {
            //                 customUploadUrl: uploadData.uploadUrl,
            //                 headers: { 'Content-Type': 'application/octet-stream', 'x-amz-meta-custom': uploadData.headers },
            //                 onAllSuccess: async (uploadedResults) => {
            //                     console.log(uploadedResults)
            //                     resolve(uploadedResults)
            //                 }
            //             }
            //         )
            //     })
            // }
        } catch (error) {
            console.error(error)
        } finally {
            setUploadLoading(false)
        }
    }

    const pendingAssetsUpload = template.assets_data?.upload_status === 'awaiting_upload'

    return (
        <div className="space-y-3">
            {template.render_provider_id ? (
                <>
                    <FieldValue label="Nexrender ID:" value={template.render_provider_id || ''} />
                    <FieldValue label="Estado de la carga:" value={template.assets_data?.upload_status || ''} />
                    <div className="grid md:grid-cols-2">
                        <FieldValue label="Composiciones:" flexDirection="col" className="items-start">
                            <ul>
                                {template.assets_data?.compositions.map(comp => (
                                    <li key={comp}>{comp}</li>
                                ))}
                            </ul>
                        </FieldValue>
                        <FieldValue label="Layers:" flexDirection="col" className="items-start">
                            <ul>
                                {template.assets_data?.layers.map(layer => (
                                    <li key={layer.layerName}>{layer.layerName}</li>
                                ))}
                            </ul>
                        </FieldValue>
                    </div>
                </>
            ) : (
                <FieldValue label="Presiona para crear la plantilla en Nexrender" flexDirection="col">
                    <Button
                        text='Conectar con Nexrender'
                        color="primary"
                        className="mt-2"
                        rounded
                        loading={requestState.loading}
                        onClick={getUploadAssetsInfo}
                    />
                </FieldValue>
            )}

            {pendingAssetsUpload && !template?.template_file_uri && (
                <FileUploader
                    title="Selecciona el archivo .ZIP"
                    buttonText="Subir plantilla"
                    fileAccepts=".zip"
                    loading={uploadLoading}
                    onUploadFiles={onUploadFile}
                />
            )}

            {template?.template_file_uri && pendingAssetsUpload && (
                <>
                    <Separator />
                    <FieldValue label="Archivo Cargado" flexDirection="col" className="items-start">
                        <Button
                            text='Reprocesar subida de archivo'
                            color="primary"
                            className="mt-2"
                            rounded
                            loading={requestState.loading}
                            onClick={() => processUploadFile()}
                        />
                    </FieldValue>
                </>
            )}

            <Separator />

            {template.assets_data?.upload_status === 'processing' && (
                <Alert className="bg-primary/50">
                    <InfoIcon />
                    <AlertTitle className="flex items-center justify-between">
                        Se estan procesando los recursos de la plantilla
                        <Button
                            text={
                                <div className="flex items-center gap-2">
                                    <RefreshCwIcon />
                                    Refrescar
                                </div>
                            }
                            loading={isRefetching}
                            variant="ghost"
                            size="sm"
                            className="hover:bg-transparent p-0 h-max"
                            onClick={onRefreshTemplate}
                        />
                    </AlertTitle>
                    <AlertDescription>
                        Esto puede tardar unos minutos, una vez finalizado podrás configurar los recursos dinamicos.
                    </AlertDescription>
                </Alert>
            )}

            {template.assets_data?.upload_status === 'uploaded' && (
                <>
                    <Label className="mb-5">Configura los recursos dinamicos del render</Label>
                    <NexrenderFormSettings template={template} />
                </>
            )}
        </div>
    );
}

export default NexrenderConfiguration;
