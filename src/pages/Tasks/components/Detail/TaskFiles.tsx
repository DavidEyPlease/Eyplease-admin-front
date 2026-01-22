import { DownloadIcon, ImageIcon, PaperclipIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";
// import { animations } from "@formkit/drag-and-drop"

import { InputFile } from "@/components/common/Inputs/InputFile";
import { AttachmentViewer } from "@/components/generics/AttachmentViewer";
import { API_ROUTES } from "@/constants/api";
import useRequestQuery from "@/hooks/useRequestQuery";
import { IFile } from "@/interfaces/common";
import { ITask, ITaskFile } from "@/interfaces/tasks";
import useUploadStore from "@/store/uploadStore";
import { Button } from "@/uishadcn/ui/button";
import { Card, CardContent } from "@/uishadcn/ui/card";
import { isImage } from "@/utils";
import { formatDate } from "@/utils/dates";
import { publishEvent } from "@/utils/events";

import AlertConfirm from "@/components/generics/AlertConfirm"
import { TasksService } from "@/services/tasks.service"
import DynamicTabs from "@/components/generics/DynamicTabs"
import Spinner from "@/components/common/Spinner"
import useFiles from "@/hooks/useFiles";
// import useFiles from "@/hooks/useFiles"

interface IProps {
    taskId: string;
    assignedTo: ITask['assigned_to']
    attachments: ITaskFile[];
}

type GroupFiles = 'others' | 'design'

const TaskFiles = ({ taskId, assignedTo, attachments }: IProps) => {
    const { fileLoadingAction, downloadFile } = useFiles()
    const [selectedFile, setSelectedFile] = useState<IFile | null>(null)
    const [loadingDelete, setLoadingDelete] = useState('');
    const { request } = useRequestQuery({
        onError: (e) => {
            console.log(e);
            toast.error('Error al asociar los archivos a la tarea')
        }
    })
    const startUpload = useUploadStore(state => state.startUpload)

    const onSuccessFiles = (files: ITaskFile[]) => {
        publishEvent('tasks-updated', { id: taskId, files, eventType: 'update' });
        publishEvent('tasks-updated', { id: taskId, files, eventType: 'updateDetail' });
    }

    const onUploadFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        startUpload(
            Array.from(files),
            {
                uploadUri: `private/tasks/${taskId}/attachments`,
                onAllSuccess: async (uploadedResults) => {
                    const newTask = await request<unknown, ITaskFile[]>('POST', API_ROUTES.TASKS.STORE_ATTACHMENTS.replace('{id}', taskId), {
                        file_uris: uploadedResults
                    })
                    onSuccessFiles([...newTask.data, ...attachments])
                    // clean input file
                    const inputFile = document.getElementById(`attachment-${taskId}`) as HTMLInputElement;
                    if (inputFile) {
                        inputFile.value = '';
                    }
                }
            }
        )
    }

    const onDelete = async (fileId: string) => {
        setLoadingDelete(fileId);
        try {
            await TasksService.deleteTaskFile(taskId, fileId);
            publishEvent('tasks-updated', { id: taskId, files: attachments.filter(file => file.id !== fileId), eventType: 'update' });
            publishEvent('tasks-updated', { id: taskId, files: attachments.filter(file => file.id !== fileId), eventType: 'updateDetail' });
        } catch (error) {
            console.error('Error al eliminar el archivo:', error);
            toast.error('Error al eliminar el archivo');
        } finally {
            setLoadingDelete('');
        }
    }

    const [draggableParentRef, dragDropItems, setDragDropList] = useDragAndDrop<HTMLDivElement, ITaskFile>(
        [],
        {
            // plugins: [animations()],
            onDragend: () => {
                sortItems()
            }
        }
    )

    const sortItems = async () => {
        const sortFiles = dragDropItems.map((item, index) => ({
            ...item,
            file: {
                ...item.file,
                sort: index
            }
        }))
        await request('PUT', API_ROUTES.SORT_FILES, { file_ids: sortFiles.map(item => item.file.id) })
        onSuccessFiles(sortFiles)
    }

    const onFilterFiles = (criteria: GroupFiles) => {
        setDragDropList(attachments.filter(att => criteria === 'design' ? att.uploaded_by.id === assignedTo?.id : att.uploaded_by.id !== assignedTo?.id))
    }

    useEffect(() => {
        onFilterFiles('design');
    }, [attachments])

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <DynamicTabs
                    items={[
                        { value: 'design', label: "Adjuntos por diseñador", icon: <PaperclipIcon className="size-4" /> },
                        { value: 'others', label: "Adjuntos por el cliente", icon: <ImageIcon className="size-4" /> },
                    ]}
                    value='design'
                    onValueChange={value => onFilterFiles(value as GroupFiles)}
                />
                <div>
                    <InputFile label="Añadir" id={`attachment-${taskId}`} multiple onChange={e => onUploadFiles(e.target.files)} />
                </div>
            </div>

            <div className="grid xl:grid-cols-2 gap-2" ref={draggableParentRef}>
                {dragDropItems.map((attachment, index) => (
                    <Card key={index} className="mb-2 hover:bg-accent cursor-move">
                        <CardContent className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-4">
                                <div
                                    className="size-12 bg-card shadow-md rounded flex cursor-pointer items-center justify-center"
                                    onClick={() => setSelectedFile(attachment.file)}
                                >
                                    {isImage(attachment.file.extension) ? (
                                        <img src={attachment.file.url} className="rounded object-cover max-w-full h-full" alt="" />
                                    ) : (
                                        <span className="text-xs font-medium uppercase">{attachment.file.extension}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{attachment.file.name}</p>
                                    <p className="text-xs text-muted-foreground">Añadido por: {attachment.uploaded_by?.name} el {formatDate(attachment.created_at)}</p>
                                </div>
                            </div>

                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-primary"
                                    onClick={() => downloadFile(attachment.id, attachment.file.uri)}
                                >
                                    {fileLoadingAction === attachment.id ? (<Spinner />) : (<DownloadIcon className="size-3" />)}
                                </Button>
                                <AlertConfirm
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
                ))}
            </div>

            {selectedFile && <AttachmentViewer isOpen={!!selectedFile} onClose={() => setSelectedFile(null)} attachment={selectedFile} />}
        </div>
    )
}

export default TaskFiles