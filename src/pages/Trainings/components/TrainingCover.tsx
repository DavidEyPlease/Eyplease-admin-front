import AvatarUploadPhoto from "@/components/generics/AvatarUploadPhoto"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import useFiles from "@/hooks/useFiles"
import { EypleaseFile, FileTypes } from "@/interfaces/files"
import { TrainingsService } from "@/services/trainings.service"
import { getFileType } from "@/utils"
import { publishEvent } from "@/utils/events"
import { toast } from "sonner"

interface Props {
    trainingId: string
    cover: EypleaseFile | null
}

const TrainingCover = ({ trainingId, cover }: Props) => {
    const { executing, onUploadFile } = useFiles()

    const onUpload = async (fileUri: string) => {
        try {
            const response = await TrainingsService.attachFile(trainingId, fileUri, FileTypes.TRAINING_COVER)
            if (response.success) {
                publishEvent(BROWSER_EVENTS.TRAININGS_LIST_UPDATED, { id: trainingId, files: response.data })
            }
        } catch (error) {
            console.error("Error updating photo:", error)
            toast.error("Error al actualizar la portada del entrenamiento.")
        } finally {
            publishEvent('clear-file-uploader', true)
        }
    }

    return (
        <AvatarUploadPhoto
            src={cover?.url || ''}
            uri={cover?.uri || null}
            alt={trainingId}
            roundedClass="rounded-md"
            size="xs"
            loading={executing}
            onUpload={(file) => onUploadFile({
                file,
                filename: `private/trainings/${trainingId}/cover_${Date.now()}.${getFileType(file.type)}`,
                fileType: FileTypes.TRAINING_COVER,
                callback: onUpload
            })}
        />
    )
}

export default TrainingCover