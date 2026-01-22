import { TaskStatusTypes } from "./tasks";

export interface IUploadReportsStats {
    active_clients: number;
    missing_reports: number;
    total_upload_reports: number;
    upload_percentage: number;
}

export type UsersLoggedInWeek = { day: string, users: number }[];
export type UserRequestServicesGraph = { status: string, slug: TaskStatusTypes, total: number }[];

export interface IDashboardStats extends IUploadReportsStats {
    active_clients: number;
    inactive_clients: number;
    active_percentage_clients: number;
    inactive_percentage_clients: number;
    percent_logged_in_today: number;
    total_clients: number;
    users_logged_in_today: number;
    users_logged_in_by_week: UsersLoggedInWeek
    user_request_services: UserRequestServicesGraph
}