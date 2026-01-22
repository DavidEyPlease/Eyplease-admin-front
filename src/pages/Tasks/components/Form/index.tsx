import z from "zod";

import useCustomForm from "@/hooks/useCustomForm";
import { FORM_DEFAULT_VALUES, TaskSchema } from "./schema";
import { API_ROUTES } from "@/constants/api";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/uishadcn/ui/form"
import Button from "@/components/common/Button"
import { Input } from "@/uishadcn/ui/input";
import { Textarea } from "@/uishadcn/ui/textarea";
import { AlignLeftIcon, CalendarIcon, UserIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/uishadcn/ui/select";
import { ITask, TaskTypes } from "@/interfaces/tasks";
import { useEffect } from "react";
import useRequestQuery from "@/hooks/useRequestQuery";
import { toast } from "sonner";
import useAuthStore from "@/store/auth";
import { ApiResponse } from "@/interfaces/common";
import DateTimePicker from "@/components/common/Inputs/DateTimePicker";
import { Separator } from "@/uishadcn/ui/separator";
import Dropdown from "@/components/common/Inputs/Dropdown";
import { TOOLS_TYPES } from "@/constants/app";
import PlanSelector from "@/components/generics/PlanSelector";

interface TaskFormProps {
    selectedDate: Date | null;
    onSuccess?: (newTask: ITask) => void;
}

const TaskForm = ({ selectedDate, onSuccess }: TaskFormProps) => {
    const { utilData } = useAuthStore(state => state)
    const form = useCustomForm(
        TaskSchema,
        FORM_DEFAULT_VALUES
    );

    const { request, requestState } = useRequestQuery({
        // invalidateQueries: [queryKeys.list('config/templates')],
        onSuccess: (response: ApiResponse<ITask>) => {
            toast.success('Tarea guardada');
            form.reset()
            onSuccess?.(response.data);
        },
        onError: (error) => {
            toast.error(`Error al guardar la tarea: ${error.message}`);
        }
    })

    const onSubmit = async (values: z.infer<typeof TaskSchema>) => {
        const endpoint = API_ROUTES.TASKS.CREATE
        await request(
            'POST',
            endpoint,
            values
        )
    }

    useEffect(() => {
        if (selectedDate) {
            form.setValue('started_at', selectedDate);
            form.setValue('expired_at', selectedDate);
        }
    }, [selectedDate]);

    const taskType = form.watch('type');

    console.log('form errors', form.formState.errors);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="grid md:grid-cols-2">
                    <FormItem>
                        <FormLabel>
                            Tipo de tarea
                        </FormLabel>
                        <Select defaultValue={TaskTypes.TOOLS} disabled>
                            <FormControl className="w-full">
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo de tarea" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {utilData.task_types.map((type) => (
                                    <SelectItem key={type.id} value={type.slug}>{type.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                </div>

                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Título
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Ingresa el título" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                <AlignLeftIcon />
                                Descripción
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Añadir un descripción más detallada..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="user"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    <UserIcon className="size-4" />
                                    Asignar a
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl className="w-full">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar usuario" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {utilData.designers.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="expired_at"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>
                                    <CalendarIcon className="size-4" />
                                    Fecha Vencimiento
                                </FormLabel>
                                <DateTimePicker
                                    dateValue={field.value}
                                    onDateChange={(date) => field.onChange(date)}
                                    timeValue={form.watch('expired_at_time') || ''}
                                    onTimeChange={(time) => form.setValue('expired_at_time', time)}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {taskType === TaskTypes.TOOLS && (
                    <>
                        <Separator />
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="metadata.tools_section"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>
                                            Sección de Herramientas
                                        </FormLabel>
                                        <Dropdown
                                            className="max-w-xs"
                                            placeholder="Selecciona la sección"
                                            value={field.value}
                                            onChange={field.onChange}
                                            items={TOOLS_TYPES}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="metadata.plan_ids"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>
                                            Plan
                                        </FormLabel>
                                        <PlanSelector
                                            mode="multiple"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="metadata.publication_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>
                                        <CalendarIcon className="size-4" />
                                        Fecha Publicación
                                    </FormLabel>
                                    <DateTimePicker
                                        withTime={false}
                                        dateValue={field.value}
                                        onDateChange={(date) => field.onChange(date)}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}

                <Button
                    text='Guardar'
                    type="submit"
                    color="primary"
                    rounded
                    block
                    loading={requestState.loading}
                />
            </form>
        </Form>
    )
}

export default TaskForm;