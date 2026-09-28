import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import useFetchQuery from '@/hooks/useFetchQuery'
import HttpService from '@/services/http'
import { API_ROUTES } from '@/constants/api'
import { ApiResponse } from '@/interfaces/common'
import { FileTypes } from '@/interfaces/files'
import { Acomodo, CelebrateResult, ChallengeDetail, ChallengeListItem, PreviewResult } from '@/interfaces/challenges'
import { getSignUploadUrl } from '@/utils/apiUtils'

const detailUrl = (id: string) => API_ROUTES.CHALLENGES.DETAIL.replace('{id}', id)
const listKey = ['challenges']
const detailKey = (id: string) => ['challenge', id]

/** El mensaje que manda la API cuando dice que no (`{ success: false, message }`), o uno genérico. */
export const errorText = (error: unknown, fallback = 'No se pudo completar') =>
    (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string' && error.message) || fallback

export const useChallengeList = () => useFetchQuery<ChallengeListItem[]>(API_ROUTES.CHALLENGES.LIST, { customQueryKey: listKey })

export const useChallengeDetail = (id: string) => useFetchQuery<ChallengeDetail>(detailUrl(id), { customQueryKey: detailKey(id), enabled: !!id })

/**
 * Lo que se hace desde el detalle de un reto. Cada acción refresca el reto y la lista; los errores de la API se
 * enseñan con su propio mensaje (el genérico de useRequestQuery no dice qué pasó).
 */
export const useChallengeActions = (id: string) => {
    const queryClient = useQueryClient()
    const [busy, setBusy] = useState<'' | 'request' | 'preview' | 'save' | 'celebrate' | 'upload'>('')

    const refresh = async () => {
        await queryClient.invalidateQueries({ queryKey: detailKey(id) })
        await queryClient.invalidateQueries({ queryKey: listKey })
    }

    const run = async <T,>(kind: typeof busy, action: () => Promise<T>): Promise<T | null> => {
        setBusy(kind)
        try {
            return await action()
        } catch (error) {
            toast.error(errorText(error))
            return null
        } finally {
            setBusy('')
        }
    }

    /** Pide la base a diseño: entra como pedido a nombre de la Directora, como el kit. */
    const requestBase = () => run('request', async () => {
        await HttpService.post<ApiResponse<ChallengeDetail>>(API_ROUTES.CHALLENGES.REQUEST_BASE.replace('{id}', id), {})
        await refresh()
        toast.success('Base pedida: ya está en Pedidos de diseño')
        return true
    })

    /** Arma una pieza con las medidas de pantalla, sin guardarlas. Sin persona: la de prueba (avatar y nombre largo). */
    const preview = (base: string, acomodo: Acomodo, personId: string | null, value: string | null) => run('preview', async () => {
        const { data } = await HttpService.post<ApiResponse<PreviewResult>>(API_ROUTES.CHALLENGES.PREVIEW.replace('{id}', id), {
            base, acomodo, person_id: personId, value,
        })
        return data
    })

    const save = (base: string, acomodo: Acomodo) => run('save', async () => {
        await HttpService.put<ApiResponse<unknown>>(API_ROUTES.CHALLENGES.TEMPLATE.replace('{id}', id), { base, acomodo })
        await refresh()
        toast.success('Base guardada: desde ahora cada ganadora sale sola')
        return true
    })

    /** Con `dryRun` sólo dice quiénes saldrían; sin él, las encola (cada una se llena en unos segundos). */
    const celebrate = (dryRun: boolean) => run('celebrate', async () => {
        const { data } = await HttpService.post<ApiResponse<CelebrateResult>>(API_ROUTES.CHALLENGES.CELEBRATE.replace('{id}', id), { dry_run: dryRun })
        if (!dryRun) await refresh()
        return data
    })

    /** Sube una base a mano a la carpeta del reto; devuelve su llave (se registra al guardar). */
    const upload = (file: File, folder: string) => run('upload', async () => {
        const extension = (file.name.split('.').pop() || 'png').toLowerCase()
        const random = Math.random().toString(36).slice(2, 10)
        const { url, key } = await getSignUploadUrl({ fileName: `${folder}subida-${random}.${extension}`, fileType: (file.type || 'image/png') as FileTypes, disk: 'private' })
        const response = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'image/png' } })
        if (!response.ok) throw new Error('No se pudo subir la imagen')
        return key
    })

    return { busy, requestBase, preview, save, celebrate, upload, refresh }
}
