import { EypleaseFile } from "./files"
import { IPlan } from "./plans"
import { DiscountType } from "./promotion"
import { IUser } from "./users"

/** Per-client applied promotion snapshot (null when none). */
export interface ClientPromotion {
    promotion_id: string | null
    name: string | null
    discount_type: DiscountType
    discount: number
    expires_at: string
}

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
    last_sign_in_at: Date | null
    platform_guest_account: string | null
    external_company_pw: string | null
    rank: string | null
    start_date: string | null
    last_order_date: string | null
    user: IUser & { plan: IPlan | null }
    promotion: ClientPromotion | null
}

export type IClientListItem = IClient

export interface IBasicClient {
    id: string
    name: string
    account: string
    active: boolean
    created_at: Date
    template_id: string | null
}

export interface IClientStats {
    tools_download_percentage: number;
    total_tools: number;
    downloaded_tools: number;
    monthly_posts: number;
    shared_posts: number;
    posts_shared_percentage: number;
    month: string;
}

export interface IClientFilters {
    plan: string
    active: string
}

export interface IClientUpdate {
    photo?: string | null
    logo?: string | null
    active?: boolean
    platform_guest_account?: string | null
    external_company_pw?: string | null
    phone?: string | null
}

export type ClientFilterKeys = keyof IClientFilters

export const URI_MAIN_CLIENT_PHOTO = 'public/network-people/{id}/photos'
export const URI_CLIENT_LOGOTYPE = 'public/network-people/{id}/logotypes'