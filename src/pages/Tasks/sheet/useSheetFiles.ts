import { useMemo } from 'react'

import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { ITask, ITaskFile } from '@/interfaces/tasks'
import { splitFiles } from './lib'
import { sheetKeys } from './useTaskSheet'

/**
 * Los archivos del pedido, repartidos en entregas y lo que mandó la clienta. Una sola consulta: la usan la
 * galería y el botón de «Entregar» (que no se ofrece sin diseños).
 *
 * Se piden TODOS menos las plantillas de Nexrender (tienen su apartado). Antes se pedían sólo los marcados
 * como imagen, y la ficha subía las imágenes sin esa marca: podían no volver a aparecer al abrirla.
 */
const useSheetFiles = (task: ITask) => {
    const { response, loading } = useFetchQuery<ITaskFile[]>(API_ROUTES.TASKS.GET_FILES.replace('{id}', task.id), {
        customQueryKey: sheetKeys.files(task.id),
        enabled: Boolean(task.id),
    })

    const files = useMemo(() => (Array.isArray(response) ? response : []).filter(file => file.file_type !== 'nexrender_template' && file.file?.id), [response])
    const { designs, fromClient } = useMemo(() => splitFiles(task, files), [task, files])

    return { files, designs, fromClient, loading: loading && !response }
}

export default useSheetFiles
