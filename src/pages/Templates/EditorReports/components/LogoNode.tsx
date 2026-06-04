import { Group, Image as KImage, Rect } from "react-konva";
import useImage from "use-image";

import { LogoZone } from "../layout-types";
import { SELECTION, ZoneNodeHandlers } from "../layout-helpers";

interface LogoNodeProps extends ZoneNodeHandlers {
    z: LogoZone;
    scale: number;
    multi: boolean;
}

/** Konva node for a logo zone, with contain-fit centering of the image. */
export default function LogoNode({ z, scale, multi, onSelect, onDragStart, onDragMove, onDragEnd, setRef }: LogoNodeProps) {
    const [img] = useImage(z.src || "");
    const dw = z.w * scale, dh = z.h * scale;
    let drawW = dw, drawH = dh, ox = 0, oy = 0;
    if (img && (z.fit || "contain") === "contain") {
        const sc = Math.min(dw / img.naturalWidth, dh / img.naturalHeight);
        drawW = img.naturalWidth * sc; drawH = img.naturalHeight * sc;
        ox = (dw - drawW) / 2; oy = (dh - drawH) / 2;
    }
    return (
        <Group
            x={z.x * scale} y={z.y * scale} opacity={z.opacity ?? 1} draggable
            ref={(n) => { if (n) setRef(z.id, n); }}
            onClick={(e) => onSelect(z.id, e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey)}
            onTap={() => onSelect(z.id, false)}
            onDragStart={(e) => onDragStart(z.id, e.target)}
            onDragMove={(e) => onDragMove(z.id, e.target)}
            onDragEnd={(e) => onDragEnd(z.id, e.target)}
            onTransformEnd={(e) => { const n = e.target; const sx = n.scaleX(), sy = n.scaleY(); n.scaleX(1); n.scaleY(1); onDragEnd(z.id, n, { w: Math.round(z.w * sx), h: Math.round(z.h * sy) }); }}
        >
            {img ? <KImage image={img} x={ox} y={oy} width={drawW} height={drawH} /> : <Rect width={dw} height={dh} stroke={SELECTION} dash={[6, 4]} />}
            {multi && <Rect width={dw} height={dh} stroke={SELECTION} strokeWidth={2} dash={[5, 3]} />}
        </Group>
    );
}
