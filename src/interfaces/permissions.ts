export interface NestedModule {
    key: string
    label: string
}

export interface IPermission {
    name: string
    permission_key: PermissionKeys
    is_active: boolean
    custom_permissions: Array<NestedModule>
}

export const PermissionKeys = {
    CLIENTS: 'clients',
    CONFIGURATION: 'configurations',
    PLANS: 'plans',
    TEMPLATES: 'templates',
    TASKS: 'tasks',
    PERMISSIONS: 'permissions',
    DASHBOARD: 'dashboard',
    USER_SERVICES: 'user_services',
    TRAININGS: 'trainings',
    REPORT_UPLOADS: 'report_uploads',
} as const;

export type PermissionKeys = typeof PermissionKeys[keyof typeof PermissionKeys];


type ISubModule = {
    id: string
    name: string
    key: string
    nested_modules: Array<{ key: string, label: string }>
}

export type IModule = {
    id: string
    name: string
    key: string
    sub_modules: ISubModule[]
}

export type UIValuePermission = {
    permissible_id: string,
    permissible_type: "module" | "sub_module" | "nested_module",
    can_view: boolean
    nested_modules?: NestedModule[]
}