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
}

const AIEditor = ({ template }: IProps) => {
    // Load the editor fonts on demand (instead of in the root index.html).
    useEffect(() => { void ensureEditorFonts() }, [])

    const [draft, setDraft] = useState<AIDraft | null>(
        template.ai_draft_json ??
        (template.render_configuration?.layersTemplate
            ? {
                compositionId: template.render_configuration.compositionId || "still-composer",
                canvas: template.render_configuration.canvas || DEFAULT_CANVAS,
                layersTemplate: template.render_configuration.layersTemplate,
                analyzed_at: template.ai_analyzed_at,
            }
            : null)
    )
    const [mode, setMode] = useState<EditorMode>("edit")
    const [dirty, setDirty] = useState(false)
    const [jsonValue, setJsonValue] = useState("")
    const [jsonError, setJsonError] = useState<string | null>(null)

    const { request: analyzeRequest, requestState: analyzeState } = useRequestQuery({
        onError: (e) => { toast.error(`Error al analizar con IA: ${e.message}`) },
    })
    const { request: saveRequest, requestState: saveState } = useRequestQuery({
        onSuccess: () => {
            toast.success("Configuración guardada")
            setDirty(false)
        },
        onError: (e) => { toast.error(`Error al guardar: ${e.message}`) },
    })

    const filesReady = !!template.template_file_url && !!template.reference_file_url
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
    const onAnalyzeWithAI = async (force = false) => {
        try {
            const url = API_ROUTES.TEMPLATES.ANALYZE_WITH_AI.replace("{id}", template.id)
            const res = await analyzeRequest<{ force: boolean }, AIDraft>("POST", url, { force })
            if (res?.data) {
                layersBaselineRef.current = null
                setDraft(res.data)
                setDirty(false)
                if (res.data.cached) toast.info("Análisis recuperado de caché")
                else toast.success("Análisis de IA completado")
            }
        } catch { /* toast in onError */ }
    }

    const onSave = async () => {
        const renderConfig: RenderConfiguration = {
            compositionId: draft?.compositionId ?? "still-composer",
            canvas: draft?.canvas ?? DEFAULT_CANVAS,
            layersTemplate,
        }
        try {
            const url = API_ROUTES.TEMPLATES.UPDATE.replace("{id}", template.id)
            const res = await saveRequest<{ render_configuration: RenderConfiguration }, ITemplate>(
                "PUT",
                url,
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
        template.render_configuration ?? {
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
            const url = API_ROUTES.TEMPLATES.UPDATE.replace("{id}", template.id)
            const res = await saveRequest<{ render_configuration: RenderConfiguration }, ITemplate>(
                "PUT",
                url,
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
    const hasAIDraft = layerCount > 0

    // ---- Render ----
    if (!filesReady) {
        return (
            <Alert variant="default">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Faltan archivos para usar el editor</AlertTitle>
                <AlertDescription>
                    Sube la plantilla vacía y la imagen de referencia en la pestaña{" "}
                    <strong>Editar</strong> antes de iniciar el editor con IA.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-4">
            <EditorToolbar
                hasAIDraft={hasAIDraft}
                layerCount={layerCount}
                analyzedAt={draft?.analyzed_at}
                dirty={dirty}
                mode={mode}
                analyzing={analyzeState.loading}
                saving={saveState.loading}
                onAnalyze={() => onAnalyzeWithAI(hasAIDraft)}
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
                    backgroundUrl={template.template_file_url || ""}
                    initialLayers={layersTemplate}
                    onChange={handleLayersChange}
                    templateGroup={template.template_group}
                />
            )}
        </div>
    )
}

export default AIEditor
