import { Text } from "react-konva";

import { TextZone, FONT_MAP } from "../layout-types";
import { sampleText, ZoneNodeHandlers } from "../layout-helpers";

interface TextNodeProps extends ZoneNodeHandlers {
    z: TextZone;
    scale: number;
}

/** Konva node for a text zone, rendered with sample copy for the data_key. */
export default function TextNode({ z, scale: S, onSelect, onDragStart, onDragMove, onDragEnd, setRef }: TextNodeProps) {
    const fm = FONT_MAP[z.font] || { family: "Inter", italic: false };
    const txt = z.uppercase ? sampleText(z.data_key).toUpperCase() : sampleText(z.data_key);
    return (
        <Text
            ref={(n) => { if (n) setRef(z.id, n); }} x={z.x * S} y={z.y * S} width={z.w * S} text={txt}
            fontFamily={fm.family} fontStyle={`${fm.italic ? "italic " : ""}${z.weight || 400}`} fontSize={(z.size || 32) * S}
            fill={`rgb(${z.color.join(",")})`} align={z.align} lineHeight={z.line_height || 1.15} letterSpacing={(z.tracking || 0) * S} draggable
            onClick={(e) => onSelect(z.id, e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey)}
            onTap={() => onSelect(z.id, false)}
            onDragStart={(e) => onDragStart(z.id, e.target)} onDragMove={(e) => onDragMove(z.id, e.target)} onDragEnd={(e) => onDragEnd(z.id, e.target)}
            onTransformEnd={(e) => { const n = e.target; const sx = n.scaleX(), sy = n.scaleY(); n.scaleX(1); n.scaleY(1); const patch: Partial<TextZone> = { w: Math.max(40, Math.round(z.w * sx)) }; if (Math.abs(sy - 1) > 0.01) patch.size = Math.max(8, Math.round((z.size || 32) * sy)); onDragEnd(z.id, n, patch); }}
        />
    );
}
