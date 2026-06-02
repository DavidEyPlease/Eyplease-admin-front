import Dropdown from "@/components/common/Inputs/Dropdown";
import { Button } from "@/uishadcn/ui/button";
import { Input } from "@/uishadcn/ui/input";
import { Checkbox } from "@/uishadcn/ui/checkbox";
import { Slider } from "@/uishadcn/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/uishadcn/ui/toggle-group";

import { Zone, PhotoZone, TextZone, Border, Shadow, RGB, RGBA } from "../layout-types";
import { ZonePatch, SHAPE_OPTIONS, FONT_OPTIONS, WEIGHT_OPTIONS } from "../layout-helpers";
import Field from "./Field";

interface PropPanelProps {
    z: Zone;
    update: (id: string, patch: ZonePatch) => void;
    updateNested: (id: string, key: "border" | "shadow", patch: Partial<Border> | Partial<Shadow>) => void;
    onDelete: () => void;
    logos: { name: string; url: string }[];
}

/**
 * Right-hand property editor for the selected zone. The Dropdowns are
 * uncontrolled (the shared Dropdown component uses `defaultValue`), so the
 * parent remounts this panel via `key={z.id}` when the selection changes.
 */
export default function PropPanel({ z, update, updateNested, onDelete, logos }: PropPanelProps) {
    const hex = (rgb: RGB | RGBA) => "#" + rgb.slice(0, 3).map((v) => v.toString(16).padStart(2, "0")).join("");
    const fromHex = (h: string): RGB => { const n = h.replace("#", ""); return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)]; };

    return (
        <div className="space-y-3">
            {z.type !== "logo" && (
                <Field label="data_key"><Input value={z.data_key} onChange={(e) => update(z.id, { data_key: e.target.value })} /></Field>
            )}

            <div className="grid grid-cols-2 gap-2">
                <Field label="X"><Input type="number" value={z.x} onChange={(e) => update(z.id, { x: +e.target.value })} /></Field>
                <Field label="Y"><Input type="number" value={z.y} onChange={(e) => update(z.id, { y: +e.target.value })} /></Field>
            </div>

            {z.type === "photo" && (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        <Field label="Ancho"><Input type="number" value={z.w} onChange={(e) => update(z.id, { w: +e.target.value })} /></Field>
                        <Field label="Alto"><Input type="number" value={z.h} onChange={(e) => update(z.id, { h: +e.target.value })} /></Field>
                    </div>
                    <Field label="Forma">
                        <Dropdown
                            placeholder="Forma"
                            value={z.shape}
                            items={SHAPE_OPTIONS}
                            onChange={(v) => { const patch: Partial<PhotoZone> = { shape: v as PhotoZone["shape"] }; if (v === "rounded_rect" && !z.radius) patch.radius = 36; update(z.id, patch); }}
                        />
                    </Field>
                    {z.shape === "rounded_rect" && (
                        <Field label={`Radio (${z.radius || 0})`}>
                            <Slider
                                min={0}
                                max={Math.floor(Math.min(z.w, z.h) / 2)}
                                step={1}
                                value={[z.radius || 0]}
                                onValueChange={([v]) => update(z.id, { radius: v })}
                            />
                        </Field>
                    )}
                    <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Checkbox checked={!!z.border} onCheckedChange={(c) => update(z.id, { border: c === true ? { color: [201, 167, 78], width: 6, double: true, gap: 7, inner_width: 2 } : undefined })} />
                        Borde dorado
                    </label>
                    {z.border && (
                        <div className="grid grid-cols-2 gap-2">
                            <Field label="Color"><input type="color" value={hex(z.border.color)} onChange={(e) => updateNested(z.id, "border", { color: fromHex(e.target.value) })} className="h-9 w-full rounded-md border bg-secondary" /></Field>
                            <Field label="Grosor"><Input type="number" value={z.border.width} onChange={(e) => updateNested(z.id, "border", { width: +e.target.value })} /></Field>
                        </div>
                    )}
                </>
            )}

            {z.type === "logo" && (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        <Field label="Ancho"><Input type="number" value={z.w} onChange={(e) => update(z.id, { w: +e.target.value })} /></Field>
                        <Field label="Alto"><Input type="number" value={z.h} onChange={(e) => update(z.id, { h: +e.target.value })} /></Field>
                    </div>
                    <Field label="Logo">
                        {logos.length ? (
                            <Dropdown
                                placeholder="Selecciona un logo"
                                value={z.src}
                                items={logos.map((l) => ({ value: l.url, label: l.name }))}
                                onChange={(v) => update(z.id, { src: v })}
                            />
                        ) : <p className="text-[11px] text-muted-foreground">No hay logos disponibles.</p>}
                    </Field>
                </>
            )}

            {z.type === "text" && (
                <>
                    <Field label="Ancho caja"><Input type="number" value={z.w} onChange={(e) => update(z.id, { w: +e.target.value })} /></Field>
                    <Field label="Alineación">
                        <ToggleGroup type="single" variant="outline" value={z.align} onValueChange={(v) => { if (v) update(z.id, { align: v as TextZone["align"] }); }} className="grid w-full grid-cols-3 gap-1.5">
                            <ToggleGroupItem value="left" className="text-xs">Izq</ToggleGroupItem>
                            <ToggleGroupItem value="center" className="text-xs">Centro</ToggleGroupItem>
                            <ToggleGroupItem value="right" className="text-xs">Der</ToggleGroupItem>
                        </ToggleGroup>
                    </Field>
                    <Field label="Fuente">
                        <Dropdown placeholder="Fuente" value={z.font} items={FONT_OPTIONS} onChange={(v) => update(z.id, { font: v })} />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                        <Field label="Tamaño"><Input type="number" value={z.size} onChange={(e) => update(z.id, { size: +e.target.value })} /></Field>
                        <Field label="Peso">
                            <Dropdown placeholder="Peso" value={String(z.weight)} items={WEIGHT_OPTIONS} onChange={(v) => update(z.id, { weight: +v })} />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Field label="Color"><input type="color" value={hex(z.color)} onChange={(e) => update(z.id, { color: fromHex(e.target.value) })} className="h-9 w-full rounded-md border bg-secondary" /></Field>
                        <Field label="Tracking"><Input type="number" value={z.tracking || 0} onChange={(e) => update(z.id, { tracking: +e.target.value })} /></Field>
                    </div>
                    <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Checkbox checked={!!z.uppercase} onCheckedChange={(c) => update(z.id, { uppercase: c === true })} />
                        MAYÚSCULAS
                    </label>
                </>
            )}

            <Button variant="outline" className="w-full border-destructive text-destructive" onClick={onDelete}>Eliminar zona</Button>
        </div>
    );
}
