import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { InputFile } from "@/components/common/Inputs/InputFile"
import { ITask, ITaskFile } from "@/interfaces/tasks";
import useFetchQuery from "@/hooks/useFetchQuery";
import { API_ROUTES } from "@/constants/api";
import { queryKeys } from "@/utils/queryKeys";
import { useEffect, useState } from "react";
import useRequestQuery from "@/hooks/useRequestQuery";
import useUploadStore from "@/store/uploadStore";
import { Skeleton } from "@/uishadcn/ui/skeleton";
import FileItem from "./FileItem";

interface IProps {
    task: ITask
}

type UploadAssetsData = { uploadUrl: string, headers: string, templateId: string }

const NexrenderConfig = ({ task }: IProps) => {
    const [loadingUpload, setLoadingUpload] = useState(false)
    const { request } = useRequestQuery()
    const startUpload = useUploadStore(state => state.startUpload)

    const [draggableParentRef, dragDropItems, setDragDropList] = useDragAndDrop<HTMLDivElement, ITaskFile>(
        [],
        {
            // plugins: [animations()],
            onDragend: () => {
                sortItems()
            }
        }
    )

    const { response: filesList, loading, fetchRetry, setData: setFiles } = useFetchQuery<ITaskFile[]>(
        API_ROUTES.TASKS.GET_FILES.replace('{id}', task.id),
        {
            customQueryKey: queryKeys.list(`tasks-template-file-${task.id}`),
            enabled: !!task.id,
            queryParams: { file_type: 'nexrender_template' }
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
        // onSuccessFiles(sortFiles)
    }

    const onSuccessFiles = (files: ITaskFile[]) => {
        setDragDropList(files);
        setFiles(files);
    }

    const onUploadTemplates = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        try {
            setLoadingUpload(true)
            startUpload(
                Array.from(files),
                {
                    uploadUri: `public/templates/tools/${task.consecutive}`,
                    onAllSuccess: async (uploadedResults) => {
                        const inputFile = document.getElementById(`nexrender-templates-${task.id}`) as HTMLInputElement;
                        if (inputFile) {
                            inputFile.value = '';
                            const apiResponse = await request<unknown, UploadAssetsData>('POST', API_ROUTES.TASKS.UPLOAD_TEMPLATE_ATTACHMENT.replace('{id}', task.id), {
                                file_uri: uploadedResults[0]?.fileUri
                            })
                            setLoadingUpload(false)
                            if (apiResponse.success) {
                                fetchRetry()
                            }
                        }
                    }
                }
            )
        } catch (error) {
            console.error(error)
            setLoadingUpload(false)
        }
    }

    useEffect(() => {
        if (filesList) {
            setDragDropList(filesList || [])
        }
    }, [filesList])

    return (
        <div>
            <div className="flex items-center justify-end mb-3">
                <InputFile
                    label="Cargar Plantillas"
                    id={`nexrender-templates-${task.id}`}
                    accept=".zip"
                    loading={loadingUpload || loading}
                    // multiple
                    onChange={e => onUploadTemplates(e.target.files)}
                />
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
        </div>
    )
}

export default NexrenderConfig