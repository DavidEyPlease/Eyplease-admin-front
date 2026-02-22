import { CountriesKeys, MenuItem, RoleKeys, UserTypeKeys } from "@/interfaces/common"
import { PermissionKeys } from "@/interfaces/permissions"
import { UserRequestStatusTypes } from "@/interfaces/requestService"
import { TaskStatusTypes } from "@/interfaces/tasks"
import { ToolSectionTypes } from "@/interfaces/tools"

export const APP_ROUTES = {
    AUTH: {
        SIGN_UP: '/auth/sign-up',
        SIGN_IN: '/auth/sign-in',
        FORGOT_PASSWORD: '/auth/forgot-password',
        FORGOT_PASSWORD_VERIFICATION_CODE: '/auth/forgot-password/verification-code',
        CHANGE_PASSWORD: '/auth/change-password',
        SUCCESS_REGISTER: '/auth/success-register',
    },
    CLIENTS: {
        LIST: '/clients',
        CREATE: '/clients/create',
        EDIT: '/clients/edit/:id',
        DETAIL: '/clients/:id',
    },
    CONFIGURATIONS: {
        PLANS: '/configurations/plans',
        PLAN_DETAIL: '/configurations/plans/:id',
        TEMPLATES: '/configurations/templates',
        TEMPLATE_DETAIL: '/configurations/templates/:id',
        PERMISSIONS: '/configurations/permissions',
    },
    HOME: {
        INITIAL: '/dashboard',
        NEWSLETTER: '/newsletter',
        PROFILE: '/profile',
        GALLERY: '/gallery',
        MY_CLIENTS: '/my-clients',
        TRAINING: '/training'
    },
    TASKS: {
        LIST: '/tasks',
        DETAIL: '/tasks/:id',
    },
    TRAININGS: {
        LIST: '/trainings',
        DETAIL: '/trainings/:id',
    },
    NEWSLETTER_REPORTS: {
        UPLOADS: '/newsletter-reports/upload',
        LIST: '/newsletter-reports/list',
    }
}

export const SESSION_KEY = 'EyWebPleaseTokenAdm'

export const SIDEBAR_ITEMS: MenuItem[] = [
    {
        key: PermissionKeys.DASHBOARD,
        path: APP_ROUTES.HOME.INITIAL,
        label: 'Inicio',
        permissionKeys: [PermissionKeys.DASHBOARD],
        icon: 'home',
    },
    {
        key: PermissionKeys.CLIENTS,
        label: 'Clientes',
        path: APP_ROUTES.CLIENTS.LIST,
        requiredPermission: true,
        permissionKeys: [PermissionKeys.CLIENTS],
        icon: 'gallery',
    },
    {
        key: PermissionKeys.TRAININGS,
        label: "Entrenamientos",
        path: APP_ROUTES.TRAININGS.LIST,
        icon: 'trainings',
        requiredPermission: true,
        permissionKeys: [PermissionKeys.TRAININGS]
    },
    {
        key: PermissionKeys.TASKS,
        label: 'Tareas',
        path: APP_ROUTES.TASKS.LIST,
        requiredPermission: true,
        permissionKeys: [PermissionKeys.TASKS],
        icon: 'tasks',
    },
    {
        key: PermissionKeys.NEWSLETTER_REPORTS,
        label: "Boletines",
        path: '',
        icon: 'reportUploads',
        requiredPermission: true,
        permissionKeys: [PermissionKeys.NEWSLETTER_REPORTS],
        children: [
            {
                key: PermissionKeys.NEWSLETTER_REPORT_UPLOADS,
                label: "Cargar boletines",
                path: APP_ROUTES.NEWSLETTER_REPORTS.UPLOADS,
                requiredPermission: true,
                permissionKeys: [PermissionKeys.NEWSLETTER_REPORT_UPLOADS],
            },
            {
                key: PermissionKeys.NEWSLETTER_REPORT_LIST,
                label: "Reporte de cargas",
                path: APP_ROUTES.NEWSLETTER_REPORTS.LIST,
                requiredPermission: true,
                permissionKeys: [PermissionKeys.NEWSLETTER_REPORT_LIST],
            },
        ]
    },
    {
        key: PermissionKeys.CONFIGURATION,
        label: "Configuraciones",
        path: '',
        icon: 'settings',
        requiredPermission: true,
        permissionKeys: [PermissionKeys.CONFIGURATION],
        children: [
            {
                key: PermissionKeys.PLANS,
                label: "Planes",
                path: APP_ROUTES.CONFIGURATIONS.PLANS,
                requiredPermission: true,
                permissionKeys: [PermissionKeys.PLANS],
            },
            {
                key: PermissionKeys.TEMPLATES,
                label: "Plantillas",
                path: APP_ROUTES.CONFIGURATIONS.TEMPLATES,
                requiredPermission: true,
                permissionKeys: [PermissionKeys.TEMPLATES],
            },
            {
                key: PermissionKeys.PERMISSIONS,
                label: "Permisos",
                path: APP_ROUTES.CONFIGURATIONS.PERMISSIONS,
                requiredPermission: true,
                permissionKeys: [PermissionKeys.PERMISSIONS],
            },
        ]
    },
]

export const MAP_USER_REQUEST_STATUS = {
    [UserRequestStatusTypes.PENDING]: {
        label: 'Recibido',
        colorClass: 'tertiary-light',
        bgBorder: 'bg-tertiary-light'
    },
    [UserRequestStatusTypes.IN_PROGRESS]: {
        label: 'En proceso',
        colorClass: 'color-warning',
        bgBorder: 'bg-color-warning'
    },
    [UserRequestStatusTypes.COMPLETED]: {
        label: 'Entregado',
        colorClass: 'primary',
        bgBorder: 'bg-primary'
    },
    [UserRequestStatusTypes.PENDING_CORRECTION]: {
        label: 'En correción',
        colorClass: 'secondary',
        bgBorder: 'bg-secondary'
    }
}

export const MAP_TASK_STATUS_COLORS: Record<TaskStatusTypes, string> = {
    [TaskStatusTypes.READY_FOR_PUBLISH]: 'bg-blue-500',
    [TaskStatusTypes.UNASSIGNED]: 'bg-gray-500',
    [TaskStatusTypes.IN_PROGRESS]: 'bg-yellow-500',
    [TaskStatusTypes.READY_FOR_REVIEW]: 'bg-cyan-500',
    [TaskStatusTypes.COMPLETED]: 'bg-green-500',
    [TaskStatusTypes.PENDING_CORRECTION]: 'bg-red-500',
    [TaskStatusTypes.UPLOAD_AE_RESOURCES]: 'bg-purple-500',
}

export const MAP_TASK_TYPES_COLORS: Record<string, string> = {
    tools: 'bg-teal-500',
    trainings: 'bg-indigo-500',
    'user-service-request': 'bg-purple-500',
}

export const USER_TYPE_LIST = [
    { label: 'Sistema', value: UserTypeKeys.SYSTEM },
    { label: 'Cliente', value: UserTypeKeys.CLIENT },
    { label: 'Diseñador', value: UserTypeKeys.DESIGNER },
]

export const ROLE_LIST = [
    { label: 'Administrador', value: RoleKeys.SUPER_ADMIN, userType: UserTypeKeys.SYSTEM },
    // { label: 'Cliente', value: RoleKeys.CLIENT, userType: UserTypeKeys.CLIENT },
    { label: 'Diseñador', value: RoleKeys.DESIGNER, userType: UserTypeKeys.DESIGNER },
]

export const MONTHS_OPTIONS = [
    { label: 'Enero', value: '01' },
    { label: 'Febrero', value: '02' },
    { label: 'Marzo', value: '03' },
    { label: 'Abril', value: '04' },
    { label: 'Mayo', value: '05' },
    { label: 'Junio', value: '06' },
    { label: 'Julio', value: '07' },
    { label: 'Agosto', value: '08' },
    { label: 'Septiembre', value: '09' },
    { label: 'Octubre', value: '10' },
    { label: 'Noviembre', value: '11' },
    { label: 'Diciembre', value: '12' },
]

export const TOOLS_TYPES = [
    { label: 'Entérate Ya', value: ToolSectionTypes.STAY_INFORMED },
    { label: 'Aprende', value: ToolSectionTypes.LEARN },
    { label: 'Explica', value: ToolSectionTypes.EXPLAIN },
    { label: 'Propuestas', value: ToolSectionTypes.PROPOSALS },
    { label: 'Productos', value: ToolSectionTypes.PRODUCTS },
    { label: 'Inicia', value: ToolSectionTypes.GET_STARTED },
]

export const COUNTRIES_LIST = [
    { label: 'México', value: CountriesKeys.MX },
    { label: 'Estados Unidos', value: CountriesKeys.US },
    { label: 'Colombia', value: CountriesKeys.CO },
]