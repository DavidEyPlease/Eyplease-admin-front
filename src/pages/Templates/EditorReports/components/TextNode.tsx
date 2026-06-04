import { Text } from "react-konva";

import { TextZone, FONT_MAP } from "../layout-types";
import { sampleText, ZoneNodeHandlers } from "../layout-helpers";

interface TextNodeProps extends ZoneNodeHandlers {
    z: TextZone;
    scale: number;
    /** Effective y/size from auto_fit + flow_below (editor preview). */
    displayY?: number;
    displaySize?: number;
}

/** Konva node for a text zone, rendered with sample copy for the data_key. */
export default function TextNode({ z, scale: S, displayY, displaySize, onSelect, onDragStart, onDragMove, onDragEnd, setRef }: TextNodeProps) {
    const fm = FONT_MAP[z.font] || { family: "Inter", italic: false };
    const txt = z.uppercase ? sampleText(z.data_key).toUpperCase() : sampleText(z.data_key);
    const y = displayY ?? z.y;
    const size = displaySize ?? z.size ?? 32;
    // When the zone flows under another, its y is derived — lock dragging to
    // the horizontal axis and keep the stored y untouched.
    const locked = !!z.flow_below;
    return (
        <Text
            ref={(n) => { if (n) setRef(z.id, n); }} x={z.x * S} y={y * S} width={z.w * S} text={txt}
            fontFamily={fm.family} fontStyle={`${fm.italic ? "italic " : ""}${z.weight || 400}`} fontSize={size * S}
            fill={`rgb(${z.color.join(",")})`} align={z.align} lineHeight={z.line_height || 1.15} letterSpacing={(z.tracking || 0) * S} draggable
            dragBoundFunc={locked ? (pos) => ({ x: pos.x, y: y * S }) : undefined}
            onClick={(e) => onSelect(z.id, e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey)}
            onTap={() => onSelect(z.id, false)}
            onDragStart={(e) => onDragStart(z.id, e.target)} onDragMove={(e) => onDragMove(z.id, e.target)} onDragEnd={(e) => onDragEnd(z.id, e.target, locked ? { y: z.y } : undefined)}
            onTransformEnd={(e) => { const n = e.target; const sx = n.scaleX(), sy = n.scaleY(); n.scaleX(1); n.scaleY(1); const patch: Partial<TextZone> = { w: Math.max(40, Math.round(z.w * sx)) }; if (Math.abs(sy - 1) > 0.01) patch.size = Math.max(8, Math.round((z.size || 32) * sy)); onDragEnd(z.id, n, patch); }}
        />
    );
}
