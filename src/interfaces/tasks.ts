import { IBaseDBProperties, IFile } from "./common";
import { IUser } from "./users";

export const TaskStatusTypes = {
    UNASSIGNED: 'unassigned',
    IN_PROGRESS: 'in-progress',
    READY_FOR_REVIEW: 'ready-for-review',
    READY_FOR_PUBLISH: 'ready-for-publish',
    COMPLETED: 'completed',
    PENDING_CORRECTION: 'correction',
    UPLOAD_AE_RESOURCES: 'upload_ae_resources'
} as const;

export type TaskStatusTypes = typeof TaskStatusTypes[keyof typeof TaskStatusTypes];

export const TaskTypes = {
    TOOLS: 'tools',
    SERVICE: 'user-service-request',
    TRAININGS: 'trainings'
} as const;

export type TaskTypes = typeof TaskTypes[keyof typeof TaskTypes];

export interface ITaskType {
    id: string;
    name: string;
    slug: string;
}

export interface ITaskStatus {
    id: string;
    name: string;
    slug: TaskStatusTypes;
}

export type TasksFilters = {
    month?: number
    task_types?: string[]
    statuses?: string[]
}

export interface ITask extends IBaseDBProperties {
    id: string
    title: string
    description: string | null
    started_at: Date
    expired_at: Date
    task_status: ITaskStatus
    task_type: ITaskType
    assigned_to: IUser | null
    files: ITaskFile[]
    metadata: {
        primaryColor?: string
        secondaryColor?: string
    }
}

export interface ITaskUpdate {
    title?: string;
    description?: string | null;
    started_at?: Date;
    expired_at?: Date;
    expired_at_time?: string;
    status?: string;
    type?: string;
    user?: string | null;
}

export interface ITaskActivity extends IBaseDBProperties {
    user: IUser;
    activity_type: string;
    activity_description: string;
}

export interface ITaskFile extends IBaseDBProperties {
    uploaded_by: IUser;
    file: IFile
}
