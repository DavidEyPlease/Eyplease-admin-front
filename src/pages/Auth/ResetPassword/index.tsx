import Button from "@/components/common/Button";
import TextInput from "@/components/common/Inputs/TextInput";
import AuthLayout from "@/layouts/AuthLayout";

import CHANGE_PASSWORD_ICON from "@/assets/images/change_password.svg"
import useCustomForm from "@/hooks/useCustomForm";
import { IResetPassword, ResetPasswordSchema } from "./schema";
import useRequest from "@/hooks/useRequest";
import { ApiResponse } from "@/interfaces/common";
import { API_ROUTES } from "@/constants/api";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "@/constants/app";

const ResetPasswordPage = () => {
    const params = new URLSearchParams(window.location.search)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useCustomForm<IResetPassword>(ResetPasswordSchema, { password: '', confirmPassword: '' })
    const { request, requestState } = useRequest('POST')
    const navigate = useNavigate()

    const onSubmit = handleSubmit(async (data) => {
        if (!params.get('token')) return
        const response = await request<ApiResponse<boolean>, IResetPassword & { sessionToken: string }>(API_ROUTES.FORGOT_PASSWORD.RESET_PASSWORD, { ...data, sessionToken: params.get('token') || '' })
        if (response.success) {
            toast.success('Excelente! Ya cuentas con una nueva contraseña para iniciar sesión en Eyplease')
            navigate(APP_ROUTES.AUTH.SIGN_IN)
        }
    })

    return (
        <AuthLayout>
            <div className="w-full text-center">
                <div className="mb-5">
                    <h2 className="mb-4 text-3xl font-bold text-gray-800">Crea una nueva contraseña</h2>
                    <p className="text-sm text-gray-600">
                        Ingresa tu nueva contraseña y confírmala para poder acceder a tu cuenta
                    </p>
                </div>

                <div className="grid gap-y-10">
                    <img src={CHANGE_PASSWORD_ICON} className="w-32 mx-auto" />
                    <form onSubmit={onSubmit}>
                        <div className="flex flex-col gap-5 mx-auto mb-8">
                            <TextInput
                                label="Contraseña"
                                type="password"
                                className="text-primary border border-primary"
                                register={register('password')}
                                error={errors.password?.message}
                            />
                            <TextInput
                                variant="underlined"
                                label="Confirmar Contraseña"
                                type="password"
                                className="text-primary border border-primary"
                                register={register('confirmPassword')}
                                error={errors.confirmPassword?.message}
                            />
                        </div>

                        <Button
                            text='Cambiar contraseña'
                            type="submit"
                            color="primary"
                            rounded
                            block
                            loading={requestState.loading}
                        />
                    </form>
                </div>
            </div>
        </AuthLayout>
    )
}

export default ResetPasswordPage;