import { useCallback, useEffect, useRef, useState } from "react";
import type Konva from "konva";
import useImage from "use-image";

import {
    BgInfo, Layout, Zone, PhotoZone, TextZone, LogoZone, Border, Shadow,
    TemplateFormat, TemplateGroup, layoutKey, textToRenderer, textFromRenderer,
} from "./layout-types";
import {
    ZonePatch, newId, familyPrefix, photoDefaults, nameDefaults, metricDefaults, DEFAULT_LOGO_URL,
} from "./layout-helpers";

export interface UseLayoutEditorArgs {
    backgrounds: BgInfo[];
    initialLayouts: Record<string, Layout>;
    saveLayouts: (layouts: Record<string, Layout>) => Promise<void>;
    logos: { name: string; url: string }[];
}

type StageMouseEvent = Konva.KonvaEventObject<MouseEvent>;

/**
 * All state, derived values and behaviour for the Konva layout editor. The
 * component that consumes this hook is purely presentational — it wires the
 * returned values into JSX and owns no logic of its own.
 */
export function useLayoutEditor({ backgrounds, initialLayouts, saveLayouts, logos }: UseLayoutEditorArgs) {
    const groups = Array.from(new Set(backgrounds.map((b) => b.group)));
    const formats = Array.from(new Set(backgrounds.map((b) => b.format)));
    const [group, setGroup] = useState<TemplateGroup>(groups[0] ?? "unit");
    const [format, setFormat] = useState<TemplateFormat>(formats[0] ?? "vertical");
    const [bgKey, setBgKey] = useState<string>("");
    const [zones, setZones] = useState<Zone[]>([]);
    const [selIds, setSelIds] = useState<string[]>([]);
    const [scale, setScale] = useState(0.3);
    const [status, setStatus] = useState("");
    const [clipboard, setClipboard] = useState<Zone[] | null>(null);
    const [marquee, setMarquee] = useState<null | { x1: number; y1: number; x2: number; y2: number }>(null);
    const [applyFamily, setApplyFamily] = useState(false);

    const layoutsRef = useRef<Record<string, Layout>>({ ...initialLayouts });
    const trRef = useRef<Konva.Transformer | null>(null);
    const nodeRefs = useRef<Record<string, Konva.Node>>({});
    const dragState = useRef<null | { start: { x: number; y: number }; base: Record<string, { x: number; y: number }> }>(null);
    const marqueeStart = useRef<{ x: number; y: number } | null>(null);
    const setRef = (id: string, n: Konva.Node) => { nodeRefs.current[id] = n; };

    // ---- Undo history ----
    const histRef = useRef<Zone[][]>([]);
    const prevZonesRef = useRef<Zone[]>([]);
    const skipHist = useRef(false);
    useEffect(() => {
        if (skipHist.current) { skipHist.current = false; prevZonesRef.current = zones; return; }
        if (prevZonesRef.current !== zones) { histRef.current.push(prevZonesRef.current); if (histRef.current.length > 80) histRef.current.shift(); prevZonesRef.current = zones; }
    }, [zones]);
    const undo = useCallback(() => {
        if (!histRef.current.length) return;
        const prev = histRef.current.pop()!;
        skipHist.current = true;
        setZones(prev);
        setSelIds([]);
    }, []);

    // ---- Derived background state ----
    const filteredBgs = backgrounds.filter((b) => b.group === group && b.format === format);
    const bg = backgrounds.find((b) => layoutKey(b) === bgKey);
    const [bgImg] = useImage(bg?.url || "");
    const bgW = bgImg?.naturalWidth || 1152;
    const bgH = bgImg?.naturalHeight || 2048;
    const S = scale;

    function commitCurrent() {
        if (!bgKey || !bgImg) return;
        // An empty canvas means "no layout": drop the entry instead of storing a
        // blank one, so merely visiting a background doesn't mark it as configured.
        if (zones.length === 0) { delete layoutsRef.current[bgKey]; return; }
        const exportZones = zones.map((z) => (z.type === "text" ? textToRenderer(z) : z));
        layoutsRef.current[bgKey] = { name: bg?.asset || bgKey, canvas: { w: bgW, h: bgH }, zones: exportZones };
    }

    // Keep a valid selected background when the group/format filter changes.
    useEffect(() => {
        const list = backgrounds.filter((b) => b.group === group && b.format === format);
        if (list.length && !list.some((b) => layoutKey(b) === bgKey)) {
            commitCurrent();
            setBgKey(layoutKey(list[0]));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [group, format, backgrounds]);

    // Load the layout of the selected asset.
    useEffect(() => {
        if (!bg) return;
        setSelIds([]);
        histRef.current = []; skipHist.current = true;
        const l = layoutsRef.current[bgKey];
        if (l) setZones((l.zones || []).map((z) => { const zz = z.type === "text" ? textFromRenderer(z) : z; return { ...zz, id: newId(z.type) }; }));
        else setZones([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bgKey]);

    // Fit the stage to the viewport when the background image loads.
    useEffect(() => {
        if (!bgImg) return;
        const maxH = window.innerHeight - 200, maxW = window.innerWidth - 640;
        setScale(Math.min(maxH / bgImg.naturalHeight, maxW / bgImg.naturalWidth, 0.6));
    }, [bgImg]);

    // Keyboard: undo (cmd/ctrl+z) and delete the current selection.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); return; }
            const tag = (document.activeElement?.tagName || "").toLowerCase();
            if (tag === "input" || tag === "select" || tag === "textarea") return;
            if ((e.key === "Delete" || e.key === "Backspace") && selIds.length) { e.preventDefault(); setZones((zs) => zs.filter((z) => !selIds.includes(z.id))); setSelIds([]); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selIds, undo]);

    // Bind the Konva transformer to the single selected node.
    useEffect(() => {
        const tr = trRef.current; if (!tr) return;
        if (selIds.length === 1) {
            const node = nodeRefs.current[selIds[0]];
            tr.nodes(node ? [node] : []);
            const z = zones.find((zz) => zz.id === selIds[0]);
            tr.keepRatio(z?.type === "photo" && z.shape === "circle");
            tr.enabledAnchors(["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right"]);
        } else tr.nodes([]);
        tr.getLayer()?.batchDraw();
    }, [selIds, zones, bgImg]);

    // ---- Zone mutation ----
    const update = useCallback((id: string, patch: ZonePatch) =>
        setZones((zs) => zs.map((z) => (z.id === id ? ({ ...z, ...patch } as Zone) : z))), []);
    const updateNested = useCallback((id: string, key: "border" | "shadow", patch: Partial<Border> | Partial<Shadow>) =>
        setZones((zs) => zs.map((z) => (z.id === id ? ({ ...z, [key]: { ...(z as PhotoZone)[key], ...patch } } as Zone) : z))), []);

    const toggleSelect = (id: string, additive: boolean) => {
        if (additive) setSelIds((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
        else setSelIds([id]);
    };

    // ---- Drag (single + group) ----
    const onDragStart = (id: string, node: Konva.Node) => {
        if (selIds.includes(id) && selIds.length > 1) {
            const base: Record<string, { x: number; y: number }> = {};
            selIds.forEach((sid) => { const n = nodeRefs.current[sid]; if (n) base[sid] = { x: n.x() / S, y: n.y() / S }; });
            dragState.current = { start: { x: node.x() / S, y: node.y() / S }, base };
        } else { if (!selIds.includes(id)) setSelIds([id]); dragState.current = null; }
    };
    const onDragMove = (id: string, node: Konva.Node) => {
        const ds = dragState.current; if (!ds) return;
        const dx = node.x() / S - ds.start.x, dy = node.y() / S - ds.start.y;
        selIds.forEach((sid) => { if (sid === id) return; const n = nodeRefs.current[sid], b = ds.base[sid]; if (n && b) n.position({ x: (b.x + dx) * S, y: (b.y + dy) * S }); });
        node.getLayer()?.batchDraw();
    };
    const onDragEnd = (id: string, node: Konva.Node, extra?: ZonePatch) => {
        const ds = dragState.current;
        if (ds && selIds.length > 1) {
            const dx = node.x() / S - ds.start.x, dy = node.y() / S - ds.start.y;
            setZones((zs) => zs.map((z) => (selIds.includes(z.id) && ds.base[z.id] ? { ...z, x: Math.round(ds.base[z.id].x + dx), y: Math.round(ds.base[z.id].y + dy) } : z)));
            dragState.current = null;
        } else update(id, { x: Math.round(node.x() / S), y: Math.round(node.y() / S), ...(extra ?? {}) });
    };

    // ---- Marquee selection (drag on empty stage) ----
    const onStageMouseDown = (e: StageMouseEvent) => {
        const stage = e.target.getStage();
        if (stage && e.target === stage) {
            const p = stage.getPointerPosition(); if (!p) return;
            marqueeStart.current = p; setMarquee({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
            if (!e.evt.shiftKey) setSelIds([]);
        }
    };
    const onStageMouseMove = (e: StageMouseEvent) => {
        if (!marqueeStart.current) return;
        const p = e.target.getStage()?.getPointerPosition(); if (!p) return;
        setMarquee({ x1: marqueeStart.current.x, y1: marqueeStart.current.y, x2: p.x, y2: p.y });
    };
    const onStageMouseUp = (e: StageMouseEvent) => {
        if (marqueeStart.current && marquee) {
            const moved = Math.abs(marquee.x2 - marquee.x1) > 4 || Math.abs(marquee.y2 - marquee.y1) > 4;
            if (moved) {
                const rx1 = Math.min(marquee.x1, marquee.x2) / S, ry1 = Math.min(marquee.y1, marquee.y2) / S, rx2 = Math.max(marquee.x1, marquee.x2) / S, ry2 = Math.max(marquee.y1, marquee.y2) / S;
                const hits = zones.filter((z) => {
                    const zw = "w" in z ? z.w : 0;
                    const zh = "h" in z ? z.h : (z.type === "text" ? z.size * 1.4 : 0);
                    return z.x < rx2 && z.x + zw > rx1 && z.y < ry2 && z.y + zh > ry1;
                }).map((z) => z.id);
                setSelIds((prev) => (e.evt.shiftKey ? Array.from(new Set([...prev, ...hits])) : hits));
            }
        }
        marqueeStart.current = null; setMarquee(null);
    };

    // ---- Add / remove / clipboard ----
    const addPhoto = () => { const z: PhotoZone = { id: newId("foto"), type: "photo", data_key: "photo", x: Math.round(bgW / 2 - 140), y: Math.round(bgH / 2 - 140), w: 280, h: 280, ...photoDefaults() }; setZones((zs) => [...zs, z]); setSelIds([z.id]); };
    const addText = () => { const z: TextZone = { id: newId("txt"), type: "text", data_key: "name", x: Math.round(bgW / 2 - 300), y: Math.round(bgH / 2), w: 600, align: "center", valign: "top", ...nameDefaults() }; setZones((zs) => [...zs, z]); setSelIds([z.id]); };
    const addLogo = () => { const src = logos[0]?.url || DEFAULT_LOGO_URL; const z: LogoZone = { id: newId("logo"), type: "logo", src, x: Math.round(bgW / 2 - 150), y: Math.round(bgH * 0.04), w: 300, h: 90, fit: "contain" }; setZones((zs) => [...zs, z]); setSelIds([z.id]); };
    const addRow = () => {
        const fotoId = newId("foto"), nomId = newId("nom"), metId = newId("met");
        setZones((zs) => {
            const idxs = zs
                .map((z) => ("data_key" in z ? z.data_key : "").match(/^items\[(\d+)\]/))
                .filter((m): m is RegExpMatchArray => !!m)
                .map((m) => parseInt(m[1]));
            const n = idxs.length ? Math.max(...idxs) + 1 : 0;
            const baseY = Math.round(bgH * 0.30) + n * Math.round(bgH * 0.135);
            const px = Math.round(bgW * 0.11), d = 240, tx = px + d + 50;
            return [...zs,
            { id: fotoId, type: "photo", data_key: `items[${n}].photo`, x: px, y: baseY, w: d, h: d, ...photoDefaults() } as PhotoZone,
            { id: nomId, type: "text", data_key: `items[${n}].name`, x: tx, y: baseY + 40, w: bgW - tx - 80, align: "left", valign: "top", ...nameDefaults() } as TextZone,
            { id: metId, type: "text", data_key: `items[${n}].points`, x: tx, y: baseY + 130, w: bgW - tx - 80, align: "left", valign: "top", ...metricDefaults() } as TextZone];
        });
        setSelIds([fotoId]);
    };
    const del = (id: string) => { setZones((zs) => zs.filter((z) => z.id !== id)); setSelIds((s) => s.filter((i) => i !== id)); };
    const copyLayout = () => { setClipboard(JSON.parse(JSON.stringify(zones))); setStatus("Copiado. Cambia de fondo y pega."); setTimeout(() => setStatus(""), 3500); };
    const pasteLayout = () => { if (!clipboard) return; setZones(clipboard.map((z) => ({ ...z, id: newId(z.type) }))); setSelIds([]); };

    // ---- Background selection (commit before switching away) ----
    const selectGroup = (v: TemplateGroup) => { commitCurrent(); setGroup(v); };
    const selectFormat = (v: TemplateFormat) => { commitCurrent(); setFormat(v); };
    const selectBg = (v: string) => { commitCurrent(); setBgKey(v); };

    // ---- Persistence ----
    async function save() {
        commitCurrent();
        if (applyFamily && bg) {
            const pref = familyPrefix(bg.asset);
            const current = layoutsRef.current[bgKey];
            backgrounds.filter((b) => b.group === bg.group && b.format === bg.format && b.asset.startsWith(pref + "_")).forEach((sib) => {
                layoutsRef.current[layoutKey(sib)] = { ...current, name: sib.asset };
            });
        }
        try {
            await saveLayouts(layoutsRef.current);
            setStatus("Guardado ✓");
        } catch {
            setStatus("Error al guardar");
        }
    }

    const sel = selIds.length === 1 ? zones.find((z) => z.id === selIds[0]) ?? null : null;

    return {
        // background selection
        groups, formats, group, format, bgKey, filteredBgs, layoutsRef,
        bgImg, bgW, bgH, scale: S,
        selectGroup, selectFormat, selectBg,
        // zones
        zones, selIds, sel,
        toggleSelect, del, update, updateNested,
        addPhoto, addText, addLogo, addRow,
        copyLayout, pasteLayout, clipboard,
        // canvas nodes / transformer
        setRef, trRef, onDragStart, onDragMove, onDragEnd,
        // marquee
        marquee, onStageMouseDown, onStageMouseMove, onStageMouseUp,
        // save
        applyFamily, setApplyFamily, save, status,
    };
}
