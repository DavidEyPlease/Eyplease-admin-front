import Button from "@/components/common/Button";
import TextInput from "@/components/common/Inputs/TextInput";
import useCustomForm from "@/hooks/useCustomForm";
import { Card, CardContent, CardHeader } from "@/uishadcn/ui/card";
import { ChangePasswordSchema } from "../utils";
import useAuth from "@/hooks/useAuth";
import { IChangePasswordData } from "@/interfaces/users";



const ChangePassword = () => {
    const { loadingAction, changePassword } = useAuth()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useCustomForm<IChangePasswordData>(ChangePasswordSchema, { newPassword: '', confirmPassword: '', currentPassword: '' })

    const onSubmit = handleSubmit(async (data) => {
        await changePassword(data)
    })

    return (
        <Card>
            <CardHeader>Cambiar Contraseña</CardHeader>
            <CardContent>
                <form onSubmit={onSubmit}>
                    <div className="grid grid-cols-1 gap-5 mb-5 md:grid-cols-2">
                        <TextInput
                            label="Contraseña actual"
                            type="password"
                            register={register('currentPassword')}
                            error={errors.currentPassword?.message}
                        />
                        <TextInput
                            type="password"
                            label="Nueva Contraseña"
                            register={register("newPassword")}
                            error={errors.newPassword?.message}
                        />
                        <TextInput
                            type="password"
                            label="Confirmar Nueva Contraseña"
                            register={register("confirmPassword")}
                            error={errors.confirmPassword?.message}
                        />
                    </div>

                    <Button
                        text='Guardar'
                        type="submit"
                        color="primary"
                        rounded
                        loading={loadingAction === 'changePassword'}
                    />
                </form>
            </CardContent>
        </Card>
    )
}

export default ChangePassword;