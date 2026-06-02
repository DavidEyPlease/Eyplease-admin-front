import { Trash2Icon } from "lucide-react"

import Button from "@/components/common/Button"
import Dropdown from "@/components/common/Inputs/Dropdown"
import { Input } from "@/uishadcn/ui/input"
import { Label } from "@/uishadcn/ui/label"
import { Separator } from "@/uishadcn/ui/separator"
import { EyrenderLayer } from "@/interfaces/templates"

import {
    FONT_OPTIONS,
    FONT_STYLE_OPTIONS,
    FONT_WEIGHT_OPTIONS,
    TEXT_ALIGN_OPTIONS,
} from "./constants"

interface IProps {
    layer: Extract<EyrenderLayer, { type: "text" }>
    onChange: (patch: Partial<EyrenderLayer>) => void
    onDelete: () => void
}

/**
 * Property editor for a selected text layer. The Dropdowns are uncontrolled
 * (the shared Dropdown component uses `defaultValue`), so the parent remounts
 * this panel via `key` whenever the selected layer changes.
 */
const SelectedTextPanel = ({ layer, onChange, onDelete }: IProps) => (
    <>
        <div className="space-y-1">
            <Label className="text-xs">Texto / placeholder</Label>
            <Input value={layer.text} onChange={(e) => onChange({ text: e.target.value })} />
            <p className="text-[10px] text-muted-foreground">Usa {`{{sponsored.name}}`}, {`{{client.name}}`}, etc.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
                <Label className="text-xs">Tamaño</Label>
                <Input type="number" value={layer.fontSize} onChange={(e) => onChange({ fontSize: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">Color</Label>
                <Input type="color" value={layer.color} onChange={(e) => onChange({ color: e.target.value })} />
            </div>
        </div>
        <Dropdown
            label="Fuente"
            placeholder="Selecciona una fuente"
            value={layer.fontFamily}
            items={FONT_OPTIONS}
            onChange={(v) => onChange({ fontFamily: v })}
        />
        <div className="grid grid-cols-2 gap-2">
            <Dropdown
                label="Peso"
                placeholder="Peso"
                value={String(layer.fontWeight ?? 400)}
                items={FONT_WEIGHT_OPTIONS}
                onChange={(v) => onChange({ fontWeight: Number(v) })}
            />
            <Dropdown
                label="Estilo"
                placeholder="Estilo"
                value={layer.fontStyle ?? "normal"}
                items={FONT_STYLE_OPTIONS}
                onChange={(v) => onChange({ fontStyle: v as "normal" | "italic" })}
            />
        </div>
        <Dropdown
            label="Alineación"
            placeholder="Alineación"
            value={layer.align ?? "left"}
            items={TEXT_ALIGN_OPTIONS}
            onChange={(v) => onChange({ align: v as "left" | "center" | "right" })}
        />
        <Separator />
        <Button color="danger" size="sm" text={<><Trash2Icon className="w-3.5 h-3.5 mr-1" />Eliminar capa</>} onClick={onDelete} />
    </>
)

export default SelectedTextPanel
