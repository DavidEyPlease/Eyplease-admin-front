import FileUploader from "@/components/generics/FileUploader"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import { FileTypes } from "@/interfaces/files"
import { ITraining } from "@/interfaces/training"
import { TrainingsService } from "@/services/trainings.service"
import useUploadStore from "@/store/uploadStore"
import { publishEvent } from "@/utils/events"
import { useState } from "react"
import { getTrainingFileByType } from "../utils"

interface Props {
    training: ITraining
}

const TrainingFiles = ({ training }: Props) => {
    const [loadingFiles, setLoadingFiles] = useState<FileTypes[]>([])
    const startUpload = useUploadStore(state => state.startUpload)

    const processUploadFile = async (fileUri: string, fileType: FileTypes) => {
        const response = await TrainingsService.attachFile(training.id, fileUri, fileType)
        if (response.success) {
            publishEvent(BROWSER_EVENTS.TRAININGS_LIST_UPDATED, { id: training.id, files: response.data })
        }
    }

    const onUploadFile = async (files: File[], fileType: FileTypes) => {
        if (!files || !files.length) return;

        try {
            setLoadingFiles(prev => ([...prev, fileType]))
            await new Promise((resolve) => {
                startUpload(
                    files,
                    {
                        uploadUri: `private/trainings/${training.id}/files`,
                        onAllSuccess: async (uploadedResults) => {
                            await processUploadFile(uploadedResults[0]?.fileUri, fileType)
                            resolve(true)
                        }
                    }
                )
            })
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingFiles(prev => prev.filter(type => type !== fileType))
        }
    }

    const files = training.files || []

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FileUploader
                title="Presentación PowerPoint"
                info={getTrainingFileByType(files, FileTypes.TRAINING_PPTX)?.name || ''}
                fileAccepts=".pptx"
                loading={loadingFiles.includes(FileTypes.TRAINING_PPTX)}
                onUploadFiles={(files) => onUploadFile(files, FileTypes.TRAINING_PPTX)}
            />
            <FileUploader
                title="PDF PowerPoint"
                info={getTrainingFileByType(files, FileTypes.TRAINING_PPTX_TO_PDF)?.name || ''}
                fileAccepts=".pdf"
                loading={loadingFiles.includes(FileTypes.TRAINING_PPTX_TO_PDF)}
                onUploadFiles={(files) => onUploadFile(files, FileTypes.TRAINING_PPTX_TO_PDF)}
            />
            <FileUploader
                title="Guía"
                info={getTrainingFileByType(files, FileTypes.TRAINING_PDF_READING)?.name || ''}
                fileAccepts=".pdf"
                loading={loadingFiles.includes(FileTypes.TRAINING_PDF_READING)}
                onUploadFiles={(files) => onUploadFile(files, FileTypes.TRAINING_PDF_READING)}
            />
            <FileUploader
                title="Prevista PowerPoint en PDF"
                info={getTrainingFileByType(files, FileTypes.TRAINING_PDF_PREVIEW)?.name || ''}
                fileAccepts="application/pdf"
                loading={loadingFiles.includes(FileTypes.TRAINING_PDF_PREVIEW)}
                onUploadFiles={(files) => onUploadFile(files, FileTypes.TRAINING_PDF_PREVIEW)}
            />
        </div>
    )
}

export default TrainingFiles