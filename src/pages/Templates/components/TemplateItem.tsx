import Button from "@/components/common/Button";
import Switch from "@/components/common/Inputs/Switch";
import Link from "@/components/common/Link";
import AvatarUploadPhoto from "@/components/generics/AvatarUploadPhoto";
import IconTrash from "@/components/Svg/IconTrash";
import { API_ROUTES } from "@/constants/api";
import { APP_ROUTES } from "@/constants/app";
import useFiles from "@/hooks/useFiles";
import useRequest from "@/hooks/useRequest";
import { ApiResponse } from "@/interfaces/common";
import { FileTypes } from "@/interfaces/files";
import { ITemplate, ITemplateUpdate } from "@/interfaces/templates";
import { TableCell, TableRow } from "@/uishadcn/ui/table";
import { replaceRecordIdInPath, slugify } from "@/utils";
import { formatDate } from "@/utils/dates";
import { publishEvent } from "@/utils/events";
import { uploadFile } from "@/utils/files";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    template: ITemplate
}

const TemplateItem = ({ template }: Props) => {
    const { executing: uploadLoading, onUploadFile } = useFiles()
    const { request, requestState } = useRequest('PUT')
    const { request: deleteRequest, requestState: deleteState } = useRequest('DELETE')

    const onUpdate = async (data: ITemplateUpdate) => {
        const response = await request<ApiResponse<ITemplate>, ITemplateUpdate>(API_ROUTES.TEMPLATES.UPDATE.replace('{id}', template.id), data)
        if (response.success) {
            publishEvent('templates-updated', { ...response.data })
        }
    }

    const onUpload = async (file: File) => {
        try {
            onUploadFile({
                file,
                filename: `templates/${slugify(template.name)}/${file.name}`,
                fileType: FileTypes.TEMPLATE_COVER,
                callback: (fileKey) => onUpdate({ picture: fileKey })
            })
        } catch (error) {
            toast.error('Error al subir la portada de la plantilla')
        }
    }

    const onDelete = async (id: string) => {
        try {
            await deleteRequest<ApiResponse<ITemplate>, unknown>(API_ROUTES.TEMPLATES.DELETE.replace('{id}', id))
            publishEvent('templates-updated', { id, isDeleted: true })
        } catch (error) {
            toast.error('Error al eliminar la plantilla')
        }
    }

    return (
        <TableRow>
            <TableCell>
                {formatDate(template.created_at)}
            </TableCell>
            <TableCell>
                <AvatarUploadPhoto
                    src={template.picture?.url || ''}
                    uri={template.picture?.uri || null}
                    alt={template.name}
                    roundedClass="rounded-md"
                    size="sm"
                    onlyIcon
                    loading={uploadLoading}
                    onUpload={onUpload}
                />
            </TableCell>
            <TableCell>
                <Link to={replaceRecordIdInPath(APP_ROUTES.CONFIGURATIONS.PLAN_DETAIL, template.id)} className="font-semibold" text={template.name} />
            </TableCell>
            <TableCell>
                <div className="flex">
                    <Switch disabled={requestState.loading} checked={template.active} id='template-status' onCheckedChange={(e) => onUpdate({ active: e })} />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        loading={deleteState.loading}
                        text={<IconTrash />}
                        onClick={() => onDelete(template.id)}
                    />
                </div>
            </TableCell>
        </TableRow>
    )
}

export default TemplateItem;