import HttpService from '@/services/http'
import { ITemplate, ITemplateUpdate } from "@/interfaces/templates";
import { API_ROUTES } from '@/constants/api';
import { ApiResponse } from '@/interfaces/common';

export class TemplatesService {
    static async put(id: string, data: ITemplateUpdate): Promise<ApiResponse<ITemplate>> {
        return HttpService.put(API_ROUTES.TEMPLATES.UPDATE.replace('{id}', id), data);
    }
}