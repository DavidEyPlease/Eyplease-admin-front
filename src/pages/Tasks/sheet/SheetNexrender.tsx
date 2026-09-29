import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronDownIcon, FileArchiveIcon, Loader2Icon, Trash2Icon, UploadIcon } from 'lucide-react'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { ITask, ITaskFile, TemplateAssetType } from '@/interfaces/tasks'
import { cn } from '@/lib/utils'
import HttpService from '@/services/http'
import { TasksService } from '@/services/tasks.service'
import useUploadStore from '@/store/uploadStore'
import SheetConfirm from './SheetConfirm'
import { whenOf } from './lib'
import { errorText, sheetKeys } from './useTaskSheet'

/**
 * Las plantillas de Nexrender de un pedido de Biblioteca (un .zip por diseño) y si cada una arma una imagen
 * o un video. Va plegado: se usa poco y no es lo que se revisa del pedido.
 */
const SheetNexrender = ({ task, onChanged }: { task: ITask, onChanged: () => void }) => {
    const queryClient = useQueryClient()
    const key = sheetKeys.templates(task.id)
    const input = useRef<HTMLInputElement>(null)
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [toDelete, setToDelete] = useState<ITaskFile | null>(null)
    const startUpload = useUploadStore(state => state.startUpload)
    const uploading = useUploadStore(state => state.uploads.some(item => item.status === 'uploading'))
    const busy = uploading || saving

    const { response, loading } = useFetchQuery<ITaskFile[]>(API_ROUTES.TASKS.GET_FILES.replace('{id}', task.id), {
        customQueryKey: key,
        queryParams: { file_type: 'nexrender_template' },
        enabled: Boolean(task.id),
    })
    const templates = Array.isArray(response) ? response : []
    const refresh = () => queryClient.invalidateQueries({ queryKey: key })

    const upload = (file: File | undefined) => {
        if (!file) return
        setOpen(true)
        startUpload([file], {
            uploadUri: `public/templates/tools/${task.consecutive}`,
            onAllSuccess: async results => {
                setSaving(true)
                try {
                    await HttpService.post(API_ROUTES.TASKS.UPLOAD_TEMPLATE_ATTACHMENT.replace('{id}', task.id), { file_uri: results[0]?.fileUri })
                    toast.success('Plantilla cargada')
                    refresh()
                    onChanged()
                } catch (error) {
                    toast.error(errorText(error, 'No se pudo cargar la plantilla en Nexrender'))
                } finally {
                    setSaving(false)
                }
            },
        })
    }

    const setType = async (template: ITaskFile, type: TemplateAssetType) => {
        queryClient.setQueryData<ITaskFile[]>(key, current => (current ?? []).map(item => item.id === template.id ? { ...item, template_asset_type: type } : item))
        try {
            await HttpService.patch(API_ROUTES.TASKS.UPDATE_TASK_ATTACHMENT.replace('{id}', task.id).replace('{attachmentId}', template.id), { template_asset_type: type })
        } catch (error) {
            refresh()
            toast.error(errorText(error, 'No se pudo guardar'))
        }
    }

    const remove = async (template: ITaskFile) => {
        try {
            await TasksService.deleteTaskFile(task.id, template.id)
            queryClient.setQueryData<ITaskFile[]>(key, current => (current ?? []).filter(item => item.id !== template.id))
            toast.success('Plantilla borrada')
            onChanged()
        } catch (error) {
            toast.error(errorText(error, 'No se pudo borrar la plantilla'))
        }
    }

    return (
        <section className="ficha-card">
            <div className="ficha-card__head">
                <button type="button" className="flex min-w-0 cursor-pointer items-center gap-2 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
                    <ChevronDownIcon className={cn('size-4 shrink-0 text-muted-foreground transition-transform', !open && '-rotate-90')} />
                    <h3 className="ficha-h">Plantillas de Nexrender</h3>
                    <span className="ficha-count">{loading && !response ? '…' : templates.length}</span>
                </button>
                <button type="button" className="ficha-btn sm ml-auto" disabled={busy} onClick={() => input.current?.click()}>
                    {busy ? <Loader2Icon className="size-4 animate-spin" /> : <UploadIcon className="size-4" />}{busy ? 'Cargando…' : 'Cargar .zip'}
                </button>
                <input ref={input} type="file" accept=".zip" hidden onChange={event => { upload(event.target.files?.[0]); event.target.value = '' }} />
            </div>

            {open && (templates.length ? (
                <ul className="grid gap-2">
                    {templates.map(template => (
                        <li key={template.id} className="ficha-template">
                            <FileArchiveIcon className="size-5 shrink-0 text-muted-foreground" />
                            <span className="min-w-0 flex-1">
                                <b className="block truncate text-[13px]">{template.file.name}</b>
                                <span className="ficha-sub">#{(template.file.sort ?? 0) + 1} · {whenOf(template.created_at)}</span>
                            </span>
                            <span className="ficha-seg" role="radiogroup" aria-label="Qué arma">
                                {(['image', 'video'] as const).map(type => (
                                    <button key={type} type="button" role="radio" aria-checked={template.template_asset_type === type} className={cn(template.template_asset_type === type && 'on')} onClick={() => setType(template, type)}>
                                        {type === 'image' ? 'Imagen' : 'Video'}
                                    </button>
                                ))}
                            </span>
                            <button type="button" className="ficha-iconbtn plain danger" onClick={() => setToDelete(template)} title="Borrar plantilla"><Trash2Icon className="size-3.5" /></button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="ficha-sub">Sin plantillas. Carga un .zip por cada diseño que se personaliza.</p>
            ))}

            <SheetConfirm
                open={Boolean(toDelete)}
                title="¿Borrar esta plantilla?"
                lines={[`Se borra «${toDelete?.file.name ?? ''}» del pedido. No se puede deshacer.`]}
                confirm="Borrar"
                danger
                onConfirm={() => toDelete && remove(toDelete)}
                onClose={() => setToDelete(null)}
            />
        </section>
    )
}

export default SheetNexrender
