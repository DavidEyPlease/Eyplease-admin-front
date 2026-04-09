import { ImageIcon, PaperclipIcon } from "lucide-react";
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

import DynamicTabs from "@/components/generics/DynamicTabs"
import useFetchQuery from "@/hooks/useFetchQuery";
import { queryKeys } from "@/utils/queryKeys";
import FileItem from "./FileItem";
import { Skeleton } from "@/uishadcn/ui/skeleton";

interface IProps {
    task: ITask
}

type GroupFiles = 'others' | 'design'

const TaskFiles = ({ task }: IProps) => {
    const [selectedFile, setSelectedFile] = useState<IFile | null>(null)

    const [draggableParentRef, dragDropItems, setDragDropList] = useDragAndDrop<HTMLDivElement, ITaskFile>(
        [],
        {
            // plugins: [animations()],
            onDragend: () => {
                sortItems()
            }
        }
    )

    const { response: filesList, loading, setData: setFiles } = useFetchQuery<ITaskFile[]>(
        API_ROUTES.TASKS.GET_FILES.replace('{id}', task.id),
        {
            customQueryKey: queryKeys.list(`tasks-files-${task.id}`),
            enabled: !!task.id,
            queryParams: { file_type: 'image' }
        }
    )

    const { request } = useRequestQuery({
        onError: (e) => {
            console.log(e);
            toast.error('Error al asociar los archivos a la tarea')
        }
    })
    const startUpload = useUploadStore(state => state.startUpload)

    const onSuccessFiles = (files: ITaskFile[]) => {
        setDragDropList(files);
        setFiles(files);
    }

    const onUploadFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        startUpload(
            Array.from(files),
            {
                uploadUri: `private/tasks/${task.id}/attachments`,
                onAllSuccess: async (uploadedResults) => {
                    const newTask = await request<unknown, ITaskFile[]>('POST', API_ROUTES.TASKS.STORE_ATTACHMENTS.replace('{id}', task.id), {
                        file_uris: uploadedResults
                    })
                    onSuccessFiles([...newTask.data, ...(filesList || [])]);
                    // clean input file
                    const inputFile = document.getElementById(`attachment-${task.id}`) as HTMLInputElement;
                    if (inputFile) {
                        inputFile.value = '';
                    }
                }
            }
        )
    }

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
        setDragDropList((filesList || []).filter(att => criteria === 'design' ? att.uploaded_by.id === task.assigned_to?.id : att.uploaded_by.id !== task.assigned_to?.id))
    }

    useEffect(() => {
        if (filesList) {
            onFilterFiles('design');
        }
    }, [filesList])

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
                    <InputFile label="Añadir" id={`attachment-${task.id}`} multiple onChange={e => onUploadFiles(e.target.files)} />
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-2" ref={draggableParentRef}>
                {loading ? (
                    Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} className="h-20 w-full" />)
                ) : (
                    dragDropItems.map(attachment => (
                        <FileItem
                            key={attachment.id}
                            attachment={attachment}
                            taskId={task.id}
                            taskStatus={task.task_status?.slug}
                            onSuccessFile={(fileId) => {
                                const updatedFiles = dragDropItems.filter(file => file.id !== fileId);
                                onSuccessFiles(updatedFiles);
                            }}
                        />
                    ))
                )}
            </div>

            {selectedFile && <AttachmentViewer isOpen={!!selectedFile} onClose={() => setSelectedFile(null)} attachment={selectedFile} />}
        </div>
    )
}

export default TaskFiles