import { FileUrls } from "./common"
import { PermissionKeys, UIValuePermission } from "./permissions"
import { IRole } from "./users"

export type IAuthUserPermissions = Array<UIValuePermission & { permissible_key: PermissionKeys }>

export interface IAuthUser {
    id: string
    name: string
    email: string
    profile_picture: FileUrls | null
    username: string
    country: string
    phone: string
    role: IRole & { permissions: IAuthUserPermissions }
    on_notifications: boolean
    on_biometric_auth: boolean
}