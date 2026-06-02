import { Trash2Icon } from "lucide-react"

import Button from "@/components/common/Button"
import Dropdown from "@/components/common/Inputs/Dropdown"
import { Input } from "@/uishadcn/ui/input"
import { Label } from "@/uishadcn/ui/label"
import { Separator } from "@/uishadcn/ui/separator"
import { Slider } from "@/uishadcn/ui/slider"
import { EyrenderLayer } from "@/interfaces/templates"

import { CLIP_SHAPE_OPTIONS, IMAGE_FIT_OPTIONS } from "./constants"

interface IProps {
    layer: Extract<EyrenderLayer, { type: "image" }>
    onChange: (patch: Partial<EyrenderLayer>) => void
    onDelete: () => void
}

const MAX_BORDER_RADIUS = 200

/**
 * Property editor for a selected image layer. The corner-radius Slider only
 * appears for the "rounded" clip shape, where the value is meaningful.
 */
const SelectedImagePanel = ({ layer, onChange, onDelete }: IProps) => (
    <>
        <div className="space-y-1">
            <Label className="text-xs">Placeholder (src)</Label>
            <Input value={layer.src} onChange={(e) => onChange({ src: e.target.value })} />
            <p className="text-[10px] text-muted-foreground">{`Ej. {{sponsored.photo_url}}, {{client.logo_url}}, {{badge.url}}`}</p>
        </div>
        <Dropdown
            label="Forma"
            placeholder="Forma"
            value={layer.clipShape ?? "none"}
            items={CLIP_SHAPE_OPTIONS}
            onChange={(v) => onChange({ clipShape: v as "none" | "circle" | "rounded" })}
        />
        {layer.clipShape === "rounded" && (
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <Label className="text-xs">Radio de esquinas</Label>
                    <span className="text-xs text-muted-foreground">{layer.borderRadius ?? 0}px</span>
                </div>
                <Slider
                    min={0}
                    max={MAX_BORDER_RADIUS}
                    step={1}
                    value={[layer.borderRadius ?? 0]}
                    onValueChange={([value]) => onChange({ borderRadius: value })}
                />
            </div>
        )}
        <Dropdown
            label="Ajuste"
            placeholder="Ajuste"
            value={layer.fit ?? "cover"}
            items={IMAGE_FIT_OPTIONS}
            onChange={(v) => onChange({ fit: v as "cover" | "contain" | "fill" })}
        />
        <Separator />
        <Button color="danger" size="sm" text={<><Trash2Icon className="w-3.5 h-3.5 mr-1" />Eliminar capa</>} onClick={onDelete} />
    </>
)

export default SelectedImagePanel
