import { useEffect, useRef } from "react"

import { API_ROUTES } from "@/constants/api"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import useFetchQuery from "@/hooks/useFetchQuery"
import { ITemplate } from "@/interfaces/templates"
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events"
import { queryKeys } from "@/utils/queryKeys"
import { TEMPLATE_GROUP_REPORTS } from "../page-utils"

/** Todas menos las de boletín (reportes y anual): ésas tienen su propia pantalla */
const PARAMS = { not_template_group: TEMPLATE_GROUP_REPORTS }

/**
 * Todas las plantillas de publicaciones en UNA carga (son ~220 y la API no pagina): así cambiar de mes,
 * buscar o filtrar es instantáneo. La pantalla vieja no pedía nada hasta elegir un filtro —y buscar solo
 * no contaba como filtro—, por eso al entrar siempre decía «No hay nada que mostrar aquí».
 *
 * La llave es la de `templates/posts`: el formulario de crear, editar y clonar ya la invalida. Encender,
 * apagar y borrar avisan con TEMPLATES_LIST_UPDATED y se corrigen aquí mismo, sin volver a pedir todo.
 */
const usePostTemplates = () => {
    const { response, loading, error, setData, fetchRetry } = useFetchQuery<ITemplate[]>(API_ROUTES.TEMPLATES.LIST, {
        queryParams: PARAMS,
        customQueryKey: queryKeys.list('templates/posts', { all: true }),
        staleTime: 60_000,
    })

    /* `setData` es una función nueva en cada render: el aviso lee siempre la última sin volver a suscribirse */
    const latest = useRef({ response, setData })
    useEffect(() => { latest.current = { response, setData } })

    useEffect(() => {
        const onUpdated = (event: Event) => {
            const { detail } = event as BrowserEvent<ITemplate & { isDeleted?: boolean }>
            const { response: list, setData: save } = latest.current
            if (!list || !detail?.id) return
            save(detail.isDeleted
                ? list.filter(item => item.id !== detail.id)
                : list.map(item => item.id === detail.id ? { ...item, ...detail } : item))
        }

        subscribeEvent(BROWSER_EVENTS.TEMPLATES_LIST_UPDATED, onUpdated)
        return () => unsubscribeEvent(BROWSER_EVENTS.TEMPLATES_LIST_UPDATED, onUpdated)
    }, [])

    return { templates: response ?? [], loading, failed: !!error, retry: fetchRetry }
}

export default usePostTemplates
