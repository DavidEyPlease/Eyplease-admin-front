import { useEffect, useState } from "react"
import { TriangleAlertIcon, Trash2Icon } from "lucide-react"

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/uishadcn/ui/alert-dialog"
import { Button } from "@/uishadcn/ui/button"
import Spinner from "@/components/common/Spinner"
import { cn } from "@/lib/utils"
import { ClientStatus, useReportDeletion } from "../useReports"

/**
 * Borrar los reportes cargados de una clienta.
 *
 * Dos pasos: primero se pide al servidor QUÉ se llevaría por delante y se
 * enseña, y solo entonces se deja borrar. No hay deshacer: la única vuelta
 * atrás es volver a cargar el archivo.
 */

interface Props {
    client: ClientStatus | null
    period: string
    onClose: () => void
}

/** La base repite nombres ("Cumpleaños" es de unidad y nacional): se distinguen. */
function nombreSeccion(sectionKey: string | null, name: string | null): string {
    const base = name ?? sectionKey ?? "Sin nombre"
    return sectionKey?.startsWith("national_") ? `${base} · Nacional` : base
}

const DeleteReportDialog = ({ client, period, onClose }: Props) => {
    const { preview, setPreview, loadPreview, confirmDelete, busy } = useReportDeletion()
    const [sectionKey, setSectionKey] = useState<string>("")
    /** Lo que esta clienta tiene cargado ese mes. Se fija al abrir y no cambia
     *  al elegir una sección, que es cuando el preview pasa a traer solo esa. */
    const [opciones, setOpciones] = useState<{ key: string; label: string; rows: number }[]>([])

    useEffect(() => {
        if (!client) {
            setPreview(null)
            setSectionKey("")
            setOpciones([])
            return
        }

        let vivo = true
        void loadPreview(client.id, period, null).then((data) => {
            if (!vivo || !data) return
            setOpciones(
                data.sections
                    .filter((s) => s.section_key)
                    .map((s) => ({
                        key: s.section_key as string,
                        label: nombreSeccion(s.section_key, s.name),
                        rows: s.rows,
                    }))
            )
        })
        return () => {
            vivo = false
        }
    }, [client, period, loadPreview, setPreview])

    // Al cambiar de sección solo se recalcula el preview; las opciones se quedan.
    useEffect(() => {
        if (!client) return
        void loadPreview(client.id, period, sectionKey || null)
    }, [sectionKey, client, period, loadPreview])

    if (!client) return null

    // Booleano de verdad: preview puede ser null y eso rompía el disabled.
    const nada = preview !== null && preview.uploads === 0

    const borrar = async () => {
        const ok = await confirmDelete(client.id, period, sectionKey || null)
        if (ok) onClose()
    }

    return (
        <AlertDialog open onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300">
                            <Trash2Icon className="size-4" />
                        </span>
                        Eliminar reportes de {client.name}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="grid gap-3 pt-1">
                            <p className="text-sm text-muted-foreground">
                                {client.account} · periodo <strong className="text-foreground">{period}</strong>
                            </p>

                            <label className="grid gap-1 text-left">
                                <span className="text-xs font-medium text-muted-foreground">Qué borrar</span>
                                <select
                                    value={sectionKey}
                                    onChange={(e) => setSectionKey(e.target.value)}
                                    className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground"
                                >
                                    <option value="">
                                        Todo el mes ({opciones.length}{" "}
                                        {opciones.length === 1 ? "sección" : "secciones"})
                                    </option>
                                    {opciones.map((o) => (
                                        <option key={o.key} value={o.key}>
                                            Solo «{o.label}» ({o.rows} filas)
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                                {busy && !preview ? (
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        <Spinner /> Calculando…
                                    </span>
                                ) : nada ? (
                                    <span className="text-muted-foreground">
                                        No hay reportes cargados con esos datos.
                                    </span>
                                ) : preview ? (
                                    <>
                                        <p className="text-foreground">
                                            Se borrarán{" "}
                                            <strong>
                                                {preview.uploads} {preview.uploads === 1 ? "carga" : "cargas"}
                                            </strong>{" "}
                                            y <strong>{preview.rows.toLocaleString("es-MX")} filas</strong> de datos.
                                        </p>
                                        {preview.sections.length > 0 && (
                                            <ul className="mt-2 grid max-h-32 gap-0.5 overflow-y-auto text-xs text-muted-foreground">
                                                {preview.sections.map((s, i) => (
                                                    <li key={`${s.section_key}-${i}`} className="flex justify-between gap-3">
                                                        <span className="truncate">{nombreSeccion(s.section_key, s.name)}</span>
                                                        <span className="shrink-0 tabular-nums">{s.rows} filas</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : null}
                            </div>

                            <p className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                                <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                                No se puede deshacer. Para recuperarlo hay que volver a cargar el archivo.
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={busy}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={borrar}
                        disabled={busy || !preview || nada}
                        className={cn("bg-red-600 text-white hover:bg-red-700")}
                    >
                        {busy ? <Spinner /> : "Eliminar"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteReportDialog
