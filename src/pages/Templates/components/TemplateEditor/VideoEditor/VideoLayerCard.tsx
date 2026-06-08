import { ImageIcon, TypeIcon } from "lucide-react"

import { Badge } from "@/uishadcn/ui/badge"
import { Card, CardContent } from "@/uishadcn/ui/card"
import { Separator } from "@/uishadcn/ui/separator"
import {
    EyrenderImageLayer,
    EyrenderLayer,
    EyrenderTextLayer,
} from "@/interfaces/templates"
import { cn } from "@/lib/utils"

interface VideoLayerCardProps {
    layer: EyrenderLayer
    index: number
}

const isTextLayer = (layer: EyrenderLayer): layer is EyrenderTextLayer => layer.type === "text"
const isImageLayer = (layer: EyrenderLayer): layer is EyrenderImageLayer => layer.type === "image"

interface RowProps {
    label: string
    value: string | number | null | undefined
    mono?: boolean
}

const Row = ({ label, value, mono }: RowProps) => {
    if (value === null || value === undefined || value === "") return null
    return (
        <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground min-w-[78px]">{label}</span>
            <span className={cn("text-foreground break-all", mono && "font-mono")}>{String(value)}</span>
        </div>
    )
}

const formatRange = (from: number | undefined, to: number | undefined) => {
    if (from === undefined && to === undefined) return ""
    return `${from ?? "?"} → ${to ?? "?"}`
}

const ImageProperties = ({ layer }: { layer: EyrenderImageLayer }) => (
    <div className="flex flex-col gap-1">
        <Row label="src" value={layer.src} mono />
        <Row label="fit" value={layer.fit} />
        <Row label="clipShape" value={layer.clipShape} />
        <Row label="borderRadius" value={layer.borderRadius} />
        {layer.border && (
            <Row
                label="border"
                value={`${layer.border.width}px ${layer.border.style ?? "solid"} ${layer.border.color}`}
            />
        )}
        {layer.shadow && (
            <Row
                label="shadow"
                value={`${layer.shadow.offsetX}/${layer.shadow.offsetY} blur ${layer.shadow.blur} ${layer.shadow.color}`}
            />
        )}
    </div>
)

const TextProperties = ({ layer }: { layer: EyrenderTextLayer }) => (
    <div className="flex flex-col gap-1">
        <Row label="text" value={layer.text} mono />
        <Row label="fuente" value={`${layer.fontFamily} ${layer.fontWeight ?? 400}`} />
        <Row label="fontSize" value={layer.fontSize ? `${layer.fontSize}px` : undefined} />
        <Row label="color" value={layer.color} mono />
        <Row label="align" value={layer.align} />
        <Row label="fontStyle" value={layer.fontStyle} />
        <Row label="lineHeight" value={layer.lineHeight} />
        <Row label="letterSpacing" value={layer.letterSpacing} />
        <Row label="maxWidth" value={layer.maxWidth} />
        <Row label="flow_below" value={layer.flow_below} />
        <Row label="flow_gap" value={layer.flow_gap} />
        {layer.auto_fit && <Row label="auto_fit" value={`min ${layer.min_size ?? "?"}px`} />}
    </div>
)

const dimensions = (layer: EyrenderLayer): string => {
    const width = layer.width ?? "auto"
    const height = layer.height ?? "auto"
    return `${width} × ${height}`
}

const VideoLayerCard = ({ layer, index }: VideoLayerCardProps) => {
    const Icon = isTextLayer(layer) ? TypeIcon : ImageIcon
    const typeLabel = isTextLayer(layer) ? "Texto" : "Imagen"
    const title = layer.id ?? layer.data_key ?? `Capa ${index + 1}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const animations: any[] = ((layer as any).animations ?? (layer as any).animation
        ? Array.isArray((layer as any).animations) ? (layer as any).animations : []
        : [])

    return (
        <Card className="overflow-hidden gap-0 py-0">
            <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="secondary" className="gap-1 text-xs font-medium shrink-0">
                            <Icon className="w-3 h-3" />
                            {typeLabel}
                        </Badge>
                        <span className="text-sm font-semibold truncate">{title}</span>
                    </div>
                    {typeof layer.zIndex === "number" && (
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">z {layer.zIndex}</span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <Row label="data_key" value={layer.data_key} mono />
                    <Row label="posición" value={`${layer.x}, ${layer.y}`} />
                    <Row label="tamaño" value={dimensions(layer)} />
                    {typeof layer.rotation === "number" && layer.rotation !== 0 && (
                        <Row label="rotación" value={`${layer.rotation}°`} />
                    )}
                    {typeof layer.opacity === "number" && layer.opacity !== 1 && (
                        <Row label="opacidad" value={layer.opacity} />
                    )}
                </div>

                <Separator />

                {isImageLayer(layer) ? <ImageProperties layer={layer} /> : <TextProperties layer={layer as EyrenderTextLayer} />}

                {animations.length > 0 && (
                    <>
                        <Separator />
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                Animaciones
                            </span>
                            {animations.map((animation, idx) => {
                                const direction = animation.direction ? ` ${animation.direction}` : ""
                                const range = formatRange(animation.from, animation.to)
                                return (
                                    <div key={idx} className="text-xs flex gap-2">
                                        <span className="font-mono text-primary">
                                            {animation.type}{direction}
                                        </span>
                                        <span className="text-muted-foreground">{range}</span>
                                        {animation.easing && (
                                            <span className="text-muted-foreground">· {animation.easing}</span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default VideoLayerCard
