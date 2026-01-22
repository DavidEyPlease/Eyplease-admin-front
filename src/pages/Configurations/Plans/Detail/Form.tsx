import { IconPlus } from "@/components/Svg/IconPlus";
import IconTrash from "@/components/Svg/IconTrash";
import Button from "@/components/common/Button";
import SwitchInput from "@/components/common/Inputs/Switch";
import TextInput from "@/components/common/Inputs/TextInput";
import { API_ROUTES } from "@/constants/api";
import useCustomForm from "@/hooks/useCustomForm";
import { ApiResponse, RoleKeys } from "@/interfaces/common";
import { IPlan, PlanUpdate } from "@/interfaces/plans";
import { PlanSchema } from "./page-utils";
import NumericInput from "@/components/common/Inputs/NumericInput";
import { useFieldArray } from "react-hook-form";
import { replaceRecordIdInPath } from "@/utils";
import { toast } from "sonner";
import { IModule } from "@/interfaces/permissions";
import { Card, CardContent } from "@/uishadcn/ui/card";
import { ScrollArea } from "@/uishadcn/ui/scroll-area";
import Spinner from "@/components/common/Spinner";
import clsx from "clsx";
import useFetchQuery from "@/hooks/useFetchQuery";
import { queryKeys } from "@/utils/queryKeys";
import useRequestQuery from "@/hooks/useRequestQuery";

interface Props {
    plan: IPlan
}

const FormPlan = ({ plan }: Props) => {
    // const { response: modules, loading: permissionsLoading } = useFetch<IModule[]>(API_ROUTES.PERMISSIONS.GET_ALL_ACCESS)
    const { response: apiResponse, loading: permissionsLoading } = useFetchQuery<{ modules: IModule[] }>(API_ROUTES.PERMISSIONS.GET_ALL_ACCESS, {
        customQueryKey: queryKeys.list(`plan/${plan.id}/accesses`),
        queryParams: { role: RoleKeys.CLIENT }
    })

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        control
    } = useCustomForm<PlanUpdate>(PlanSchema, {
        name: plan.name,
        active: plan.active,
        features: plan.features.map(f => ({ label: f })),
        free: plan.free,
        is_default: plan.is_default,
        price: plan.price,
        accesses: plan.accesses.map(a => ({ key: a.permission_key, nested_modules: a.custom_permissions }))
    })

    console.log(errors)

    const { fields: features, append, remove } = useFieldArray({
        control,
        name: 'features'
    });

    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.detail(`plan`, plan?.id || '')],
        onSuccess: () => {
            toast.success(`Plan actualizado correctamente`)
        },
        onError: (error) => {
            toast.error(`Error al guardar la plantilla: ${error.message}`);
        }
    })

    const onSubmit = handleSubmit(async (data) => {
        await request<Omit<PlanUpdate, 'features'> & { features: string[] }, ApiResponse<IPlan>>(
            'PUT',
            replaceRecordIdInPath(API_ROUTES.PLANS.UPDATE, plan.id),
            { ...data, features: data.features.map(f => f.label) }
        )
    })

    const onChangeNestedModule = (permissionKey: string, nested: { key: string, label: string }, checked: boolean) => {
        const accesses = watch('accesses')
        const permissionIndex = accesses.findIndex(a => a.key === permissionKey)
        const permission = accesses[permissionIndex]
        if (permission) {
            if (checked) {
                setValue('accesses', [
                    ...accesses.slice(0, permissionIndex),
                    { ...permission, nested_modules: [...permission.nested_modules, { key: nested.key, label: nested.label }] },
                    ...accesses.slice(permissionIndex + 1)
                ])
            } else {
                setValue('accesses', [
                    ...accesses.slice(0, permissionIndex),
                    { ...permission, nested_modules: permission.nested_modules.filter(n => n.key !== nested.key) },
                    ...accesses.slice(permissionIndex + 1)
                ])
            }
        }
    }

    return (
        <form className="space-y-5" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
                <Card className="col-span-3 h-max">
                    <CardContent>
                        <div className="grid grid-cols-1 mb-3 space-x-3 md:grid-cols-2">
                            <TextInput
                                label="Nombre del plan"
                                value={plan.name}
                                error={errors.name?.message}
                                register={register('name')}
                            />
                            <NumericInput
                                label='Precio del plan'
                                value={watch('price')}
                                error={errors.price?.message}
                                register={register('price')}
                                onChange={e => setValue('price', e as number)}
                            />
                        </div>
                        <div className="grid grid-cols-1 mb-5 md:grid-cols-3">
                            <SwitchInput id="free-plan" label="Gratis" checked={watch('free')} onCheckedChange={(e) => setValue('free', e)} />
                            <SwitchInput id="active-plan" label="Activo" checked={watch('active')} onCheckedChange={(e) => setValue('active', e)} />
                            <SwitchInput id="default-plan" label="Por defecto" checked={watch('is_default')} onCheckedChange={(e) => setValue('is_default', e)} />
                        </div>

                        <ScrollArea className="p-5 border rounded-md h-2/3">
                            <h3 className="mb-2 text-lg font-semibold">Características</h3>
                            {
                                features.map((feature, index) => (
                                    <div className="flex items-center mb-2 space-x-2" key={feature.id}>
                                        <div className="flex-1">
                                            <TextInput
                                                label={`Característica ${index + 1}`}
                                                register={register(`features.${index}.label`)}
                                            />
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            text={<IconTrash />}
                                            onClick={() => remove(index)}
                                        />
                                    </div>
                                ))
                            }
                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    color="primary"
                                    className="mt-0"
                                    text={
                                        <>
                                            <IconPlus />
                                            Agregar nuevo
                                        </>
                                    }
                                    onClick={() => append({ label: '' })}
                                />
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardContent>
                        <h3 className="mb-2 text-lg font-semibold">Permisos</h3>
                        {permissionsLoading ? (
                            <Spinner size="sm" color="primary" />
                        ) : (
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                {(apiResponse?.modules || []).map(module => (
                                    <Card className="h-max" key={module.key}>
                                        <CardContent className="grid gap-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold">{module.name}</p>
                                                <SwitchInput
                                                    id={module.key}
                                                    checked={watch('accesses').findIndex(a => a.key === module.key) !== -1}
                                                    onCheckedChange={(e) => setValue('accesses', e ? [...watch('accesses'), { key: module.key, nested_modules: [] }] : watch('accesses').filter(i => i.key !== module.key))}
                                                />
                                            </div>
                                            {module.sub_modules.map(permission => (
                                                <div key={permission.key} className={clsx('grid gap-y-2', !!permission.nested_modules.length && 'pb-2 border-b border-gray-200')}>
                                                    <SwitchInput
                                                        id={permission.key}
                                                        label={permission.name}
                                                        checked={watch('accesses').findIndex(a => a.key === permission.key) !== -1}
                                                        onCheckedChange={(e) => setValue('accesses', e ? [...watch('accesses'), { key: permission.key, nested_modules: [] }] : watch('accesses').filter(i => i.key !== permission.key))}
                                                    />
                                                    <div className="grid ms-5 gap-y-2">
                                                        {permission.nested_modules.map(nested => {
                                                            const access = watch('accesses').find(a => a.key === permission.key)
                                                            return (
                                                                <SwitchInput
                                                                    key={nested.key}
                                                                    disabled={!access}
                                                                    id={nested.key}
                                                                    label={nested.label}
                                                                    checked={access && access?.nested_modules.findIndex(n => n.key === nested.key) !== -1}
                                                                    onCheckedChange={(e) => onChangeNestedModule(permission.key, nested, e)}
                                                                />
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="text-center">
                <Button
                    text='Guardar'
                    type="submit"
                    color="primary"
                    rounded
                    loading={requestState.loading}
                />
            </div>
        </form>
    )
}

export default FormPlan;