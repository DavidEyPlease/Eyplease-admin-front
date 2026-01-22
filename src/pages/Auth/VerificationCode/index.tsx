import AuthLayout from "@/layouts/AuthLayout"

import IMG_VERIFICATION_CODE from '@/assets/images/verification_code.svg'
import useRequest from "@/hooks/useRequest"
import { APP_ROUTES } from "@/constants/app"
import { useNavigate, useSearchParams } from "react-router"
import Button from "@/components/common/Button"
import CodeInput from "@/components/common/Inputs/CodeInput"
import { ApiResponse, CodeVerificationMethods, VerificationCodeRequestBody } from "@/interfaces/common"
import { API_ROUTES } from "@/constants/api"
import { useState } from "react"

const VerificationCodePage = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [code, setCode] = useState('')
    const { request, requestState } = useRequest('POST')

    const onSubmit = async () => {
        const search = new URLSearchParams(window.location.search)
        const token = search.get('token')
        const email = search.get('email')
        if (!code || (code && code.length < 6) || !token || !email) return
        const response = await request<ApiResponse<{ sessionToken: string }>, VerificationCodeRequestBody>(
            API_ROUTES.VERIFICATION_TEMPORARY_CODE,
            { code, recipient: email, verificationMethod: CodeVerificationMethods.EMAIL, verificationAction: 'forgot_password', token }
        )
        if (response.success && response.data?.sessionToken) {
            navigate(`${APP_ROUTES.AUTH.CHANGE_PASSWORD}?token=${response.data?.sessionToken}`)
        }
    }

    return (
        <AuthLayout>
            <div className="w-full text-center">
                <div className="mb-5">
                    <h2 className="mb-4 text-xl font-bold text-gray-800">Revisa tu correo electrónico</h2>
                    <p className="text-sm text-gray-600">
                        Por favor ingresa el código de 6 dígitos que hemos enviado al correo <b className="text-primary">{searchParams?.get('email')}</b>
                    </p>
                </div>

                <div className="grid gap-y-10">
                    <img src={IMG_VERIFICATION_CODE} className="w-32 mx-auto" />
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        onSubmit()
                    }}>
                        <CodeInput onChange={(e) => setCode(e)} />

                        <div className="flex items-center justify-center mx-auto my-10 border-b w-max border-slate-300 text-primary">
                            <p className="text-sm">Aún no recibes el código?</p>
                        </div>

                        <Button
                            text='Verificar código'
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

export default VerificationCodePage