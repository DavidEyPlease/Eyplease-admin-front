import { useState } from "react"

import HttpService from '@/services/http'
import { ApiResponse, GlobalUtilData } from "@/interfaces/common"
import { useLocation, useNavigate } from "react-router"
import useAuthStore from "@/store/auth"
import { APP_ROUTES, SESSION_KEY } from "@/constants/app"
import { API_ROUTES } from "@/constants/api"
import { IChangePasswordData, IUser, IUserUpdate } from "@/interfaces/users"
import { toast } from "sonner"
import { FileTypes } from "@/interfaces/files"
import { IAuthUser } from "@/interfaces/auth"
import useFiles from "./useFiles"

const useAuth = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout, setUtilData, setAuth, setUser } = useAuthStore(state => state)
    const [loadingAction, setLoadingAction] = useState('')
    const [pending, setPending] = useState(true)
    const { onUploadFile } = useFiles()

    const updateUser = async (data: IUserUpdate) => {
        try {
            const response = await HttpService.put<ApiResponse<IAuthUser>>(API_ROUTES.UPDATE_USER, data)
            if (response.data) {
                setUser(response.data)
                toast.success('Perfil actualizado correctamente')
            }
            return response?.data
        } catch (error) {
            toast.error('Error al actualizar el perfil')
        }
    }

    const getAuthUtilData = async () => {
        const response = await HttpService.get<ApiResponse<GlobalUtilData>>('/util-data')
        if (response.data) {
            setUtilData({
                ...response.data,
            })
        }
    }

    const handleLogout = () => {
        HttpService.post(API_ROUTES.LOGOUT, {}).finally(() => {
            logout()
            navigate(APP_ROUTES.AUTH.SIGN_IN)
            localStorage.removeItem(SESSION_KEY);
        })
    }

    const getMe = async () => {
        HttpService.getMe<ApiResponse<IAuthUser>>().then(async response => {
            if (response.data) {
                setAuth(response.data)
                await getAuthUtilData()
                if (['/', APP_ROUTES.AUTH.SIGN_IN].includes(location.pathname)) {
                    navigate(APP_ROUTES.HOME.INITIAL)
                }
            } else {
                navigate(APP_ROUTES.AUTH.SIGN_IN)
            }
        }).catch(() => {
            if (!Object.values(APP_ROUTES.AUTH).includes(location.pathname)) {
                navigate(APP_ROUTES.AUTH.SIGN_IN)
            }
        }).finally(() => setPending(false))
    }

    const uploadUserPhoto = async (file: File, type: FileTypes, uri: string, updateKey?: keyof IUserUpdate) => {
        try {
            const onCallback = async (fileKey?: string) => {
                if (fileKey && updateKey) {
                    await updateUser({ [updateKey]: fileKey })
                }
            }

            await onUploadFile({
                file,
                filename: uri,
                fileType: type,
                callback: () => onCallback(uri)
            })
        } catch (error) {
            toast.error('Error al subir la foto de perfil')
        }
    }

    const changePassword = async (data: IChangePasswordData) => {
        try {
            setLoadingAction('changePassword')
            const response = await HttpService.post<ApiResponse<IUser>>(API_ROUTES.CHANGE_PASSWORD, data)
            if (response.success && response.data) {
                toast.success(response.message || 'Contraseña modificada correctamente')
                handleLogout()
                localStorage.removeItem(SESSION_KEY)
                navigate(APP_ROUTES.AUTH.SIGN_IN)
            }
        } catch (error) {
            toast.error('Error al cambiar la contraseña')
        } finally {
            setLoadingAction('')
        }
    }

    return {
        pending,
        user,
        isLogged: !!user,
        loadingAction,
        uploadUserPhoto,
        getMe,
        handleLogout,
        updateUser,
        changePassword
    }
}

export default useAuth