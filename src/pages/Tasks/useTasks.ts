import { API_ROUTES } from "@/constants/api";
import { BROWSER_EVENTS } from "@/constants/browserEvents";
import useListQuery from "@/hooks/useListQuery";
import { ITask, TasksFilters } from "@/interfaces/tasks";
import { TasksService } from "@/services/tasks.service";
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events";
import { queryKeys } from "@/utils/queryKeys"
import { toLocalDateFromUtc } from "@/utils/dates";
import { EventClickArg } from "@fullcalendar/core/index.js";
import { DateClickArg } from "@fullcalendar/interaction/index.js";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";

const CURRENT_MONTH = new Date().getMonth() + 1;

export interface UseTaskResult {
    isLoading: boolean;
    isRefetching: boolean;
    selectedTask: ITask | null;
    setSelectedTask: (task: ITask | null) => void;
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    tasks: ITask[];
    setData: (data: ITask[]) => void;
    handleEventClick: (eventInfo: EventClickArg) => void;
    handleDateSelect: (selectInfo: DateClickArg) => void;
    filters: TasksFilters;
    onApplyFilters: (filters: TasksFilters) => void;
    onDragEnd: (toDate: Date, taskId: string) => Promise<void>;
}

const useTasks = (): UseTaskResult => {
    const [selectedTask, setSelectedTask] = useState<ITask | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [open, setOpen] = useState(false)

    const {
        isLoading,
        isRefetching,
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
        const handleEvent = (event: BrowserEvent<ITask>) => {
            setSelectedTask(event.detail);
        };
        subscribeEvent(BROWSER_EVENTS.OPEN_TASK_DETAIL, handleEvent as EventListener)
        return () => {
            unsubscribeEvent(BROWSER_EVENTS.OPEN_TASK_DETAIL, handleEvent as EventListener)
        }
    }, [])

    useEffect(() => {
        if (tasks) {
            const calendarTasks = tasks.map((task) => ({
                ...task,
                start: dayjs(toLocalDateFromUtc(task.started_at)).format('YYYY-MM-DD'),
                // end: dayjs(toLocalDateFromUtc(task.started_at)).format('YYYY-MM-DD'),
                classNames: ['border-0', 'bg-primary', 'shadow-md'],
            }))
            setData(calendarTasks)
        }
    }, [tasks])

    return {
        isLoading,
        selectedTask,
        isRefetching,
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