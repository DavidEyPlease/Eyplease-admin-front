import { useEffect, useState } from "react"
import { DownloadIcon, FileTextIcon, TriangleAlertIcon } from "lucide-react"

import HttpService from "@/services/http"
import Spinner from "@/components/common/Spinner"
import { WaMedia } from "@/interfaces/whatsapp"

/**
 * Adjunto de una conversación (imagen, video, nota de voz o documento).
 *
 * El archivo vive en el bot y la API lo sirve tras comprobar la sesión, así que
 * hay que pedirlo con el token. Un <img src> o <video src> NO puede mandar
 * cabeceras, y meter el token en la URL lo dejaría escrito en logs e historial
 * — por eso se descarga con el cliente autenticado y se pinta desde un blob.
 */

/** "/admin/media/<archivo>" -> "<archivo>". */
function fileNameFrom(url: string): string | null {
    const name = url.split("/").filter(Boolean).pop()
    return name && /^[\w.-]+$/.test(name) ? name : null
}

interface Props {
    media: WaMedia
    mine: boolean
    /** Avisa al hilo: el adjunto cambia el alto y hay que rebajar el scroll. */
    onLoaded?: () => void
}

const MediaBubble = ({ media, mine, onLoaded }: Props) => {
    const [src, setSrc] = useState<string | null>(null)
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        const file = fileNameFrom(media.url)
        if (!file) {
            setFailed(true)
            return
        }

        let objectUrl: string | null = null
        let cancelled = false

        HttpService.get<Blob>(`/whatsapp/media/${file}`, { responseType: "blob" })
            .then((blob) => {
                if (cancelled) return
                objectUrl = URL.createObjectURL(blob)
                setSrc(objectUrl)
                onLoaded?.()
            })
            .catch(() => !cancelled && setFailed(true))

        return () => {
            cancelled = true
            // Sin esto el blob se queda en memoria mientras viva la pestaña.
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
        // onLoaded es estable (useCallback en el hilo).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [media.url])

    if (failed) {
        return (
            <span className="flex items-center gap-1.5 text-xs opacity-80">
                <TriangleAlertIcon className="size-3.5" />
                No se pudo cargar el archivo
            </span>
        )
    }

    if (!src) {
        return (
            <span className="flex items-center gap-2 py-2 text-xs opacity-80">
                <Spinner /> Cargando archivo…
            </span>
        )
    }

    if (media.kind === "image") {
        return (
            <a href={src} target="_blank" rel="noreferrer" title="Abrir en grande">
                <img
                    src={src}
                    alt={media.filename || "Imagen que envió la clienta"}
                    onLoad={onLoaded}
                    className="max-h-72 w-auto max-w-full rounded-lg"
                />
            </a>
        )
    }

    if (media.kind === "video") {
        return <video src={src} controls preload="metadata" className="max-h-72 w-full max-w-sm rounded-lg" />
    }

    if (media.kind === "audio") {
        return <audio src={src} controls preload="metadata" className="w-full min-w-[15rem] max-w-xs" />
    }

    // Documentos (PDF y demás): no se previsualizan, se abren aparte.
    return (
        <a
            href={src}
            target="_blank"
            rel="noreferrer"
            download={media.filename || undefined}
            className={
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium underline-offset-2 hover:underline " +
                (mine ? "bg-white/15" : "bg-white")
            }
        >
            <FileTextIcon className="size-4 shrink-0" />
            <span className="truncate">{media.filename || "Abrir documento"}</span>
            <DownloadIcon className="size-3.5 shrink-0 opacity-70" />
        </a>
    )
}

export default MediaBubble
