import Spinner from "@/components/common/Spinner";
import { AlertConfirmDelete } from "@/components/generics/AlertConfirm";
import { AttachmentViewer } from "@/components/generics/AttachmentViewer";
import CopyButton from "@/components/generics/CopyButton";
import FieldValue from "@/components/generics/FieldValue";
import useFiles from "@/hooks/useFiles";
import { IFile } from "@/interfaces/common";
import { ITaskFile, TaskStatusTypes } from "@/interfaces/tasks";
import { TasksService } from "@/services/tasks.service";
import { Button } from "@/uishadcn/ui/button";
import { Card, CardContent } from "@/uishadcn/ui/card";
import { isImage } from "@/utils";
import { formatDate } from "@/utils/dates";
import { DownloadIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FileItemProps {
    attachment: ITaskFile
    taskId: string
    taskStatus: TaskStatusTypes
    onSuccessFile: (fileId: string) => void
}

const FileItem = ({ attachment, taskId, taskStatus, onSuccessFile }: FileItemProps) => {
    const { fileLoadingAction, downloadFile } = useFiles()
    const [selectedFile, setSelectedFile] = useState<IFile | null>(null)
    const [loadingDelete, setLoadingDelete] = useState('');

    const onDelete = async (fileId: string) => {
        setLoadingDelete(fileId);
        try {
            await TasksService.deleteTaskFile(taskId, fileId);
            onSuccessFile(fileId)
        } catch (error) {
            console.error('Error al eliminar el archivo:', error);
            toast.error('Error al eliminar el archivo');
        } finally {
            setLoadingDelete('');
        }
    }

    return (
        <>
            <div key={attachment.id} data-id={attachment.id}>
                {attachment.file_type === 'image' && (taskStatus === TaskStatusTypes.READY_FOR_PUBLISH || taskStatus === TaskStatusTypes.COMPLETED) && (
                    <FieldValue label="URL Json">
                        <CopyButton text={`${import.meta.env.VITE_API_BASE}/data-sources/tools/${taskId}?sort=${attachment.file.sort}`} />
                    </FieldValue>
                )}
                <Card className="mb-2 hover:bg-accent cursor-move relative">
                    <CardContent className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-4">
                            <div
                                className="size-10 bg-card shadow-md rounded flex cursor-pointer items-center justify-center"
                                onClick={() => attachment.file_type === 'image' && setSelectedFile(attachment.file)}
                            >
                                {isImage(attachment.file.ext) ? (
                                    <img src={attachment.file.url} className="rounded object-cover max-w-full h-full" alt="" />
                                ) : (
                                    <span className="text-xs font-medium uppercase">{attachment.file.ext}</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">{attachment.file.name}</p>
                                <p className="text-xs text-muted-foreground">Añadido por: {attachment.uploaded_by?.name} el {formatDate(attachment.created_at)}</p>
                            </div>
                        </div>

                        <div className="flex gap-1 absolute right-2 -top-4">
                            {attachment.file_type === 'image' &&
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-primary"
                                    onClick={() => downloadFile(attachment.id, attachment.file.uri)}
                                >
                                    {fileLoadingAction === attachment.id ? (<Spinner />) : (<DownloadIcon className="size-3" />)}
                                </Button>
                            }
                            <AlertConfirmDelete
                                trigger={
                                    <Button
                                        variant="outline"
                                        className="text-destructive"
                                        size="icon"
                                        disabled={loadingDelete === attachment.id}
                                    >
                                        <Trash2Icon className="size-3" />
                                    </Button>
                                }
                                loading={loadingDelete === attachment.id}
                                onConfirm={() => onDelete(attachment.id)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {selectedFile && <AttachmentViewer isOpen={!!selectedFile} onClose={() => setSelectedFile(null)} attachment={selectedFile} />}
        </>
    )
}

export default FileItem;