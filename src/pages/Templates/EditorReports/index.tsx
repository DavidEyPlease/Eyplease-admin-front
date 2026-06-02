import { useParams } from "react-router"

import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import { Backgrounds, ITemplate } from "@/interfaces/templates"
import { replaceRecordIdInPath } from "@/utils"
import { queryKeys } from "@/utils/queryKeys"
import { useEffect, useMemo } from "react"
import { BgInfo, Layout, TemplateFormat, TemplateGroup } from "./layout-types"
import LayoutEditor from "./LayoutEditor"
import { ensureEditorFonts } from "../editorFonts"
import { toast } from "sonner"

const TemplateReportEditorPage = () => {
    const params = useParams<{ id: string }>()
    const templateId = params.id || ''

    // Load the editor fonts on demand (instead of in the root index.html).
    useEffect(() => { void ensureEditorFonts() }, [])

    const { response: template, loading } = useFetchQuery<ITemplate>(replaceRecordIdInPath(API_ROUTES.TEMPLATES.DETAIL, templateId), {
        customQueryKey: queryKeys.detail(`template`, templateId),
        enabled: !!templateId
    })

    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.detail(`template`, templateId)],
    })

    async function saveLayouts(layouts: Record<string, Layout>) {
        const render_configuration = { ...(template?.render_configuration ?? {}), layouts }
        const response = await request<Partial<ITemplate>, ITemplate>(
            'PUT',
            replaceRecordIdInPath(API_ROUTES.TEMPLATES.UPDATE, templateId),
            { render_configuration },
        )
        if (!response.success) {
            throw new Error('No se pudo guardar el layout')
        }
        toast.success("Layout guardado");
    }

    const backgrounds = useMemo<BgInfo[]>(() => {
        if (!template) return [];
        const maps: Array<[TemplateGroup, TemplateFormat, Backgrounds | null | undefined]> = [
            ["unit", "vertical", template.unity_background_vertical],
            ["unit", "horizontal", template.unity_background_horizontal],
            ["national", "vertical", template.national_background_vertical],
            ["national", "horizontal", template.national_background_horizontal],
        ];
        const out: BgInfo[] = [];
        for (const [group, format, map] of maps) {
            if (!map) continue;
            // The backend returns { covers: {asset: url}, bg_sections: {asset: url} }.
            // Descend one more level: covers + section backgrounds.
            const records: Array<["cover" | "section", Record<string, string> | undefined]> = [
                ["cover", map.covers],
                ["section", map.bg_sections],
            ];
            for (const [kind, record] of records) {
                for (const [asset, url] of Object.entries(record ?? {})) {
                    if (url) out.push({ group, format, kind, asset, url });
                }
            }
        }
        return out;
    }, [template]);

    const initialLayouts: Record<string, Layout> = template?.render_configuration?.layouts ?? {};

    if (loading) return <div className="p-6 text-muted-foreground">Cargando plantilla…</div>;

    return (
        backgrounds.length === 0 ? (
            <div className="p-6 text-muted-foreground">Esta plantilla no tiene fondos cargados en S3 todavía.</div>
        ) : (
            <LayoutEditor
                backgrounds={backgrounds}
                initialLayouts={initialLayouts}
                savingLayout={requestState.loading}
                saveLayouts={saveLayouts}
            />
        )
    )
}

export default TemplateReportEditorPage