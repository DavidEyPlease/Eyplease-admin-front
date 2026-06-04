import { Stage, Layer, Image as KImage, Rect, Transformer } from "react-konva";
import { X } from "lucide-react";
import { useEffect, useMemo } from "react";

import { BgInfo, Layout, layoutKey } from "./layout-types";
import { EyrenderLayer } from "@/interfaces/templates";
import { zonesToLayers } from "./posts-layers";
import { SELECTION, GROUP_LABELS, FORMAT_LABELS, bgName, dataKeyOptionsFor, DataKeyOption, computeTextRenders } from "./layout-helpers";
import { useLayoutEditor } from "./useLayoutEditor";
import SectionTitle from "./components/SectionTitle";
import PhotoNode from "./components/PhotoNode";
import TextNode from "./components/TextNode";
import LogoNode from "./components/LogoNode";
import PropPanel from "./components/PropPanel";
import DropdownGroup from "@/components/common/Inputs/DropdownGroup";
import { Label } from "@/uishadcn/ui/label";
import { Checkbox } from "@/uishadcn/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/uishadcn/ui/toggle-group";
import { cn } from "@/lib/utils";
import Button from "@/components/common/Button";

/**
 * Visual layout editor (Konva) for newsletter templates.
 * - Inherits the admin theme through Tailwind tokens / shadcn primitives.
 * - Backgrounds come from the Template (S3 URLs).
 * - Persists the layout map into Template.render_configuration.layouts.
 *
 * This component is purely presentational: every piece of state and behaviour
 * lives in {@link useLayoutEditor}, the canvas nodes / property editor live in
 * ./components, and pure helpers live in ./layout-helpers.
 */

interface Props {
    backgrounds: BgInfo[];
    initialLayouts: Record<string, Layout>;
    saveLayouts: (layouts: Record<string, Layout>) => Promise<void>;
    savingLayout?: boolean;
    logos?: { name: string; url: string }[];
    /**
     * "reports" (default): group/format + cover/section pickers, saves the
     * layouts map. "posts": single background, no pickers/zone-list/save UI;
     * emits the current zones as Remotion layers via onLayersChange.
     */
    mode?: "reports" | "posts";
    onLayersChange?: (layers: EyrenderLayer[], canvas: { width: number; height: number }) => void;
    /** Overrides the data_key dropdown options (posts: chosen by template_group). */
    dataKeyOptions?: DataKeyOption[];
}

export default function LayoutEditor({ backgrounds, initialLayouts, savingLayout, saveLayouts, logos = [], mode = "reports", onLayersChange, dataKeyOptions }: Props) {
    const isPosts = mode === "posts";
    const editor = useLayoutEditor({ backgrounds, initialLayouts, saveLayouts, logos });
    const {
        groups, formats, group, format, bgKey, filteredBgs, layoutsRef,
        bgImg, bgW, bgH, scale: S,
        selectGroup, selectFormat, selectBg,
        zones, selIds, sel,
        toggleSelect, del, update, updateNested,
        addPhoto, addText, addLogo, addRow,
        copyLayout, pasteLayout, clipboard,
        setRef, trRef, onDragStart, onDragMove, onDragEnd,
        marquee, onStageMouseDown, onStageMouseMove, onStageMouseUp,
        applyFamily, setApplyFamily, save,
    } = editor;

    const selectedBg = filteredBgs.find((b) => layoutKey(b) === bgKey);

    // Effective y/size per text zone (auto_fit + flow_below) for canvas preview.
    const textRenders = useMemo(() => computeTextRenders(zones), [zones]);

    // Posts mode: emit the current zones as Remotion layers on every change.
    // Gated on bgImg so the initial empty->loaded transition doesn't fire a
    // spurious update before the zones are populated.
    useEffect(() => {
        if (!isPosts || !onLayersChange || !bgImg) return;
        onLayersChange(zonesToLayers(zones), { width: bgW, height: bgH });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPosts, bgImg, bgW, bgH, zones]);

    const bgItems = (kind: "cover" | "section") =>
        filteredBgs
            .filter((b) => b.kind === kind)
            .map((b) => ({
                value: layoutKey(b),
                label: `${(layoutsRef.current[layoutKey(b)]?.zones?.length ?? 0) > 0 ? "• " : ""}${bgName(b)}`,
            }));
    const coverItems = bgItems("cover");
    const sectionItems = bgItems("section");

    return (
        <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-xl border text-foreground">
            {/* Left panel */}
            <aside className="w-67.5 shrink-0 overflow-y-auto border-r bg-card p-4">
                {!isPosts && (
                    <>
                        <SectionTitle>Fondo</SectionTitle>
                        <ToggleGroup type="single" variant="outline" value={group} onValueChange={(v) => { if (v) selectGroup(v as typeof group); }} className="grid w-full grid-cols-2 gap-2">
                            {groups.map((g) => <ToggleGroupItem key={g} value={g} className="text-xs font-semibold">{GROUP_LABELS[g] ?? g}</ToggleGroupItem>)}
                        </ToggleGroup>
                        <ToggleGroup type="single" variant="outline" value={format} onValueChange={(v) => { if (v) selectFormat(v as typeof format); }} className="mt-2 grid w-full grid-cols-2 gap-2">
                            {formats.map((f) => <ToggleGroupItem key={f} value={f} className="text-xs font-semibold">{FORMAT_LABELS[f] ?? f}</ToggleGroupItem>)}
                        </ToggleGroup>

                        {/*
                          Two separate pickers (covers vs sections) sharing the same
                          selection. Keyed by group+format so each (uncontrolled) picker
                          remounts when switching group/format resets bgKey.
                        */}
                        <div className="mt-3">
                            <Label className="text-[11px] text-muted-foreground">Portadas ({coverItems.length})</Label>
                            <DropdownGroup
                                key={`cover-${group}-${format}`}
                                className="mt-1.5"
                                placeholder="Selecciona una portada"
                                value={bgKey}
                                groups={[{ groupName: "", items: coverItems }]}
                                onChange={selectBg}
                            />
                        </div>
                        <div className="mt-3">
                            <Label className="text-[11px] text-muted-foreground">Fondos de secciones ({sectionItems.length})</Label>
                            <DropdownGroup
                                key={`section-${group}-${format}`}
                                className="mt-1.5"
                                placeholder="Selecciona un fondo"
                                value={bgKey}
                                groups={[{ groupName: "", items: sectionItems }]}
                                onChange={selectBg}
                            />
                        </div>
                    </>
                )}

                <SectionTitle>Agregar</SectionTitle>
                <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" text="+ Foto" onClick={addPhoto}></Button>
                    <Button variant="outline" size="sm" text="+ Texto" onClick={addText}></Button>
                    <Button variant="outline" size="sm" text="+ Logo" onClick={addLogo}></Button>
                </div>
                {!isPosts && <Button variant="outline" size="sm" className="mt-2 w-full" text="+ Fila listado" onClick={addRow}></Button>}
                <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" text="Copiar" onClick={copyLayout}></Button>
                    <Button variant="outline" size="sm" text="Pegar" disabled={!clipboard} onClick={pasteLayout}></Button>
                </div>

                {!isPosts && (
                    <>
                        <SectionTitle>Zonas ({zones.length}){selIds.length > 1 ? ` · ${selIds.length} sel` : ""}</SectionTitle>
                        <div className="space-y-1">
                            {zones.map((z) => (
                                <div
                                    key={z.id}
                                    onClick={(e) => toggleSelect(z.id, e.shiftKey || e.metaKey || e.ctrlKey)}
                                    className={cn(
                                        "flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-xs",
                                        selIds.includes(z.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                                    )}
                                >
                                    <span className="truncate">{z.type === "photo" ? "🖼" : z.type === "logo" ? "✦" : "T"} {z.type === "logo" ? "logo" : z.data_key}</span>
                                    <button onClick={(e) => { e.stopPropagation(); del(z.id); }} className="ml-2 shrink-0 text-destructive hover:opacity-80" aria-label="Eliminar zona">
                                        <X className="size-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <SectionTitle>Guardar</SectionTitle>
                        <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <Checkbox checked={applyFamily} onCheckedChange={(c) => setApplyFamily(c === true)} />
                            Aplicar a la familia
                        </label>
                        <Button
                            text='Guardar layout'
                            type="button"
                            color="primary"
                            rounded
                            className="mt-2 w-full"
                            loading={savingLayout}
                            onClick={save}
                        />
                    </>
                )}
            </aside>

            {/* Canvas */}
            <div className="flex flex-1 flex-col overflow-hidden bg-background">
                {!isPosts && selectedBg && (
                    <div className="flex flex-wrap items-center gap-2 border-b bg-card/50 px-4 py-2.5">
                        <span className="text-sm font-semibold text-foreground">{bgName(selectedBg)}</span>
                        <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            selectedBg.kind === "cover" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground",
                        )}>
                            {selectedBg.kind === "cover" ? "Portada" : "Fondo de sección"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {GROUP_LABELS[selectedBg.group] ?? selectedBg.group} · {FORMAT_LABELS[selectedBg.format] ?? selectedBg.format}
                        </span>
                    </div>
                )}
                <div className="flex flex-1 items-center justify-center overflow-auto">
                {bgImg && (
                    <Stage
                        width={bgW * S} height={bgH * S} className="shadow-2xl"
                        onMouseDown={onStageMouseDown}
                        onMouseMove={onStageMouseMove}
                        onMouseUp={onStageMouseUp}
                    >
                        <Layer>
                            <KImage image={bgImg} width={bgW * S} height={bgH * S} />
                            {zones.map((z) => z.type === "photo" ? (
                                <PhotoNode key={z.id} z={z} scale={S} multi={selIds.length > 1 && selIds.includes(z.id)} onSelect={toggleSelect} onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} setRef={setRef} />
                            ) : z.type === "text" ? (
                                <TextNode key={z.id} z={z} scale={S} displayY={textRenders[z.id]?.y} displaySize={textRenders[z.id]?.size} onSelect={toggleSelect} onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} setRef={setRef} />
                            ) : (
                                <LogoNode key={z.id} z={z} scale={S} multi={selIds.length > 1 && selIds.includes(z.id)} onSelect={toggleSelect} onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} setRef={setRef} />
                            ))}
                            {marquee && <Rect x={Math.min(marquee.x1, marquee.x2)} y={Math.min(marquee.y1, marquee.y2)} width={Math.abs(marquee.x2 - marquee.x1)} height={Math.abs(marquee.y2 - marquee.y1)} fill="rgba(124,92,255,0.15)" stroke={SELECTION} dash={[4, 3]} listening={false} />}
                            <Transformer ref={trRef} rotateEnabled={false} borderStroke={SELECTION} anchorStroke={SELECTION} anchorFill="#fff" />
                        </Layer>
                    </Stage>
                )}
                </div>
            </div>

            {/* Right panel */}
            <aside className="w-70 shrink-0 overflow-y-auto border-l bg-card p-4">
                <SectionTitle>Propiedades</SectionTitle>
                {selIds.length === 0 && <p className="text-xs text-muted-foreground">Selecciona o agrega una zona.</p>}
                {selIds.length > 1 && <p className="text-xs text-muted-foreground">{selIds.length} zonas. Arrástralas juntas. Shift+clic suma.</p>}
                {sel && <PropPanel key={sel.id} z={sel} zones={zones} update={update} updateNested={updateNested} onDelete={() => del(sel.id)} logos={logos} dataKeyOptions={dataKeyOptions ?? dataKeyOptionsFor(selectedBg)} />}
            </aside>
        </div>
    );
}
