import { EypleaseFile } from "./files"
import { IPlan } from "./plans"
import { IUser } from "./users"

export interface IClient {
    id: string
    name: string
    account: string
    from_signup: string
    mk_status: string
    photo: EypleaseFile
    created_at: Date
    country: string
    logotype: EypleaseFile
    start_date: string
    last_sign_in_at: Date | null
    user: IUser & { plan: IPlan | null }
}

export interface IBasicClient {
    id: string
    name: string
    account: string
    active: boolean
    created_at: Date
    template_id: string | null
}

export interface IClientStats {
    newsPercentage: {
        sent: number;
        total: number;
        percentage: number;
    };
    tools_download_percentage: number;
    total_tools: number;
    downloaded_tools: number;
    monthly_posts: number;
    month: string;
}

export interface IClientFilters {
    plan: string
    active: string
}

export interface IClientUpdate {
    photo?: string | null
    logo?: string | null
}

export type ClientFilterKeys = keyof IClientFilters

export const URI_MAIN_CLIENT_PHOTO = 'public/network-people/photos/{id}'
export const URI_CLIENT_LOGOTYPE = 'public/network-people/logotypes/{id}'