import { useState } from "react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/uishadcn/ui/card"
import { API_ROUTES } from "@/constants/api"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import useRequestQuery from "@/hooks/useRequestQuery"
import {
    AIDraft,
    ITemplate,
    ITemplateVariant,
    RenderConfiguration,
} from "@/interfaces/templates"
import { ApiResponse } from "@/interfaces/common"
import { publishEvent } from "@/utils/events"

import EyrenderPreviewTemplate from "../../EyrenderPreviewTemplate"
import JsonEditor from "../../AIEditor/JsonEditor"
import VideoEditorToolbar, { VideoEditorMode } from "./VideoEditorToolbar"
import VideoEmptyState from "./VideoEmptyState"
import VideoLayersList from "./VideoLayersList"
import { buildStudioJson } from "./buildStudioJson"

// Reasonable fallback for video variants. Real draft canvases come from the
// AI analysis or the saved render_configuration; this is only used when
// constructing an empty payload on save.
const DEFAULT_VIDEO_CANVAS = {
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 390,
}

interface AnalyzeResponse {
    template_id: string
    variant_id: string | null
    draft: AIDraft
}

interface VideoEditorProps {
    template: ITemplate
    variant: ITemplateVariant
}

const buildInitialDraft = (variant: ITemplateVariant): AIDraft | null => {
    const rc = variant.render_configuration
    if (rc?.layersTemplate?.length) {
        return {
            compositionId: rc.compositionId || "video-composer",
            canvas: rc.canvas || DEFAULT_VIDEO_CANVAS,
            layersTemplate: rc.layersTemplate,
            analyzed_at: variant.ai_analyzed_at,
        }
    }
    return variant.ai_draft_json ?? null
}

const VideoEditor = ({ template, variant }: VideoEditorProps) => {
    const [draft, setDraft] = useState<AIDraft | null>(() => buildInitialDraft(variant))
    const [mode, setMode] = useState<VideoEditorMode>("layers")
    const [dirty, setDirty] = useState(false)
    const [jsonValue, setJsonValue] = useState("")
    const [jsonError, setJsonError] = useState<string | null>(null)

    const hasAnalysis = !!draft && draft.layersTemplate.length > 0
    const filesReady = !!variant.template_file_url && !!variant.reference_file_url
    const hasPreset = !!template.preset_slug
    // The video pipeline requires both files AND a preset_slug — without
    // the preset, the backend has no layer list to feed the model.
    const canAnalyze = filesReady && hasPreset

    // ---- API hooks ----
    const { request: analyzeRequest, requestState: analyzeState } = useRequestQuery({
        onSuccess: (response: ApiResponse<AnalyzeResponse>) => {
            const draftPayload = response?.data?.draft
            if (!draftPayload) return
            setDraft({
                compositionId: draftPayload.compositionId,
                canvas: draftPayload.canvas,
                layersTemplate: draftPayload.layersTemplate ?? [],
                analyzed_at: draftPayload.analyzed_at ?? new Date().toISOString(),
            })
            setDirty(true)
            setMode("layers")
            if (draftPayload.cached) {
                toast.info("Análisis recuperado de caché")
            } else {
                toast.success("Análisis IA completado")
            }
        },
        onError: error => { toast.error(`Error al analizar: ${error.message}`) },
    })

    const { request: saveRequest, requestState: saveState } = useRequestQuery({
        onSuccess: () => {
            toast.success("Configuración guardada")
            setDirty(false)
        },
        onError: error => { toast.error(`Error al guardar: ${error.message}`) },
    })

    // ---- Actions ----
    const buildSaveUrl = () => API_ROUTES.TEMPLATES.VARIANTS.UPDATE
        .replace("{templateId}", template.id)
        .replace("{variantId}", variant.id)

    const onAnalyze = (force = false) => {
        const baseUrl = API_ROUTES.TEMPLATES.ANALYZE_WITH_AI.replace("{id}", template.id)
        const url = `${baseUrl}?variant_id=${variant.id}`
        void analyzeRequest<{ force: boolean }, AnalyzeResponse>("POST", url, { force })
    }

    const onSave = async () => {
        const renderConfig: RenderConfiguration = {
            compositionId: draft?.compositionId ?? "video-composer",
            canvas: draft?.canvas ?? DEFAULT_VIDEO_CANVAS,
            layersTemplate: draft?.layersTemplate ?? [],
        }
        try {
            const res = await saveRequest<{ render_configuration: RenderConfiguration }, ITemplateVariant>(
                "PUT",
                buildSaveUrl(),
                { render_configuration: renderConfig },
            )
            if (res?.data) {
                publishEvent(BROWSER_EVENTS.TEMPLATE_DETAIL_UPDATED, res.data)
            }
        } catch { /* toast in onError */ }
    }

    const openJsonEditor = () => {
        const current: RenderConfiguration = variant.render_configuration ?? {
            compositionId: draft?.compositionId ?? "video-composer",
            canvas: draft?.canvas ?? DEFAULT_VIDEO_CANVAS,
            layersTemplate: draft?.layersTemplate ?? [],
        }
        setJsonValue(JSON.stringify(current, null, 2))
        setJsonError(null)
        setMode("json")
    }

    const onFormatJson = () => {
        try {
            setJsonValue(JSON.stringify(JSON.parse(jsonValue), null, 2))
            setJsonError(null)
        } catch (error) {
            setJsonError(error instanceof Error ? error.message : "JSON inválido")
        }
    }

    const onSaveJson = async () => {
        let parsed: RenderConfiguration
        try {
            parsed = JSON.parse(jsonValue)
        } catch (error) {
            setJsonError(error instanceof Error ? error.message : "JSON inválido")
            return
        }
        setJsonError(null)
        try {
            const res = await saveRequest<{ render_configuration: RenderConfiguration }, ITemplateVariant>(
                "PUT",
                buildSaveUrl(),
                { render_configuration: parsed },
            )
            if (res?.data) {
                publishEvent(BROWSER_EVENTS.TEMPLATE_DETAIL_UPDATED, res.data)
                setDraft({
                    compositionId: parsed.compositionId ?? "video-composer",
                    canvas: parsed.canvas ?? DEFAULT_VIDEO_CANVAS,
                    layersTemplate: parsed.layersTemplate ?? [],
                    analyzed_at: draft?.analyzed_at,
                })
                setDirty(false)
                setMode("layers")
            }
        } catch { /* toast in onError */ }
    }

    const tryAnalyze = (force: boolean) => {
        if (!canAnalyze) return
        onAnalyze(force)
    }

    /**
     * Copy a studio-ready render configuration to the clipboard:
     * background layer prepended + placeholders resolved with mock data.
     * Only callable when an analysis exists (button is hidden otherwise).
     */
    const onCopyStudioJson = async () => {
        if (!draft) return
        const payload = buildStudioJson(draft, variant, template)
        const serialized = JSON.stringify(payload, null, 2)
        try {
            await navigator.clipboard.writeText(serialized)
            toast.success("JSON copiado al portapapeles")
        } catch {
            toast.error("No se pudo copiar al portapapeles")
        }
    }

    // ---- Render ----
    // Single render path. The toolbar is always shown so users can jump
    // into the JSON editor even without an AI analysis — handy when
    // copy-pasting the config from a similar template instead of running
    // the model again.
    return (
        <div className="space-y-3">
            <VideoEditorToolbar
                layerCount={draft?.layersTemplate.length ?? 0}
                analyzedAt={draft?.analyzed_at}
                dirty={dirty}
                hasAnalysis={hasAnalysis}
                mode={mode}
                analyzing={analyzeState.loading}
                saving={saveState.loading}
                // First analysis → force=false (use cache). Re-analysis on
                // an existing draft → force=true to bypass the URL-hash cache.
                onAnalyze={() => tryAnalyze(hasAnalysis)}
                onTogglePreview={() => setMode(m => m === "preview" ? "layers" : "preview")}
                onToggleJson={() => mode === "json" ? setMode("layers") : openJsonEditor()}
                onSave={onSave}
                onCopyStudioJson={onCopyStudioJson}
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
                    onChange={value => {
                        setJsonValue(value)
                        if (jsonError) setJsonError(null)
                    }}
                    onFormat={onFormatJson}
                    onSave={onSaveJson}
                />
            ) : !hasAnalysis ? (
                <VideoEmptyState
                    needsFiles={!filesReady}
                    needsPreset={filesReady && !hasPreset}
                    analyzing={analyzeState.loading}
                    onAnalyze={() => tryAnalyze(false)}
                />
            ) : (
                <VideoLayersList
                    layers={draft?.layersTemplate ?? []}
                    canvas={draft?.canvas}
                />
            )}
        </div>
    )
}

export default VideoEditor
