import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { CopyIcon, DownloadIcon, ExpandIcon, FileIcon, ImagePlusIcon, Loader2Icon, Trash2Icon, UploadCloudIcon } from 'lucide-react'
import { toast } from 'sonner'

import Spinner from '@/components/common/Spinner'
import { API_ROUTES } from '@/constants/api'
import useFiles from '@/hooks/useFiles'
import { ApiResponse } from '@/interfaces/common'
import { ITask, ITaskFile, TaskStatusTypes, TaskTypes } from '@/interfaces/tasks'
import { cn } from '@/lib/utils'
import HttpService from '@/services/http'
import { TasksService } from '@/services/tasks.service'
import useUploadStore from '@/store/uploadStore'
import { isImage, isVideo } from '@/utils'
import DesignViewer from './DesignViewer'
import SheetConfirm from './SheetConfirm'
import { clientOf, firstName, whenOf } from './lib'
import useSheetFiles from './useSheetFiles'
import { errorText, sheetKeys } from './useTaskSheet'

interface TileProps {
    file: ITaskFile
    position?: number
    jsonUrl?: string | null
    downloading: boolean
    onOpen: () => void
    onDownload: () => void
    onDelete: () => void
}

/** Un archivo de la entrega: la pieza en grande, su número en el orden y, al pasar el ratón, lo que se le hace */
const Tile = ({ file, position, jsonUrl, downloading, onOpen, onDownload, onDelete }: TileProps) => {
    const ext = file.file.ext ?? ''
    const copy = () => navigator.clipboard.writeText(jsonUrl ?? '').then(() => toast.success('URL del JSON copiada'), () => toast.error('No se pudo copiar'))

    return (
        <figure className="ficha-tile" data-id={file.id}>
            <div className="ficha-tile__img" onClick={onOpen} role="button" tabIndex={0} onKeyDown={event => event.key === 'Enter' && onOpen()} aria-label={`Ver ${file.file.name}`}>
                {isImage(ext) ? <img src={file.file.url} alt="" loading="lazy" draggable={false} />
                    : isVideo(ext) ? <video src={`${file.file.url}#t=1`} muted playsInline preload="metadata" />
                        : <span className="ficha-tile__file"><FileIcon className="size-7" />{ext.toUpperCase() || 'ARCHIVO'}</span>}
                {position !== undefined && <span className="ficha-tile__num">{position}</span>}
                <span className="ficha-tile__acts" onClick={event => event.stopPropagation()}>
                    <button type="button" className="ficha-iconbtn" onClick={onOpen} title="Ver en grande"><ExpandIcon className="size-3.5" /></button>
                    <button type="button" className="ficha-iconbtn" onClick={onDownload} title="Descargar">{downloading ? <Spinner size="xs" color="primary" /> : <DownloadIcon className="size-3.5" />}</button>
                    {jsonUrl && <button type="button" className="ficha-iconbtn" onClick={copy} title="Copiar la URL del JSON (personalización)"><CopyIcon className="size-3.5" /></button>}
                    <button type="button" className="ficha-iconbtn danger" onClick={onDelete} title="Borrar"><Trash2Icon className="size-3.5" /></button>
                </span>
            </div>
            <figcaption className="ficha-tile__cap">
                <b title={file.file.name}>{file.file.name}</b>
                {file.uploaded_by?.name ? `${firstName(file.uploaded_by.name)} · ` : ''}{whenOf(file.created_at)}
            </figcaption>
        </figure>
    )
}

interface SheetFilesProps {
    task: ITask
    onChanged: () => void
}

/**
 * Los diseños del pedido, en grande y en su orden (el orden es el de la entrega y, en Biblioteca, el de la
 * publicación: se cambia arrastrando). Se sube con el botón o soltando archivos encima. En un pedido de
 * clienta, lo que mandó ella va aparte: son insumos, no entregas.
 */
const SheetFiles = ({ task, onChanged }: SheetFilesProps) => {
    const queryClient = useQueryClient()
    const key = sheetKeys.files(task.id)
    const input = useRef<HTMLInputElement>(null)
    const [dropping, setDropping] = useState(false)
    const [viewer, setViewer] = useState<{ list: 'designs' | 'client', index: number } | null>(null)
    const [toDelete, setToDelete] = useState<ITaskFile | null>(null)
    const startUpload = useUploadStore(state => state.startUpload)
    const uploading = useUploadStore(state => state.uploads.some(item => item.status === 'uploading'))
    const { fileLoadingAction, downloadFile } = useFiles()

    const { designs, fromClient, loading } = useSheetFiles(task)
    const client = clientOf(task)

    /* Para el arrastre: su configuración se arma al cambiar la lista y así siempre compara contra la última */
    const designsRef = useRef(designs)
    designsRef.current = designs
    const setFiles = (update: (current: ITaskFile[]) => ITaskFile[]) => queryClient.setQueryData<ITaskFile[]>(key, current => update(Array.isArray(current) ? current : []))

    /* El orden se cambia arrastrando y se guarda como siempre (PUT /files/sort con los ids en orden) */
    const [gridRef, ordered, setOrdered] = useDragAndDrop<HTMLDivElement, ITaskFile>([], {
        draggable: child => child.classList.contains('ficha-tile'),
        onDragend: async ({ values }) => {
            const next = values as ITaskFile[]
            const before = designsRef.current
            if (next.map(file => file.id).join() === before.map(file => file.id).join()) return
            try {
                await HttpService.put(API_ROUTES.SORT_FILES, { file_ids: next.map(file => file.file.id) })
                setFiles(current => [...next.map((file, index) => ({ ...file, file: { ...file.file, sort: index } })), ...current.filter(file => !next.some(item => item.id === file.id))])
                toast.success('Orden guardado')
            } catch (error) {
                setOrdered(before)
                toast.error(errorText(error, 'No se pudo guardar el orden'))
            }
        },
    })
    useEffect(() => setOrdered(designs), [designs, setOrdered])

    const upload = (list: FileList | File[] | null) => {
        const chosen = Array.from(list ?? [])
        if (!chosen.length) return
        startUpload(chosen, {
            uploadUri: `private/tasks/${task.id}/attachments`,
            onAllSuccess: async results => {
                try {
                    /* La extensión, del nombre: la que da el navegador no siempre sirve (un .mov llega como
                       «quicktime» y un archivo sin tipo llega sin nada). Y con su tipo: la app de la clienta y la
                       publicación de Biblioteca sólo toman lo marcado como imagen. */
                    const fileUris = results.map(file => {
                        const extension = (file.name.includes('.') ? file.name.split('.').pop() : file.extension ?? '')?.toLowerCase() || 'bin'
                        return { ...file, extension, ...(isVideo(extension) ? { file_type: 'video' } : isImage(extension) ? { file_type: 'image' } : {}) }
                    })
                    const created = await HttpService.post<ApiResponse<ITaskFile[]>>(API_ROUTES.TASKS.STORE_ATTACHMENTS.replace('{id}', task.id), { file_uris: fileUris })
                    setFiles(current => [...current, ...(created?.data ?? [])])
                    toast.success(chosen.length === 1 ? 'Archivo subido' : `${chosen.length} archivos subidos`)
                    onChanged()
                } catch (error) {
                    toast.error(errorText(error, 'Se subieron los archivos pero no se pudieron agregar al pedido'))
                }
            },
        })
    }

    const remove = async (file: ITaskFile) => {
        try {
            await TasksService.deleteTaskFile(task.id, file.id)
            setFiles(current => current.filter(item => item.id !== file.id))
            toast.success('Archivo borrado')
            onChanged()
        } catch (error) {
            toast.error(errorText(error, 'No se pudo borrar el archivo'))
        }
    }

    /* La URL del JSON con la que se personaliza cada diseño, cuando ya está para publicarse (como antes) */
    const jsonUrlOf = (file: ITaskFile) => file.file_type === 'image' && (task.task_status?.slug === TaskStatusTypes.READY_FOR_PUBLISH || task.task_status?.slug === TaskStatusTypes.COMPLETED)
        ? `${import.meta.env.VITE_API_BASE}/data-sources/tools/${task.id}?sort=${file.file.sort}` : null

    const published = task.task_type?.slug === TaskTypes.TOOLS && task.task_status?.slug === TaskStatusTypes.PUBLISHED
    const viewerFiles = viewer?.list === 'client' ? fromClient : ordered

    const onDrop = (event: React.DragEvent) => {
        if (!event.dataTransfer.types.includes('Files')) return
        event.preventDefault()
        setDropping(false)
        upload(event.dataTransfer.files)
    }

    return (
        <>
            <section
                className={cn('ficha-card relative', dropping && 'dropping')}
                onDragOver={event => { if (event.dataTransfer.types.includes('Files')) { event.preventDefault(); setDropping(true) } }}
                onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropping(false) }}
                onDrop={onDrop}
            >
                <div className="ficha-card__head">
                    <h3 className="ficha-h">Diseños</h3>
                    <span className="ficha-count">{designs.length}</span>
                    {designs.length > 1 && <span className="ficha-sub hidden sm:inline">Arrastra para cambiar el orden</span>}
                    <button type="button" className="ficha-btn sm ml-auto" onClick={() => input.current?.click()}>
                        {uploading ? <Loader2Icon className="size-4 animate-spin" /> : <ImagePlusIcon className="size-4" />}
                        {uploading ? 'Subiendo…' : 'Subir'}
                    </button>
                    <input ref={input} type="file" multiple hidden onChange={event => { upload(event.target.files); event.target.value = '' }} />
                </div>

                {loading ? (
                    <div className="ficha-grid">{Array.from({ length: 3 }, (_, index) => <span key={index} className="aspect-[4/5] animate-pulse rounded-2xl bg-foreground/[.06]" />)}</div>
                ) : (
                    <>
                        <div ref={gridRef} className={cn('ficha-grid', !ordered.length && 'hidden')}>
                            {ordered.map((file, index) => (
                                <Tile
                                    key={file.id}
                                    file={file}
                                    position={ordered.length > 1 ? index + 1 : undefined}
                                    jsonUrl={jsonUrlOf(file)}
                                    downloading={fileLoadingAction === file.id}
                                    onOpen={() => setViewer({ list: 'designs', index })}
                                    onDownload={() => downloadFile(file.id, file.file.uri)}
                                    onDelete={() => setToDelete(file)}
                                />
                            ))}
                        </div>
                        {!ordered.length && (
                            <button type="button" className="ficha-drop" onClick={() => input.current?.click()}>
                                <UploadCloudIcon className="size-7 text-[#6C47FF]" />
                                <b className="text-[13.5px] text-foreground">Arrastra aquí los diseños o elígelos</b>
                                <span>{client ? `Cuando estén, pásalo a «Por revisar» y a ${firstName(client.name)} le llega el aviso.` : 'Imágenes, videos o cualquier archivo del pedido.'}</span>
                            </button>
                        )}
                    </>
                )}

                {dropping && <div className="ficha-dropmask"><UploadCloudIcon className="size-8" />Suelta para subir</div>}
            </section>

            {fromClient.length > 0 && (
                <section className="ficha-card">
                    <div className="ficha-card__head">
                        <h3 className="ficha-h">Lo que mandó {client ? firstName(client.name) : 'la clienta'}</h3>
                        <span className="ficha-count">{fromClient.length}</span>
                        <span className="ficha-sub">Fotos y referencias para hacerlo</span>
                    </div>
                    <div className="ficha-grid small">
                        {fromClient.map((file, index) => (
                            <Tile
                                key={file.id}
                                file={file}
                                downloading={fileLoadingAction === file.id}
                                onOpen={() => setViewer({ list: 'client', index })}
                                onDownload={() => downloadFile(file.id, file.file.uri)}
                                onDelete={() => setToDelete(file)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {viewer && viewerFiles[viewer.index] && (
                <DesignViewer
                    files={viewerFiles}
                    index={viewer.index}
                    downloading={fileLoadingAction}
                    onIndex={index => setViewer({ ...viewer, index })}
                    onDownload={file => downloadFile(file.id, file.file.uri)}
                    onClose={() => setViewer(null)}
                />
            )}

            <SheetConfirm
                open={Boolean(toDelete)}
                title={`¿Borrar «${toDelete?.file.name ?? ''}»?`}
                lines={[
                    'Se borra el archivo del pedido y de donde está guardado. No se puede deshacer.',
                    ...(published ? ['Este pedido ya está publicado: también se quita de la biblioteca de todas las clientas.'] : []),
                ]}
                confirm="Borrar"
                danger
                onConfirm={() => toDelete && remove(toDelete)}
                onClose={() => setToDelete(null)}
            />
        </>
    )
}

export default SheetFiles
