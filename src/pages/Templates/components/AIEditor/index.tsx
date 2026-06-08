import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AlertCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/uishadcn/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/uishadcn/ui/alert"
import useRequestQuery from "@/hooks/useRequestQuery"
import { API_ROUTES } from "@/constants/api"
import {
    AIDraft,
    EyrenderLayer,
    ITemplate,
    ITemplateVariant,
    RenderConfiguration,
} from "@/interfaces/templates"
import { publishEvent } from "@/utils/events"
import { BROWSER_EVENTS } from "@/constants/browserEvents"

import { ensureEditorFonts } from "../../editorFonts"
import PostsLayoutEditor from "../../EditorReports/PostsLayoutEditor"
import EyrenderPreviewTemplate from "../EyrenderPreviewTemplate"
import EditorToolbar from "./EditorToolbar"
import JsonEditor from "./JsonEditor"
import { DEFAULT_CANVAS } from "./constants"
import { EditorMode } from "./types"

interface IProps {
    template: ITemplate
    /**
     * When provided, the editor reads/writes against the variant instead of
     * the template-level legacy columns. Background comes from
     * `variant.template_file_url`; save targets the variant endpoint.
     */
    variant?: ITemplateVariant | null
}

const AIEditor = ({ template, variant = null }: IProps) => {
    // Load the editor fonts on demand (instead of in the root index.html).
    useEffect(() => { void ensureEditorFonts() }, [])

    // Single source of truth resolver. Variants take precedence; otherwise
    // fall back to template-level columns to keep legacy rows working.
    const sourceRender = variant?.render_configuration ?? template.render_configuration
    const sourceDraft = variant?.ai_draft_json ?? template.ai_draft_json
    const sourceAnalyzedAt = variant?.ai_analyzed_at ?? template.ai_analyzed_at
    const backgroundUrl = variant?.template_file_url ?? template.template_file_url ?? ""

    const [draft, setDraft] = useState<AIDraft | null>(() => {
        // Prefer the saved `render_configuration` whenever it actually has
        // layers — a stale `ai_draft_json` (cached analysis the editor
        // never wrote back) must not shadow a real saved config.
        if (sourceRender?.layersTemplate?.length) {
            return {
                compositionId: sourceRender.compositionId || "still-composer",
                canvas: sourceRender.canvas || DEFAULT_CANVAS,
                layersTemplate: sourceRender.layersTemplate,
                analyzed_at: sourceAnalyzedAt,
            }
        }
        return sourceDraft ?? null
    })
    const [mode, setMode] = useState<EditorMode>("edit")
    const [dirty, setDirty] = useState(false)
    const [jsonValue, setJsonValue] = useState("")
    const [jsonError, setJsonError] = useState<string | null>(null)

    const { request: saveRequest, requestState: saveState } = useRequestQuery({
        onSuccess: () => {
            toast.success("Configuración guardada")
            setDirty(false)
        },
        onError: (e) => { toast.error(`Error al guardar: ${e.message}`) },
    })

    // For variants (image flow) we only need the clean background to start
    // editing — the AI analysis pipeline is not used for image variants
    // because the layout is fully built in the Konva editor. For legacy
    // (no variant) we still require both files since the AI path lives
    // on the template-level columns.
    const filesReady = variant
        ? !!variant.template_file_url
        : !!template.template_file_url && !!template.reference_file_url

    const layersTemplate = draft?.layersTemplate ?? []

    // ---- Konva editor (posts) bridge ----
    // The Konva editor emits the current zones as Remotion layers on every
    // change. We keep a baseline to ignore the initial sync and avoid a
    // spurious dirty when the editor first mounts / reloads after analyze.
    const layersBaselineRef = useRef<string | null>(null)
    const handleLayersChange = useCallback((layers: EyrenderLayer[], canvas: { width: number; height: number }) => {
        // The Konva editor lays out in the background's natural pixel space, so
        // the canvas sent to Remotion MUST match it (same coordinate space) or
        // layers render scaled/offset. Always sync draft (incl. canvas); only
        // flag dirty on a real layer change after the initial mount.
        setDraft((prev) => {
            const base = prev ?? { compositionId: "still-composer", canvas: DEFAULT_CANVAS, layersTemplate: [] as EyrenderLayer[], analyzed_at: null }
            return { ...base, layersTemplate: layers, canvas: { ...base.canvas, width: canvas.width, height: canvas.height } }
        })
        const json = JSON.stringify(layers)
        if (layersBaselineRef.current === null) { layersBaselineRef.current = json; return }
        if (layersBaselineRef.current === json) return
        layersBaselineRef.current = json
        setDirty(true)
    }, [])

    // ---- Actions ----
    /**
     * Resolves the save endpoint. Variant context targets the nested
     * variant resource; legacy falls back to the template UPDATE route.
     */
    const buildSaveUrl = () => (
        variant
            ? API_ROUTES.TEMPLATES.VARIANTS.UPDATE
                .replace("{templateId}", template.id)
                .replace("{variantId}", variant.id)
            : API_ROUTES.TEMPLATES.UPDATE.replace("{id}", template.id)
    )

    const onSave = async () => {
        const renderConfig: RenderConfiguration = {
            compositionId: draft?.compositionId ?? "still-composer",
            canvas: draft?.canvas ?? DEFAULT_CANVAS,
            layersTemplate,
        }
        try {
            const res = await saveRequest<{ render_configuration: RenderConfiguration }, ITemplate | ITemplateVariant>(
                "PUT",
                buildSaveUrl(),
                { render_configuration: renderConfig }
            )
            if (res?.data) {
                publishEvent(BROWSER_EVENTS.TEMPLATE_DETAIL_UPDATED, res.data)
                setDraft({
                    compositionId: renderConfig.compositionId!,
                    canvas: renderConfig.canvas!,
                    layersTemplate,
                    analyzed_at: draft?.analyzed_at,
                })
            }
        } catch { /* toast in onError */ }
    }

    // ---- Manual JSON editor of render_configuration ----
    const buildRenderConfig = (): RenderConfiguration =>
        sourceRender ?? {
            compositionId: draft?.compositionId ?? "still-composer",
            canvas: draft?.canvas ?? DEFAULT_CANVAS,
            layersTemplate: draft?.layersTemplate ?? [],
        }

    const openJsonEditor = () => {
        setJsonValue(JSON.stringify(buildRenderConfig(), null, 2))
        setJsonError(null)
        setMode("json")
    }

    const onFormatJson = () => {
        try {
            setJsonValue(JSON.stringify(JSON.parse(jsonValue), null, 2))
            setJsonError(null)
        } catch (e) {
            setJsonError(e instanceof Error ? e.message : "JSON inválido")
        }
    }

    const onSaveJson = async () => {
        let parsed: RenderConfiguration
        try {
            parsed = JSON.parse(jsonValue)
        } catch (e) {
            setJsonError(e instanceof Error ? e.message : "JSON inválido")
            return
        }
        setJsonError(null)
        try {
            const res = await saveRequest<{ render_configuration: RenderConfiguration }, ITemplate | ITemplateVariant>(
                "PUT",
                buildSaveUrl(),
                { render_configuration: parsed }
            )
            if (res?.data) {
                publishEvent(BROWSER_EVENTS.TEMPLATE_DETAIL_UPDATED, res.data)
                layersBaselineRef.current = null
                setDraft({
                    compositionId: parsed.compositionId ?? "still-composer",
                    canvas: parsed.canvas ?? DEFAULT_CANVAS,
                    layersTemplate: parsed.layersTemplate ?? [],
                    analyzed_at: draft?.analyzed_at,
                })
                setDirty(false)
            }
        } catch { /* toast in onError */ }
    }

    const layerCount = useMemo(() => layersTemplate.length, [layersTemplate])

    // ---- Render ----
    if (!filesReady) {
        return (
            <Alert variant="default">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Falta el archivo base para usar el editor</AlertTitle>
                <AlertDescription>
                    {variant
                        ? "Sube la plantilla limpia en la variante antes de iniciar el editor."
                        : "Sube la plantilla vacía y la imagen de referencia en la pestaña Editar antes de iniciar el editor con IA."}
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-3">
            <EditorToolbar
                layerCount={layerCount}
                analyzedAt={draft?.analyzed_at}
                dirty={dirty}
                mode={mode}
                saving={saveState.loading}
                onTogglePreview={() => setMode((m) => m === "preview" ? "edit" : "preview")}
                onToggleJson={() => mode === "json" ? setMode("edit") : openJsonEditor()}
                onSave={onSave}
            />

            {mode === "preview" ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Vista previa con datos demo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EyrenderPreviewTemplate
                            template={template}
                            variant={variant}
                            disabled={dirty}
                            disabledReason={dirty ? "Guarda los cambios antes de generar la vista previa." : undefined}
                        />
                    </CardContent>
                </Card>
            ) : mode === "json" ? (
                <JsonEditor
                    value={jsonValue}
                    error={jsonError}
                    saving={saveState.loading}
                    onChange={(value) => {
                        setJsonValue(value)
                        if (jsonError) setJsonError(null)
                    }}
                    onFormat={onFormatJson}
                    onSave={onSaveJson}
                />
            ) : (
                <PostsLayoutEditor
                    key={draft?.analyzed_at || "empty"}
                    backgroundUrl={backgroundUrl}
                    initialLayers={layersTemplate}
                    onChange={handleLayersChange}
                    templateGroup={template.template_group}
                    templateSubgroup={template.template_subgroup}
                />
            )}
        </div>
    )
}

export default AIEditor
