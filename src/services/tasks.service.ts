import HttpService from '@/services/http'
import { API_ROUTES } from '@/constants/api';
import { ApiResponse } from '@/interfaces/common';
import { ITask, ITaskActivity, ITaskUpdate } from '@/interfaces/tasks';

export class TasksService {
    static async storeComment(taskId: string, comment: string): Promise<ApiResponse<ITaskActivity>> {
        return HttpService.post(API_ROUTES.TASKS.STORE_COMMENT.replace('{id}', taskId), { comment });
    }

    static async patchTask(taskId: string, data: Partial<ITaskUpdate>): Promise<ApiResponse<ITask>> {
        return HttpService.patch(API_ROUTES.TASKS.UPDATE.replace('{id}', taskId), data);
    }

    static async deleteTaskFile(taskId: string, fileId: string): Promise<ApiResponse<ITask>> {
        return HttpService.delete(API_ROUTES.TASKS.DELETE_ATTACHMENT.replace('{id}', taskId).replace('{attachmentId}', fileId));
    }
}