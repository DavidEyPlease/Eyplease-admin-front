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
    /** Secciones del periodo, para poder borrar solo una. */
    sections: { section_key: string; name: string }[]
    onClose: () => void
}

const DeleteReportDialog = ({ client, period, sections, onClose }: Props) => {
    const { preview, setPreview, loadPreview, confirmDelete, busy } = useReportDeletion()
    const [sectionKey, setSectionKey] = useState<string>("")

    useEffect(() => {
        if (!client) {
            setPreview(null)
            setSectionKey("")
            return
        }
        void loadPreview(client.id, period, sectionKey || null)
    }, [client, period, sectionKey, loadPreview, setPreview])

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
                                    <option value="">Todo el mes (todas las secciones)</option>
                                    {sections.map((s) => (
                                        <option key={s.section_key} value={s.section_key}>
                                            Solo «{s.name}»
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
                                                        <span className="truncate">{s.name ?? s.section_key}</span>
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
