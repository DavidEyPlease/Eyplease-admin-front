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
    NEWSLETTER_REPORTS: 'newsletter_reports',
    NEWSLETTER_REPORT_UPLOADS: 'newsletter_report_uploads',
    NEWSLETTER_REPORT_LIST: 'newsletter_report_list',
    PUBLISH_POSTS: 'publish_posts',
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