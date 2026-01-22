import { toast } from "sonner"
import { useEffect } from "react"

import useCustomForm from "@/hooks/useCustomForm"
import { API_ROUTES } from "@/constants/api"
import { FORM_DEFAULT_VALUES, FormType, TrainingFormSchema } from "../utils"
import useRequestQuery from "@/hooks/useRequestQuery"
import { ApiResponse } from "@/interfaces/common"
import { ITraining } from "@/interfaces/training"
import useAuthStore from "@/store/auth"

import { Input } from "@/uishadcn/ui/input"
import { Separator } from "@/uishadcn/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/uishadcn/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/uishadcn/ui/select"
import Button from "@/components/common/Button"
import { publishEvent } from "@/utils/events"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import PlanSelector from "@/components/generics/PlanSelector"

interface TrainingFormProps {
    item?: ITraining | null
    onSuccess?: (template: ITraining) => void;
}

const TrainingForm = ({ item, onSuccess }: TrainingFormProps) => {
    const isEdit = !!item;
    const { utilData } = useAuthStore(state => state)

    const form = useCustomForm(
        TrainingFormSchema,
        item ? { title: item.title, plan_ids: item.plans.map(i => i.id), category_id: item.category.id } : FORM_DEFAULT_VALUES
    );

    const { request, requestState } = useRequestQuery({
        onSuccess: (response: ApiResponse<ITraining>) => {
            toast.success(`Entrenamiento guardado`);
            if (!item) form.reset();
            publishEvent(BROWSER_EVENTS.TRAININGS_LIST_UPDATED, { action: isEdit ? 'updated' : 'created', ...response.data });
            onSuccess?.(response.data);
        },
        onError: (error) => {
            toast.error(`Error al guardar el entrenamiento: ${error.message}`);
        }
    })

    const onSubmit = async (values: FormType) => {
        let endpoint = API_ROUTES.TRAININGS.CREATE
        if (item) {
            endpoint = API_ROUTES.TRAININGS.UPDATE.replace('{id}', item.id)
        }
        await request<FormType, ITraining>(
            item ? 'PUT' : 'POST',
            endpoint,
            values
        )
    }

    useEffect(() => {
        return () => {
            // Reset form and item update when component unmounts
            form.reset();
        }
    }, [])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Titulo</FormLabel>
                            <FormControl>
                                <Input placeholder="Ingresa el titulo" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="plan_ids"
                        render={({ field }) => (
                            <FormItem>
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

                    <FormField
                        control={form.control}
                        name="category_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Categoria de Entrenamiento
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl className="w-full">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una categoria" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {utilData.training_categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />

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

export default TrainingForm