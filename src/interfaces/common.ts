import { IAuthUser } from "./auth";
import { PermissionKeys } from "./permissions"
import { IPlan } from "./plans"
import { ITaskStatus, ITaskType } from "./tasks";
import { ITrainingCategory } from "./training";
import { IUser } from "./users"

export const CountriesKeys = {
    MX: 'MEX',
    US: 'USA',
    CO: 'COL',
} as const;
export type CountriesKeys = typeof CountriesKeys[keyof typeof CountriesKeys];

export const RoleKeys = {
    SUPER_ADMIN: 'super_admin',
    CLIENT: 'client',
    DESIGNER: 'designer',
} as const;
export type RoleKeys = typeof RoleKeys[keyof typeof RoleKeys];

export const UserTypeKeys = {
    SYSTEM: 'system',
    CLIENT: 'client',
    DESIGNER: 'designer',
} as const;
export type UserTypeKeys = typeof UserTypeKeys[keyof typeof UserTypeKeys];

export const Gender = {
    MALE: 'male',
    FEMALE: 'female',
} as const;
export type Gender = typeof Gender[keyof typeof Gender];

export const NewsletterTypes = {
    NATIONAL: 'national_newsletter',
    UNITY: 'unit_newsletter',
} as const;
export type NewsletterTypes = typeof NewsletterTypes[keyof typeof NewsletterTypes];

export const MenuKeys = {
    HOME: 'home',
    CLIENTS: 'clients',
    CONFIGURATION: 'configuration',
    PLANS: 'plans',
    TEMPLATES: 'templates',
    PERMISSIONS: 'permissions',
    TASKS: 'tasks',
} as const;
export type MenuKeys = typeof MenuKeys[keyof typeof MenuKeys];

export const CodeVerificationMethods = {
    EMAIL: 'email',
    PHONE: 'phone',
} as const;
export type CodeVerificationMethods = typeof CodeVerificationMethods[keyof typeof CodeVerificationMethods];


export type HttpMethods = 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'GET'

export type QueryParams<T> = {
    search?: string
    filters?: Partial<T>
    page?: number
    per_page?: number
    order_by?: string
    sort?: string
}

export interface JSONObject {
    [x: string]: JSONValue
}

export type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray

export type JSONArray = Array<JSONValue>

export type IGenericFilter = Record<string, JSONValue>

export interface IBaseDBProperties {
    id: string
    created_at: Date
    updated_at: Date
}

export type StorageDisks = 'public' | 'private'

export type ApiResponse<T> = {
    data: T
    error?: string | null
    success: boolean
    message?: string
}

export type PaginationResponse<T> = {
    items: T[]
    total_items: number
    per_page: number
    last_page: number
    current_page: number
}

export interface AuthResponse {
    user: IAuthUser
    token: string
}

export type NullishFile = FileUrls | null

export interface IFile extends FileUrls {
    id: string
    sort: number
    name: string
    ext: string
}

export interface FileUrls {
    url: string
    uri: string
}

export interface FAQ {
    id: string
    question: string
    answer: string
}

export interface NewsletterSection {
    id: string
    name: string
    canImported: boolean
    showInNewsletter: boolean
    sectionKey: string
}

export interface INewsletter {
    id: string
    name: string
    importDisplayName: string
    code: NewsletterTypes
    sections: NewsletterSection[]
}

export interface GlobalUtilData {
    plans: IPlan[],
    task_types: ITaskType[],
    task_statuses: ITaskStatus[],
    designers: IUser[],
    training_categories: ITrainingCategory[]
    newsletters: INewsletter[]
}

interface MenuSubItem {
    label: string
    key: PermissionKeys
    path: string,
    requiredPermission?: boolean
    permissionKeys?: PermissionKeys[]
}

export interface MenuItem {
    label: string
    key: PermissionKeys
    path: string
    icon: string
    requiredPermission?: boolean
    permissionKeys?: PermissionKeys[]
    children?: MenuSubItem[]
}

export interface VerificationCodeRequestBody {
    token: string
    recipient?: string
    verificationMethod: string
    verificationAction: string
    code: string
}

export interface TableColumn {
    key: string
    label: string
}

export interface SvgProps {
    className?: string
    size?: number
}

export interface ApiListParams {
    page: number
    pageSize: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    filters?: Record<string, any>
}

export interface IAutocompleteItem {
    value: string
    label: string
}