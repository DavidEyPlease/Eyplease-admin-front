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
import NexrenderFormSettings from "./NexrenderFormSettings";
import { Alert, AlertDescription, AlertTitle } from "@/uishadcn/ui/alert";
import { InfoIcon, RefreshCwIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/uishadcn/ui/accordion";
import NexrenderPreviewTemplate from "./NexrenderPreviewTemplate";

interface Props {
    template: ITemplate
    isRefetching?: boolean
    onRefreshTemplate: () => void
}

type UploadAssetsData = { uploadUrl: string, headers: string, templateId: string }

const NexrenderConfiguration = ({ template, isRefetching, onRefreshTemplate }: Props) => {
    const [uploadLoading, setUploadLoading] = useState(false)
    const { request, requestState } = useRequestQuery()
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
        } catch (error) {
            console.error(error)
        } finally {
            setUploadLoading(false)
        }
    }

    const pendingAssetsUpload = template.assets_data?.upload_status === 'awaiting_upload'
    const isUploaded = template.assets_data?.upload_status === 'uploaded'

    return (
        <div className="space-y-3">
            {template.render_provider_id ? (
                <>
                    <div className="flex gap-4">
                        <FieldValue label="Nexrender ID:" value={template.render_provider_id || ''} />
                        <FieldValue label="Estado de la carga:" value={template.assets_data?.upload_status || ''} />
                    </div>
                    <Accordion type="single" className="rounded-lg border px-4" collapsible>
                        <AccordionItem value='info'>
                            <AccordionTrigger>Composición y capas</AccordionTrigger>
                            <AccordionContent>
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
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value='settings' disabled={!isUploaded}>
                            <AccordionTrigger>Configura los recursos dinamicos del render</AccordionTrigger>
                            <AccordionContent>
                                <NexrenderFormSettings template={template} />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value='preview' disabled={!isUploaded || (isUploaded && !template.render_configuration)}>
                            <AccordionTrigger>Prueba la plantilla</AccordionTrigger>
                            <AccordionContent>
                                <NexrenderPreviewTemplate template={template} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
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
        </div>
    );
}

export default NexrenderConfiguration;
