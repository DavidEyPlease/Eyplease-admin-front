import AuthLayout from "@/layouts/AuthLayout"

import useCustomForm from '@/hooks/useCustomForm'
import useRequest from '@/hooks/useRequest'
import { SignInSchema } from './schema'
import { ApiResponse, AuthResponse } from "@/interfaces/common"
import Button from "@/components/common/Button"
import TextInput from "@/components/common/Inputs/TextInput"
import Link from "@/components/common/Link"
import { APP_ROUTES, SESSION_KEY } from "@/constants/app"
import { API_ROUTES } from "@/constants/api"
import useAuth from "@/hooks/useAuth"
import { useState } from "react"

type FormData = {
    username: string
    password: string
}

const SignInPage = () => {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useCustomForm<FormData>(SignInSchema, { username: '', password: '' })
    const { getMe } = useAuth()
    const { request } = useRequest('POST')

    const onSubmit = handleSubmit(async (data) => {
        try {
            setLoading(true);
            const response = await request<ApiResponse<AuthResponse>, FormData>(API_ROUTES.SIGN_IN, data)
            if (response.success && response.data) {
                const { token } = response.data
                localStorage.setItem(SESSION_KEY, token)
                await getMe()
            }
        } catch (error) {
            console.error("Error during sign-in:", error);
        } finally {
            setLoading(false);
        }
    })

    return (
        <AuthLayout>
            <div className="w-full text-center">
                <div className="mb-5">
                    <h2 className="mb-4 text-3xl font-bold text-gray-800">
                        Inicie sesión en su cuenta
                    </h2>
                    <p className="text-gray-600">
                        Ingrese su usuario a continuación para iniciar sesión en su cuenta
                    </p>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="flex flex-col gap-5 mx-auto mb-16">
                        <TextInput className="text-primary" label="Usuario" register={register("username")} error={errors.username?.message} />
                        <TextInput
                            type="password"
                            label="Contraseña"
                            register={register("password")}
                            className="text-primary"
                            error={errors.password?.message}
                        />
                        <div className="flex justify-end">
                            <Link text="Olvidé mi contraseña" to={APP_ROUTES.AUTH.FORGOT_PASSWORD} />
                        </div>
                    </div>

                    <Button
                        text='Entrar'
                        type="submit"
                        color="primary"
                        rounded
                        block
                        loading={loading}
                    />
                </form>
            </div>
        </AuthLayout>
    )
}

export default SignInPage