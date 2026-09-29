import { useEffect } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, ExternalLinkIcon, FileIcon, XIcon } from 'lucide-react'

import Spinner from '@/components/common/Spinner'
import { ITaskFile } from '@/interfaces/tasks'
import { cn } from '@/lib/utils'
import { isImage, isVideo } from '@/utils'
import { whenOf } from './lib'

interface DesignViewerProps {
    files: ITaskFile[]
    index: number
    downloading: string
    onIndex: (index: number) => void
    onDownload: (file: ITaskFile) => void
    onClose: () => void
}

/**
 * Los diseños en grande, uno tras otro: flechas (o ← →) para pasar, la tira de abajo para saltar y el
 * botón para bajarlo. Es donde se revisa una entrega completa sin abrir cada archivo por separado.
 */
const DesignViewer = ({ files, index, downloading, onIndex, onDownload, onClose }: DesignViewerProps) => {
    const file = files[index]
    const count = files.length
    const go = (step: number) => onIndex((index + step + count) % count)

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (count < 2) return
            if (event.key === 'ArrowRight') go(1)
            if (event.key === 'ArrowLeft') go(-1)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    })

    if (!file) return null
    const ext = file.file.ext ?? ''

    return (
        <DialogPrimitive.Root open onOpenChange={open => !open && onClose()}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="ficha-viewer-overlay" />
                <DialogPrimitive.Content className="ficha-viewer" aria-describedby={undefined}>
                    <header className="ficha-viewer__bar">
                        <div className="min-w-0">
                            <DialogPrimitive.Title className="truncate text-[14px] font-bold">{file.file.name}</DialogPrimitive.Title>
                            <p className="truncate text-[12px] text-white/60">
                                {count > 1 && <>{index + 1} de {count} · </>}
                                {file.uploaded_by?.name ? `Lo subió ${file.uploaded_by.name} · ` : ''}{whenOf(file.created_at)}
                            </p>
                        </div>
                        <div className="ml-auto flex shrink-0 items-center gap-1.5">
                            <button type="button" className="ficha-viewer__btn" onClick={() => onDownload(file)} title="Descargar">
                                {downloading === file.id ? <Spinner size="xs" /> : <DownloadIcon className="size-4" />}<span className="hidden sm:inline">Descargar</span>
                            </button>
                            <a href={file.file.url} target="_blank" rel="noreferrer" className="ficha-viewer__btn" title="Abrir en otra pestaña"><ExternalLinkIcon className="size-4" /></a>
                            <DialogPrimitive.Close className="ficha-viewer__btn" aria-label="Cerrar"><XIcon className="size-4" /></DialogPrimitive.Close>
                        </div>
                    </header>

                    <div className="ficha-viewer__stage">
                        {count > 1 && <button type="button" className="ficha-viewer__nav left" onClick={() => go(-1)} aria-label="Anterior"><ChevronLeftIcon className="size-6" /></button>}
                        {isImage(ext) ? (
                            <img key={file.id} src={file.file.url} alt={file.file.name} />
                        ) : isVideo(ext) ? (
                            <video key={file.id} src={file.file.url} controls autoPlay playsInline />
                        ) : (
                            <div className="grid place-items-center gap-3 text-center text-white/80">
                                <FileIcon className="size-14" />
                                <p className="text-[13px]">Este archivo ({ext.toUpperCase() || 'sin extensión'}) no se puede ver aquí.</p>
                                <button type="button" className="ficha-viewer__btn" onClick={() => onDownload(file)}><DownloadIcon className="size-4" />Descargar</button>
                            </div>
                        )}
                        {count > 1 && <button type="button" className="ficha-viewer__nav right" onClick={() => go(1)} aria-label="Siguiente"><ChevronRightIcon className="size-6" /></button>}
                    </div>

                    {count > 1 && (
                        <div className="ficha-viewer__strip">
                            {files.map((item, position) => (
                                <button key={item.id} type="button" onClick={() => onIndex(position)} className={cn(position === index && 'on')} aria-label={`Ver ${item.file.name}`}>
                                    {isImage(item.file.ext ?? '') ? <img src={item.file.url} alt="" /> : isVideo(item.file.ext ?? '') ? <video src={`${item.file.url}#t=1`} muted preload="metadata" /> : <span>{(item.file.ext ?? '').toUpperCase()}</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}

export default DesignViewer
