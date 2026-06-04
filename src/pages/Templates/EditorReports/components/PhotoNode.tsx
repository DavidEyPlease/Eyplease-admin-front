import type Konva from "konva";
import { Group, Circle, Rect, Text, Image as KImage } from "react-konva";
import useImage from "use-image";

import { PhotoZone } from "../layout-types";
import { SELECTION, ZoneNodeHandlers, DEFAULT_PHOTO_URL } from "../layout-helpers";

interface PhotoNodeProps extends ZoneNodeHandlers {
    z: PhotoZone;
    scale: number;
    multi: boolean;
}

/** Konva node for a photo zone: clipped placeholder + optional golden border. */
export default function PhotoNode({ z, scale: S, multi, onSelect, onDragStart, onDragMove, onDragEnd, setRef }: PhotoNodeProps) {
    const dw = z.w * S, dh = z.h * S;
    const [img] = useImage(DEFAULT_PHOTO_URL);
    // Cover-fit the preview image into the zone box (centered crop).
    let drawW = dw, drawH = dh, ox = 0, oy = 0;
    if (img) {
        const sc = Math.max(dw / img.naturalWidth, dh / img.naturalHeight);
        drawW = img.naturalWidth * sc; drawH = img.naturalHeight * sc;
        ox = (dw - drawW) / 2; oy = (dh - drawH) / 2;
    }
    const clip = (ctx: Konva.Context) => {
        if (z.shape === "circle") ctx.arc(dw / 2, dh / 2, Math.min(dw, dh) / 2, 0, Math.PI * 2);
        else if (z.shape === "rounded_rect") { const r = Math.min((z.radius || 0) * S, dw / 2, dh / 2); ctx.moveTo(r, 0); ctx.arcTo(dw, 0, dw, dh, r); ctx.arcTo(dw, dh, 0, dh, r); ctx.arcTo(0, dh, 0, 0, r); ctx.arcTo(0, 0, dw, 0, r); }
        else ctx.rect(0, 0, dw, dh);
    };
    const bcol = z.border ? `rgb(${z.border.color.join(",")})` : "transparent";
    return (
        <Group
            ref={(n) => { if (n) setRef(z.id, n); }} x={z.x * S} y={z.y * S} opacity={z.opacity ?? 1} draggable
            onClick={(e) => onSelect(z.id, e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey)}
            onTap={() => onSelect(z.id, false)}
            onDragStart={(e) => onDragStart(z.id, e.target)} onDragMove={(e) => onDragMove(z.id, e.target)} onDragEnd={(e) => onDragEnd(z.id, e.target)}
            onTransformEnd={(e) => { const n = e.target; const sx = n.scaleX(), sy = n.scaleY(); n.scaleX(1); n.scaleY(1); onDragEnd(z.id, n, { w: Math.round(z.w * sx), h: Math.round(z.h * sy) }); }}
        >
            <Group clipFunc={clip}>
                {img
                    ? <KImage image={img} x={ox} y={oy} width={drawW} height={drawH} />
                    : <><Rect width={dw} height={dh} fill="rgba(140,140,160,0.45)" /><Text text="FOTO" width={dw} height={dh} align="center" verticalAlign="middle" fontSize={12} fill="#fff" /></>}
            </Group>
            {z.border && z.shape === "circle" && <Circle x={dw / 2} y={dh / 2} radius={Math.min(dw, dh) / 2} stroke={bcol} strokeWidth={(z.border.width || 4) * S} />}
            {z.border && z.shape !== "circle" && <Rect width={dw} height={dh} cornerRadius={(z.radius || 0) * S} stroke={bcol} strokeWidth={(z.border.width || 4) * S} />}
            {multi && <Rect width={dw} height={dh} stroke={SELECTION} strokeWidth={2} dash={[5, 3]} />}
        </Group>
    );
}
