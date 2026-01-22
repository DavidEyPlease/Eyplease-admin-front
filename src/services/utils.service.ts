import HttpService from '@/services/http'
import { ApiListParams, ApiResponse } from '@/interfaces/common'
import { buildQueryString } from '@/utils/apiUtils'

export class UtilsService {
    static async getSuggestionItems<T>(endpoint: string, params: ApiListParams): Promise<ApiResponse<T[]>> {
        const queryParams = buildQueryString(params);
        const fullEndpoint = `${endpoint}?${queryParams}`
        return HttpService.get(fullEndpoint);
    }
}