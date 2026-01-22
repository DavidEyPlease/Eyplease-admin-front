import { API_ROUTES } from "@/constants/api";
import useListQuery from "@/hooks/useListQuery";
import { ITask, TasksFilters } from "@/interfaces/tasks";
import { TasksService } from "@/services/tasks.service";
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events";
import { queryKeys } from "@/utils/queryKeys"
import { EventClickArg } from "@fullcalendar/core/index.js";
import { DateClickArg } from "@fullcalendar/interaction/index.js";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const CURRENT_MONTH = new Date().getMonth() + 1;

const useTasks = () => {
    const [selectedTask, setSelectedTask] = useState<ITask | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [open, setOpen] = useState(false)

    const {
        isLoading,
        response,
        filters,
        onApplyFilters,
        setData
    } = useListQuery<ITask[], TasksFilters>({
        endpoint: API_ROUTES.TASKS.LIST,
        defaultFilters: { month: CURRENT_MONTH },
        customQueryKey: (params) => queryKeys.list(`tasks/month/${CURRENT_MONTH}`, params)
    })
    const tasks = response || []

    const handleEventClick = (eventInfo: EventClickArg) => {
        const task = eventInfo.event._def.extendedProps as ITask;
        setSelectedTask({
            ...task,
            id: eventInfo.event.id,
            title: eventInfo.event.title
        });
    }

    const handleDateSelect = (selectInfo: DateClickArg) => {
        setSelectedDate(selectInfo.date)
        setOpen(true)
    }

    const handleTaskUpdate = useCallback((event: BrowserEvent<Partial<ITask> & { id: string, eventType: 'add' | 'update' | 'delete' | 'updateDetail' }>) => {
        if (event.detail.eventType === 'delete') return setData(tasks.filter(item => item.id !== event.detail.id))
        if (event.detail.eventType === 'add') {
            return setData([...tasks, { ...event.detail, id: event.detail.id } as ITask])
        }
        if (['updateDetail', 'update'].includes(event.detail.eventType) && selectedTask && selectedTask.id === event.detail.id) {
            setSelectedTask({ ...selectedTask, ...event.detail })
        }
        setData((tasks ?? []).map(item => {
            return item.id === event.detail.id ? { ...item, ...event.detail } : item
        }))
    }, [tasks, selectedTask])

    const onDragEnd = async (toDate: Date, taskId: string) => {
        try {
            await TasksService.patchTask(taskId, { started_at: toDate })
        } catch (error) {
            toast.error(`Error al actualizar la tarea: ${error.message}`);
        }
    }

    useEffect(() => {
        subscribeEvent('tasks-updated', handleTaskUpdate as EventListener)

        return () => {
            unsubscribeEvent('tasks-updated', handleTaskUpdate as EventListener)
        }
    }, [handleTaskUpdate])

    useEffect(() => {
        if (tasks) {
            setData(tasks.map((task) => ({
                ...task,
                start: new Date(task.started_at).toISOString().replace(/T.*$/, ''),
                end: new Date(task.expired_at).toISOString().replace(/T.*$/, ''),
                classNames: ['border-0', 'bg-primary', 'shadow-md'],
                // borderColor: ['transparent'],
                // backgroundColor: MAP_TASK_TYPES_COLORS[task.task_type.slug],
            })))
        }
    }, [tasks])

    return {
        isLoading,
        selectedTask,
        setSelectedTask,
        selectedDate,
        setSelectedDate,
        open,
        setOpen,
        tasks,
        setData,
        handleEventClick,
        handleDateSelect,
        filters,
        onApplyFilters,
        onDragEnd
    }
}

export default useTasks;