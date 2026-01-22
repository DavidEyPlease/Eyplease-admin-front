import { FileTextIcon, PencilLineIcon } from "lucide-react"
import { useActionState, useState } from "react"
import { toast } from "sonner"

import useListQuery from "@/hooks/useListQuery"
import { API_ROUTES } from "@/constants/api"
import { ITaskActivity } from "@/interfaces/tasks"
import { TasksService } from "@/services/tasks.service"
import { replaceRecordIdInPath } from "@/utils"
import { formatDate } from "@/utils/dates"
import { queryKeys } from "@/utils/queryKeys"
import { translateTaskActivityType } from "@/utils/tasks"

import Spinner from "@/components/common/Spinner"
import { TypographySmall } from "@/components/common/Typography"
import Avatar from "@/components/generics/Avatar"
import DynamicTabs from "@/components/generics/DynamicTabs"
import { Input } from "@/uishadcn/ui/input"
import { ScrollArea } from "@/uishadcn/ui/scroll-area"

interface TaskActivityProps {
    taskId: string;
}

type FilterActivity = 'all' | 'comment' | 'request_correction';

const TaskActivity = ({ taskId }: TaskActivityProps) => {
    const {
        response: activities,
        isLoading: loadingActivities,
        filters,
        onApplyFilters,
        setData
    } = useListQuery<ITaskActivity[], { activity_type: FilterActivity }>({
        endpoint: replaceRecordIdInPath(API_ROUTES.TASKS.GET_ACTIVITY, taskId),
        defaultPerPage: 15,
        defaultFilters: { activity_type: 'all' },
        customQueryKey: (params) => queryKeys.list(`task/${taskId}/activity`, params)
    })

    const [comment, setComment] = useState('')
    const [, formAction, isPending] = useActionState(
        async (prevState: unknown, queryData: FormData) => {
            try {
                const comment = queryData.get('comment') as string
                if (!comment) {
                    toast.error('El comentario no puede estar vacío');
                    return null;
                }
                const newComment = await TasksService.storeComment(taskId, comment)
                setComment('')
                setData([
                    newComment.data,
                    ...(activities || []),
                ])

                return null
            } catch (error) {
                console.log('Error storing comment:', error);
                toast.error('Error al guardar el comentario');
                return prevState;
            }
        },
        null
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <TypographySmall
                    text={
                        <div className="flex items-center gap-2">
                            <FileTextIcon className="size-4" />
                            Comentarios y Actividad
                        </div>
                    }
                />
            </div>

            <form action={formAction}>
                <Input
                    placeholder="Escribe un comentario..."
                    className="min-h-[50px] resize-none"
                    name="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isPending || loadingActivities}
                    loading={isPending}
                />
            </form>

            <DynamicTabs
                value={filters.activity_type}
                className="w-full h-7"
                onValueChange={e => onApplyFilters({ activity_type: e as FilterActivity })}
                items={[
                    { label: 'Correcciones', value: 'request_correction' },
                    { label: 'Comentarios', value: 'comment' },
                    { label: 'Todos', value: 'all' },
                ]}
            />

            {loadingActivities && (
                <div className="flex justify-center">
                    <Spinner size="sm" color="primary" className="w-fit" />
                </div>
            )}

            {/* Activity Feed */}
            <ScrollArea className="h-[90vh] w-full">
                <div className="space-y-4">
                    {(activities || []).map((activity, index) => {
                        const activityType = translateTaskActivityType(activity.activity_type);
                        return (
                            <div key={index} className="flex gap-3">
                                <Avatar src={activity.user?.profile_picture?.url || ''} alt={activity.user?.name || ''} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm break-words">
                                        <span className="font-semibold me-2">{activity.user.name}</span>
                                        {activityType && <span className="text-gray-500 text-xs">{activityType}: </span>}
                                        <span
                                            className="text-gray-800 dark:text-white break-words"
                                            dangerouslySetInnerHTML={{ __html: activity.activity_description }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</div>
                                        {activity.activity_type === 'request_correction' && (<PencilLineIcon className="size-4 text-red-400" />)}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    )
}

export default TaskActivity;