import Button from "@/components/common/Button"
import TextInput from "@/components/common/Inputs/TextInput"
import useCustomForm from "@/hooks/useCustomForm"
import { IUserUpdate } from "@/interfaces/users"
import { EditProfileSchema } from "../utils"
import { useState } from "react"
import useAuth from "@/hooks/useAuth"
import { IAuthUser } from "@/interfaces/auth"

interface Props {
    user: IAuthUser
    onSuccess: () => void
}

const FormEditProfile = ({ user, onSuccess }: Props) => {
    const [loadingAction, setLoadingAction] = useState('')
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useCustomForm<IUserUpdate>(EditProfileSchema, { name: user?.name, email: user?.email, phone: user?.phone })
    const { updateUser } = useAuth()

    const onSubmit = handleSubmit(async (data) => {
        try {
            setLoadingAction('updateUser')
            await updateUser(data)
            onSuccess()
        } finally {
            setLoadingAction('')
        }
    })

    return (
        <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-5 mx-auto mb-16">
                <TextInput
                    label="Nombre Completo"
                    register={register('name')}
                    error={errors.name?.message}
                />
                <TextInput
                    label="Nombre de usuario"
                    disabled
                    value={user?.username}
                />
                <TextInput
                    label="Correo electrónico"
                    type="email"
                    register={register('email')}
                    error={errors.email?.message}
                />
                <TextInput
                    label="Número de teléfono"
                    type="number"
                    register={register('phone')}
                    error={errors.phone?.message}
                />
            </div>

            <Button
                text='Guardar'
                type="submit"
                color="primary"
                rounded
                block
                loading={loadingAction === 'updateUser'}
            />
        </form>
    )
}

export default FormEditProfile;