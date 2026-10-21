import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import useFetchQuery from '@/hooks/useFetchQuery'
import useRequestQuery from '@/hooks/useRequestQuery'
import { API_ROUTES } from '@/constants/api'
import { SocialCalendarResponse, SocialMedia, SocialPost, SocialPostInput } from '@/interfaces/social'
import { queryKeys } from '@/utils/queryKeys'

import { addDays, ymd } from './social.utils'

/** Dos semanas desde `start` (un lunes), con lo que no tiene fecha todavía. */
export const useSocialCalendar = (start: Date) => {
    const queryParams = useMemo(() => ({ from: ymd(start), to: ymd(addDays(start, 13)) }), [start])
    return useFetchQuery<SocialCalendarResponse>(API_ROUTES.SOCIAL.POSTS, {
        queryParams,
        customQueryKey: queryKeys.list('social/posts', queryParams),
        staleTime: 30 * 1000,
    })
}

const showServerError = (error: unknown) => {
    const message = (error as { message?: string })?.message
    toast.error(message || 'No se pudo guardar. Intenta de nuevo.')
}

export const useSocialActions = () => {
    const queryClient = useQueryClient()
    const { request } = useRequestQuery({ onError: showServerError })
    const [busy, setBusy] = useState<string | null>(null)

    const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.listBase('social/posts') })

    /** Corre la llamada, refresca el calendario y devuelve lo que contestó (o null si falló: el aviso ya salió). */
    const run = async <T,>(key: string, fn: () => Promise<{ data?: T }>): Promise<T | null> => {
        setBusy(key)
        try {
            const response = await fn()
            await refresh()
            return (response?.data ?? null) as T | null
        } catch {
            return null
        } finally {
            setBusy(null)
        }
    }

    const save = (post: SocialPost | null, input: SocialPostInput) => run<SocialPost>(post?.id ?? 'new', () => post
        ? request<SocialPostInput, SocialPost>('PUT', API_ROUTES.SOCIAL.POST.replace('{id}', post.id), input)
        : request<SocialPostInput, SocialPost>('POST', API_ROUTES.SOCIAL.POSTS, input))

    const act = (post: SocialPost, url: string, body?: Record<string, unknown>) =>
        run<SocialPost>(post.id, () => request<Record<string, unknown> | undefined, SocialPost>('POST', url.replace('{id}', post.id), body))

    const approve = async (post: SocialPost) => {
        const done = await act(post, API_ROUTES.SOCIAL.APPROVE)
        if (done) toast.success('Aprobada: sale sola a su hora.', { action: { label: 'Deshacer', onClick: () => { void act(done, API_ROUTES.SOCIAL.UNSCHEDULE) } } })
        return done
    }
    const requestChange = async (post: SocialPost, note: string) => {
        const done = await act(post, API_ROUTES.SOCIAL.REQUEST_CHANGE, { note })
        if (done) toast.success('Regresó a producción con tu comentario.')
        return done
    }
    const unschedule = async (post: SocialPost) => {
        const done = await act(post, API_ROUTES.SOCIAL.UNSCHEDULE)
        if (done) toast.success('Ya no está programada: quedó por aprobar.')
        return done
    }
    const publishNow = async (post: SocialPost) => {
        const done = await act(post, API_ROUTES.SOCIAL.PUBLISH_NOW)
        if (done) toast.success('Sale en el próximo minuto.')
        return done
    }
    const remove = async (post: SocialPost) => {
        const done = await run<{ deleted: boolean }>(post.id, () => request('DELETE', API_ROUTES.SOCIAL.POST.replace('{id}', post.id)))
        if (done) toast.success('Publicación borrada.')
        return !!done
    }

    /** Sube la pieza al CDN; Meta la descarga de ahí al publicar. */
    const upload = async (file: File): Promise<SocialMedia | null> => {
        const body = new FormData()
        body.append('file', file)
        setBusy('upload')
        try {
            const response = await request<FormData, SocialMedia>('POST', API_ROUTES.SOCIAL.MEDIA, body)
            return response?.data ?? null
        } catch {
            return null
        } finally {
            setBusy(null)
        }
    }

    /** Lo que vio tu estado de WhatsApp (lo ves en tu teléfono y lo apuntas aquí). */
    const saveWhatsAppMetrics = async (post: SocialPost, views: number | null, replies: number | null) => {
        const done = await run<SocialPost>(post.id, () => request<Record<string, number | null>, SocialPost>('PATCH', API_ROUTES.SOCIAL.WHATSAPP_METRICS.replace('{id}', post.id), { views, replies }))
        if (done) toast.success('Anotado.')
        return done
    }

    return { busy, save, approve, requestChange, unschedule, publishNow, remove, upload, saveWhatsAppMetrics }
}

export type SocialActions = ReturnType<typeof useSocialActions>

/**
 * Bajar una pieza para subirla a mano (el estado de WhatsApp). En el teléfono abre «Compartir», que deja guardarla en
 * Fotos o mandarla directo a WhatsApp; en la compu la descarga. El CDN deja leerla (CORS abierto).
 */
export const downloadMedia = async (item: SocialMedia, name: string) => {
    try {
        const blob = await (await fetch(item.url)).blob()
        const ext = item.type === 'video' ? 'mp4' : (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
        const filename = `${name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase() || 'eyplease'}.${ext}`
        const file = new File([blob], filename, { type: blob.type })
        const touch = window.matchMedia('(pointer: coarse)').matches
        if (touch && navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file] })
            return
        }
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        setTimeout(() => URL.revokeObjectURL(link.href), 4000)
    } catch (error) {
        if ((error as Error)?.name === 'AbortError') return
        window.open(item.url, '_blank', 'noopener')
    }
}
