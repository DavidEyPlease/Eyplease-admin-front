import HttpService from '@/services/http'
import { API_ROUTES } from '@/constants/api';
import { ApiResponse } from '@/interfaces/common';
import { IClient, IClientUpdate } from '@/interfaces/clients';

export class ClientsService {
    static async update(clientId: string, data: IClientUpdate): Promise<ApiResponse<IClient>> {
        return HttpService.put(API_ROUTES.CLIENTS.UPDATE.replace('{id}', clientId), data);
    }
}