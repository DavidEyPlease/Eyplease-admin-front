import HttpService from '@/services/http'
import { ITemplateVariant, ITemplateVariantCreate, ITemplateVariantUpdate } from '@/interfaces/templates'
import { API_ROUTES } from '@/constants/api'
import { ApiResponse } from '@/interfaces/common'

/**
 * CRUD over the nested resource /templates/{templateId}/variants/{variantId}.
 * Mirrors the backend AdminTemplateVariantController.
 */
export class TemplateVariantsService {
    static async create(templateId: string, data: ITemplateVariantCreate): Promise<ApiResponse<ITemplateVariant>> {
        const url = API_ROUTES.TEMPLATES.VARIANTS.CREATE
            .replace('{templateId}', templateId)
        return HttpService.post(url, data)
    }

    static async get(templateId: string, variantId: string): Promise<ApiResponse<ITemplateVariant>> {
        const url = API_ROUTES.TEMPLATES.VARIANTS.DETAIL
            .replace('{templateId}', templateId)
            .replace('{variantId}', variantId)
        return HttpService.get(url)
    }

    static async update(templateId: string, variantId: string, data: ITemplateVariantUpdate): Promise<ApiResponse<ITemplateVariant>> {
        const url = API_ROUTES.TEMPLATES.VARIANTS.UPDATE
            .replace('{templateId}', templateId)
            .replace('{variantId}', variantId)
        return HttpService.put(url, data)
    }

    static async delete(templateId: string, variantId: string): Promise<ApiResponse<{ id: string }>> {
        const url = API_ROUTES.TEMPLATES.VARIANTS.DELETE
            .replace('{templateId}', templateId)
            .replace('{variantId}', variantId)
        return HttpService.delete(url)
    }
}
