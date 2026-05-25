import AvatarUploadPhoto from "@/components/generics/AvatarUploadPhoto"
import useFiles from "@/hooks/useFiles"
import { NullishFile } from "@/interfaces/common"
import { FileTypes } from "@/interfaces/files"
import { TemplatesService } from "@/services/templates.service"
import { slugify } from "@/utils"
import { publishEvent } from "@/utils/events"
import { toast } from "sonner"

interface Props {
    templateId: string
    templateName: string
    cover: NullishFile
}

const TemplateCover = ({ templateId, templateName, cover }: Props) => {
    const { executing, onUploadFile } = useFiles()

    const onUpload = async (fileUri: string) => {
        try {
            const templateUpdated = await TemplatesService.put(templateId, { picture: fileUri })
            if (templateUpdated.data) {
                publishEvent('templates-updated', templateUpdated.data)
            }
        } catch (error) {
            toast.error('Error al subir la portada de la plantilla')
        }
    }

    return (
        <AvatarUploadPhoto
            src={cover?.url || ''}
            uri={cover?.uri || null}
            alt={templateName}
            roundedClass="rounded-md"
            size="xs"
            onlyIcon
            loading={executing}
            onUpload={(file) => onUploadFile({
                file,
                filename: `public/templates/${slugify(templateName)}/cover/${file.name}`,
                fileType: FileTypes.TEMPLATE_COVER,
                callback: onUpload
            })}
        />
    )
}

export default TemplateCover