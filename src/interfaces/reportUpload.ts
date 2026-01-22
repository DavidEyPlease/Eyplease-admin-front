import { IBaseDBProperties, INewsletter, NewsletterSection } from "./common";

export interface ReportUpload extends IBaseDBProperties {
    status: 'processing' | 'completed' | 'failed'
    year_month: string
    error_message?: string
    newsletter: INewsletter
    newsletter_section: NewsletterSection
}