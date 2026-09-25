import { SparklesIcon } from "lucide-react"

import FieldValue from "@/components/generics/FieldValue"
import { ITask } from "@/interfaces/tasks"

const AUDIENCE: Record<string, string> = {
    clientas: 'Sus clientas',
    unidad: 'Su unidad',
    prospectas: 'Prospectas',
}

/**
 * Lo que pidió la Directora en un «Reel con mi clon». Sólo lectura: el pedido lo fabrica la Mac
 * (Codex escribe guion e imágenes, la estación anima el clon y pone su voz) y lo entrega en MP4.
 */
const CloneReelInfo = ({ task }: { task: ITask }) => {
    const meta = task.metadata

    return (
        <div className="space-y-3 rounded-lg border p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
                <SparklesIcon className="size-4 text-primary" />
                Reel con mi clon
            </p>
            <div className="grid gap-3 md:grid-cols-2">
                <FieldValue label="Tema" value={meta.topic || '—'} flexDirection="col" className="items-start" />
                <FieldValue label="Producto" value={meta.product || 'Sin producto'} flexDirection="col" className="items-start" />
                <FieldValue label="Para" value={AUDIENCE[meta.audience || ''] || 'Sus clientas'} flexDirection="col" className="items-start" />
                <FieldValue label="Versiones" value={String(meta.variants || 1)} flexDirection="col" className="items-start" />
            </div>
            <FieldValue label="Guion" flexDirection="col" className="items-start">
                <p className="whitespace-pre-line text-foreground">{meta.script || 'Lo escribe Astra a partir del tema.'}</p>
            </FieldValue>
            <p className="text-xs text-muted-foreground">
                Lo produce la Mac: guion e imágenes con Codex, clon animado con sus gestos y su voz. Los reels llegan aquí en MP4.
            </p>
        </div>
    )
}

export default CloneReelInfo
