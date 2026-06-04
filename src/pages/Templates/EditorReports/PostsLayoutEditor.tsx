import { useMemo, useRef } from "react";

import { EyrenderLayer } from "@/interfaces/templates";
import { BgInfo, Layout, layoutKey } from "./layout-types";
import { layersToZones } from "./posts-layers";
import { dataKeyOptionsForGroup } from "./layout-helpers";
import LayoutEditor from "./LayoutEditor";

interface Props {
    backgroundUrl: string;
    initialLayers: EyrenderLayer[];
    onChange: (layers: EyrenderLayer[], canvas: { width: number; height: number }) => void;
    /** Template group; selects the data_key vocabulary (e.g. honor_roll). */
    templateGroup?: string | null;
}

/**
 * Posts/templates variant of the Konva editor: a single background image
 * (template_file_url) used both as the design surface and as the canvas size,
 * with the output expressed as Remotion layers. Reuses LayoutEditor in
 * `mode="posts"`, feeding it a synthetic one-background dataset.
 */
export default function PostsLayoutEditor({ backgroundUrl, initialLayers, onChange, templateGroup }: Props) {
    // Capture the initial layers once: the hook reads initialLayouts only at
    // mount, and onChange keeps the draft in sync afterwards.
    const initialRef = useRef(initialLayers);

    const backgrounds = useMemo<BgInfo[]>(
        () => [{ group: "unit", format: "vertical", kind: "section", asset: "main", url: backgroundUrl }],
        [backgroundUrl],
    );

    const initialLayouts = useMemo<Record<string, Layout>>(
        () => ({ [layoutKey(backgrounds[0])]: { name: "main", canvas: { w: 0, h: 0 }, zones: layersToZones(initialRef.current) } }),
        [backgrounds],
    );

    return (
        <LayoutEditor
            mode="posts"
            backgrounds={backgrounds}
            initialLayouts={initialLayouts}
            saveLayouts={async () => { }}
            logos={[]}
            onLayersChange={onChange}
            dataKeyOptions={dataKeyOptionsForGroup(templateGroup)}
        />
    );
}
