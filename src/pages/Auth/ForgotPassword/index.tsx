import useCustomForm from "@/hooks/useCustomForm";
import AuthLayout from "@/layouts/AuthLayout";
import { useNavigate } from "react-router";
import { ForgotPasswordSchema } from "./schema";
import useRequest from "@/hooks/useRequest";
import { ApiResponse } from "@/interfaces/common";
import TextInput from "@/components/common/Inputs/TextInput";
import Button from "@/components/common/Button";

import IMG_FORGOT_PASSWORD from '@/assets/images/forgot_password.svg'
import { APP_ROUTES } from "@/constants/app";
import { API_ROUTES } from "@/constants/api";

type FormData = {
    email: string
}

const ForgotPasswordPage = () => {
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useCustomForm<FormData>(ForgotPasswordSchema, { email: '' })

    const { request, requestState } = useRequest('POST')

    const onSubmit = handleSubmit(async (data) => {
        const response = await request<ApiResponse<{ exists: boolean, token: string }>, FormData>(API_ROUTES.FORGOT_PASSWORD.VALIDATE_EMAIL, data)
        if (response.success && response.data?.exists) {
            navigate(`${APP_ROUTES.AUTH.FORGOT_PASSWORD_VERIFICATION_CODE}?token=${response.data.token}&email=${encodeURIComponent(data.email)}`)
        }
    })

    return (
        <AuthLayout>
            <div className="w-full text-center">
                <div className="mb-5">
                    <h2 className="mb-4 text-3xl font-bold text-gray-800">Recuperar contraseña</h2>
                    <p className="text-sm text-gray-600">
                        Ingresa el correo electrónico o usuario asociado a tu cuenta, te enviaremos un código de verificación para reestablecer tu contraseña
                    </p>
                </div>

                <div className="grid gap-y-10">
                    <img src={IMG_FORGOT_PASSWORD} className="w-32 mx-auto" />
                    <form onSubmit={onSubmit}>
                        <div className="flex flex-col gap-5 mx-auto mb-8">
                            <TextInput className="text-primary" label="Correo electronico" register={register("email")} error={errors.email?.message} />
                        </div>

                        <Button
                            text='Enviar código'
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
    );
}

export default ForgotPasswordPage;