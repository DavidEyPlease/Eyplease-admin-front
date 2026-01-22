import { FileUrls, RoleKeys } from "./common"

export interface ClientRole {
    name: string
    slug: string
}

export interface IRole {
    name: string
    role_key: RoleKeys
}

export interface IUser {
    id: string
    name: string
    email: string
    profile_picture: FileUrls | null
    username: string
    country: string
    phone: string
    role: IRole
    active: boolean
    on_notifications: boolean
    on_biometric_auth: boolean
}

export interface IUserUpdate {
    name?: string
    email?: string
    phone?: string
    onNotifications?: boolean
    onBiometricAuthentication?: boolean
    profilePicture?: string
    logotype?: string
}

export interface IChangePasswordData {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}