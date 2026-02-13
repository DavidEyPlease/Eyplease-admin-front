import Dropdown from "@/components/common/Inputs/Dropdown";
import { TypographySmall } from "@/components/common/Typography";
import { MAP_TASK_STATUS_COLORS, MAP_TASK_TYPES_COLORS } from "@/constants/app";
import { ITask, ITaskUpdate, TaskStatusTypes, TaskTypes } from "@/interfaces/tasks";
import useAuthStore from "@/store/auth";
import { Button } from "@/uishadcn/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/uishadcn/ui/dialog"
import { Textarea } from "@/uishadcn/ui/textarea";
import { AlignLeftIcon, CalendarIcon, PaletteIcon, TrashIcon, User2Icon } from "lucide-react";
import { API_ROUTES } from "@/constants/api";
import useRequestQuery from "@/hooks/useRequestQuery";
import { toast } from "sonner";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import Spinner from "@/components/common/Spinner";
import TaskActivity from "./TaskActivity";
import useCustomForm from "@/hooks/useCustomForm";
import { TaskSchema } from "../Form/schema";
import { publishEvent } from "@/utils/events";
import DateTimePicker from "@/components/common/Inputs/DateTimePicker";
import { formatDate, toLocalDateFromUtc } from "@/utils/dates";
import TaskFiles from "./TaskFiles";
import DynamicTabs from "@/components/generics/DynamicTabs";
import { useState } from "react";
import FieldValue from "@/components/generics/FieldValue";
import { ScrollArea } from "@/uishadcn/ui/scroll-area";

interface TaskDetailProps {
    task: ITask;
    onClose: () => void;
}

type ActiveTab = "files" | "nexrender";

const getFormCurrentTask = (task: ITask) => {
    return {
        description: task.description,
        title: task.title,
        started_at: toLocalDateFromUtc(task.started_at),
        expired_at: new Date(task.expired_at),
        expired_at_time: formatDate(task.expired_at, 'HH:mm:ss'),
        type: task.task_type.id,
        status: task.task_status.id,
        user: task.assigned_to?.id || null,
    }
}

const ColorSwatch = ({ label, value }: { label: string; value: string }) => {
    return (
        <div className="flex items-center gap-2">
            <span
                aria-hidden
                className="h-4 w-4 rounded ring-1 ring-black/10"
                style={{ backgroundColor: value }}
                title={value}
            />
            <span className="text-xs text-muted-foreground">
                {label}: {value}
            </span>
        </div>
    )
}

const TaskDetail = ({ task, onClose }: TaskDetailProps) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>("files");

    const { utilData } = useAuthStore(state => state);
    const currentTask = getFormCurrentTask(task);

    const form = useCustomForm(
        TaskSchema,
        currentTask
    );

    const { request, requestState } = useRequestQuery({
        onError: () => {
            toast.error('Ha ocurrido un error al guardar la tarea');
        }
    })

    const handleSave = async (data: ITaskUpdate) => {
        try {
            const newTask = await request<ITaskUpdate, ITask>(
                'PATCH',
                API_ROUTES.TASKS.UPDATE.replace('{id}', task.id),
                data
            )
            publishEvent('tasks-updated', { ...newTask.data, eventType: 'update' })
            const newFormValues = getFormCurrentTask(newTask.data)
            form.reset(newFormValues)
            toast.success('Tarea actualizada correctamente')
        } catch (e) {
            console.error('Error updating task:', e);
        }
    }

    const debouncedSave = useDebouncedCallback((data: ITaskUpdate) => {
        handleSave(data)
    }, 1000)

    const onChangeInputs = (value: string, field: keyof ITaskUpdate) => {
        if (!value || !value.trim()) return;
        form.setValue(field, value);
        debouncedSave({ [field]: value })
    }

    const onChangeValues = (value: string | Date, field: keyof ITaskUpdate) => {
        form.setValue(field, value);
        handleSave({ [field]: value })
    }

    const onDelete = async () => {
        try {
            await request(
                'DELETE',
                API_ROUTES.TASKS.DELETE.replace('{id}', task.id)
            )
            toast.success('Tarea eliminada correctamente');
            publishEvent('tasks-updated', { id: task.id, eventType: 'delete' });
            onClose();
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Error al eliminar la tarea');
        }
    }

    return (
        <Dialog open={Boolean(task)} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-8xl max-h-[90vh] overflow-hidden p-0">
                <div className="flex flex-wrap">
                    {/* Main Content */}
                    <ScrollArea className="h-[90vh] flex-1 p-5">
                        {/* Header */}
                        <DialogHeader className="space-y-4">
                            <div className="flex items-center gap-3">
                                {requestState.loading ? (
                                    <Spinner size="xs" color="primary" className="w-fit" />
                                ) : (
                                    <div className={`size-3 rounded-full ${MAP_TASK_STATUS_COLORS[task.task_status.slug]}`} />
                                )}
                                <DialogTitle className="flex w-full items-center justify-between">
                                    <Textarea
                                        placeholder="Ingresa el titulo de la tarea"
                                        value={form.watch('title') || ''}
                                        className="min-h-[50px] text-lg md:text-xl resize-none w-full flex-1 border-none bg-transparent dark:bg-transparent focus:dark:bg-input/30"
                                        onChange={(e) => onChangeInputs(e.target.value, 'title')}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => onDelete()} disabled={requestState.loading}>
                                        <TrashIcon className="w-4 h-4" />
                                    </Button>
                                </DialogTitle>
                            </div>
                        </DialogHeader>

                        <div className="mt-6 space-y-6">
                            {/* Labels and Due Date */}
                            <div className="flex flex-wrap gap-3">
                                <div className="flex flex-col gap-2">
                                    <TypographySmall text="Tipo de tarea" />
                                    <Dropdown
                                        placeholder="Seleccionar tipo de tarea"
                                        value={form.watch('type')}
                                        items={utilData.task_types.map(s => ({
                                            label: s.name,
                                            value: s.id,
                                            color: MAP_TASK_TYPES_COLORS[s.slug]
                                        }))}
                                        onChange={v => onChangeValues(v, 'type')}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <TypographySmall text="Estado" />
                                    <Dropdown
                                        placeholder="Seleccionar estado"
                                        value={form.watch('status')}
                                        key={form.watch('status')}
                                        items={utilData.task_statuses.map(s => ({
                                            label: s.name,
                                            value: s.id,
                                            color: MAP_TASK_STATUS_COLORS[s.slug]
                                        }))}
                                        onChange={v => onChangeValues(v, 'status')}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <TypographySmall
                                        text={
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="size-4" />
                                                Entrega
                                            </div>
                                        }
                                    />
                                    <DateTimePicker
                                        dateValue={form.watch('expired_at') || ''}
                                        onDateChange={(date) => onChangeValues(date, 'expired_at')}
                                        timeValue={form.watch('expired_at_time') || ''}
                                        onTimeChange={(time) => onChangeValues(time, 'expired_at_time')}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <TypographySmall
                                        text={
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="size-4" />
                                                Publicación
                                            </div>
                                        }
                                    />
                                    <DateTimePicker
                                        dateValue={form.watch('started_at') || ''}
                                        onDateChange={(date) => onChangeValues(date, 'started_at')}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <TypographySmall
                                        text={
                                            <div className="flex items-center gap-2">
                                                <User2Icon className="size-4" />
                                                Responsable
                                            </div>
                                        }
                                    />
                                    <Dropdown
                                        placeholder="Seleccionar responsable"
                                        value={form.watch('user') || ''}
                                        key={form.watch('user')}
                                        items={utilData.designers.map(s => ({
                                            label: s.name,
                                            value: s.id,
                                        }))}
                                        onChange={v => onChangeValues(v, 'user')}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <TypographySmall
                                    text={
                                        <div className="flex items-center gap-2">
                                            <AlignLeftIcon className="size-4" />
                                            Descripción
                                        </div>
                                    }
                                />
                                <Textarea
                                    placeholder="Añadir una descripción más detallada..."
                                    value={form.watch('description') || ''}
                                    onChange={(e) => onChangeInputs(e.target.value, 'description')}
                                    className="min-h-[100px] resize-none mt-2"
                                />
                            </div>

                            {task.task_type?.slug === TaskTypes.SERVICE && task.metadata && (
                                (task.metadata.primaryColor || task.metadata.secondaryColor) && (
                                    <FieldValue label="Colores" flexDirection="col" className="items-start">
                                        <div className="flex items-center gap-4">
                                            <PaletteIcon />
                                            <ColorSwatch label="Primario" value={task.metadata.primaryColor || ''} />
                                            <ColorSwatch label="Secundario" value={task.metadata.secondaryColor || ''} />
                                        </div>
                                    </FieldValue>
                                )
                            )}

                            {/* Attachments */}
                            <DynamicTabs
                                value={activeTab}
                                onValueChange={e => setActiveTab(e as ActiveTab)}
                                items={[
                                    { label: 'Archivos / Diseños', value: 'files' },
                                    { label: 'Configuración Nexrender', value: 'nexrender', disabled: task.task_status?.slug !== TaskStatusTypes.UPLOAD_AE_RESOURCES },
                                ]}
                            />
                            {activeTab === 'files' && (
                                <TaskFiles
                                    taskId={task.id}
                                    assignedTo={task.assigned_to}
                                />
                            )}
                        </div>
                    </ScrollArea>

                    {/* Right Sidebar */}
                    <div className="w-full lg:w-96 border-l bg-gray-50 dark:bg-card p-4">
                        <TaskActivity taskId={task.id} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default TaskDetail;