import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Canvas, FabricImage, Textbox } from "fabric"
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
import EyrenderPreviewTemplate from "../EyrenderPreviewTemplate"
import EditorToolbar from "./EditorToolbar"
import EditorCanvas from "./EditorCanvas"
import JsonEditor from "./JsonEditor"
import PropertiesPanel from "./PropertiesPanel"
import { DEFAULT_CANVAS } from "./constants"
import { EditorMode } from "./types"
import {
    LayerObject,
    buildFabricObject,
    resolvePlaceholders,
    serializeCanvasToLayers,
} from "./utils"

interface IProps {
    template: ITemplate
}

const AIEditor = ({ template }: IProps) => {
    const canvasRef = useRef<Canvas | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const backgroundLoadedRef = useRef<string | null>(null)

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
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [, setSelectionVersion] = useState(0)
    const [mode, setMode] = useState<EditorMode>("edit")
    const [dirty, setDirty] = useState(false)
    const [canvasReady, setCanvasReady] = useState(false)
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
    const canvasDims = draft?.canvas ?? DEFAULT_CANVAS
    const mockValues = template.mock_values ?? null
    const selectedLayer = selectedIndex != null ? layersTemplate[selectedIndex] : null

    const buildLayerObject = useCallback(
        (layer: EyrenderLayer, index: number) => buildFabricObject(layer, index, mockValues),
        [mockValues],
    )

    /**
     * Compute display zoom based on container width and viewport height.
     */
    const computeZoom = useCallback(() => {
        const containerWidth = containerRef.current?.offsetWidth ?? 720
        const maxHeight = Math.max(400, window.innerHeight - 320)
        const zoomByWidth = containerWidth / canvasDims.width
        const zoomByHeight = maxHeight / canvasDims.height
        return Math.min(zoomByWidth, zoomByHeight, 1)
    }, [canvasDims.width, canvasDims.height])

    // ---- Callback ref: create / dispose Fabric Canvas in sync with DOM ----
    //
    // React calls a callback ref with `null` whenever the element unmounts
    // and with the new node when it mounts. This is the only way to reliably
    // tie Fabric's lifecycle to the canvas DOM element across:
    //   - First mount
    //   - Mode switch edit ↔ preview (canvas unmounts/remounts)
    //   - Forced remount via key (used to fully reset after analyze)
    //
    // Using a callback ref avoids the race conditions of useEffect deps when
    // multiple state transitions overlap.
    const canvasCallbackRef = useCallback((node: HTMLCanvasElement | null) => {
        // Dispose any existing Fabric instance
        if (canvasRef.current) {
            canvasRef.current.dispose().catch(() => { })
            canvasRef.current = null
            backgroundLoadedRef.current = null
        }

        if (!node) {
            setCanvasReady(false)
            return
        }

        const canvas = new Canvas(node, {
            backgroundColor: "#f5f5f5",
            preserveObjectStacking: true,
        })
        canvas.on("selection:created", () => {
            const obj = canvas.getActiveObject() as LayerObject | null
            setSelectedIndex(obj?.data?.layerIndex ?? null)
        })
        canvas.on("selection:updated", () => {
            const obj = canvas.getActiveObject() as LayerObject | null
            setSelectedIndex(obj?.data?.layerIndex ?? null)
        })
        canvas.on("selection:cleared", () => setSelectedIndex(null))
        canvas.on("object:modified", () => setDirty(true))

        canvasRef.current = canvas
        setCanvasReady(true)
    }, [])

    // ---- Effect 2: keep canvas size / zoom in sync ----
    useEffect(() => {
        if (!canvasReady || !canvasRef.current) return
        const canvas = canvasRef.current
        const zoom = computeZoom()
        canvas.setDimensions({
            width: canvasDims.width * zoom,
            height: canvasDims.height * zoom,
        })
        canvas.setZoom(zoom)
        canvas.requestRenderAll()

        // Update on resize
        const handleResize = () => {
            const newZoom = computeZoom()
            canvas.setDimensions({
                width: canvasDims.width * newZoom,
                height: canvasDims.height * newZoom,
            })
            canvas.setZoom(newZoom)
            canvas.requestRenderAll()
        }
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [canvasReady, canvasDims.width, canvasDims.height, computeZoom])

    // ---- Effect 3: load / refresh background ----
    useEffect(() => {
        if (!canvasReady || !canvasRef.current) return
        const canvas = canvasRef.current
        const bgUrl = template.template_file_url
        if (!bgUrl || backgroundLoadedRef.current === bgUrl) return

        // Same strategy as layer images: skip crossOrigin so S3 objects
        // without CORS still load (canvas will be tainted, which is fine
        // since we don't export it).
        FabricImage.fromURL(bgUrl)
            .then((img) => {
                if (!canvasRef.current) return
                const scaleX = canvasDims.width / (img.width || canvasDims.width)
                const scaleY = canvasDims.height / (img.height || canvasDims.height)
                const scale = Math.max(scaleX, scaleY) // cover
                img.set({
                    left: 0,
                    top: 0,
                    originX: "left",
                    originY: "top",
                    scaleX: scale,
                    scaleY: scale,
                    selectable: false,
                    evented: false,
                })
                canvas.backgroundImage = img
                backgroundLoadedRef.current = bgUrl
                canvas.requestRenderAll()
            })
            .catch((err) => {
                console.warn("[AIEditor] Failed to load background:", err)
                toast.error("No se pudo cargar la imagen base")
            })
    }, [canvasReady, template.template_file_url, canvasDims.width, canvasDims.height])

    // ---- Effect 4: sync layers to canvas when draft changes ----
    useEffect(() => {
        if (!canvasReady || !canvasRef.current) return
        const canvas = canvasRef.current

        // Remove all existing layer objects
        canvas.getObjects().forEach((obj) => canvas.remove(obj))
        setSelectedIndex(null)

        if (!layersTemplate.length) {
            canvas.requestRenderAll()
            return
        }

        let cancelled = false
        Promise.all(layersTemplate.map((l, i) => buildLayerObject(l, i)))
            .then(async (objects) => {
                if (cancelled || !canvasRef.current) return
                objects.forEach((obj) => obj && canvasRef.current!.add(obj))
                canvasRef.current.requestRenderAll()

                // After all preloaded Google Fonts finish loading, force a
                // second render — Fabric measured text with whatever font was
                // available at build time. The re-render picks up the final
                // metrics so the editor matches eyrender exactly.
                try {
                    await document.fonts.ready
                    if (cancelled || !canvasRef.current) return
                    // Tell each Textbox to re-measure
                    canvasRef.current.getObjects().forEach((o) => {
                        if ((o as LayerObject).data?.layer.type === "text") {
                            (o as unknown as Textbox).initDimensions()
                        }
                    })
                    canvasRef.current.requestRenderAll()
                } catch { /* ignore */ }
            })
            .catch(() => { })

        return () => { cancelled = true }
    }, [canvasReady, layersTemplate, buildLayerObject])

    // ---- Actions ----
    const onAnalyzeWithAI = async (force = false) => {
        try {
            const url = API_ROUTES.TEMPLATES.ANALYZE_WITH_AI.replace("{id}", template.id)
            const res = await analyzeRequest<{ force: boolean }, AIDraft>("POST", url, { force })
            if (res?.data) {
                setDraft(res.data)
                setDirty(false)
                if (res.data.cached) toast.info("Análisis recuperado de caché")
                else toast.success("Análisis de IA completado")
            }
        } catch { /* toast in onError */ }
    }

    const onSave = async () => {
        const newLayers = serializeCanvasToLayers(canvasRef.current, layersTemplate)
        const renderConfig: RenderConfiguration = {
            compositionId: draft?.compositionId ?? "still-composer",
            canvas: draft?.canvas ?? DEFAULT_CANVAS,
            layersTemplate: newLayers,
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
                    layersTemplate: newLayers,
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

    // Mutate a layer's stored payload AND update the Fabric object
    const updateSelected = (patch: Partial<EyrenderLayer>) => {
        if (selectedIndex == null || !canvasRef.current) return
        const canvas = canvasRef.current
        const obj = canvas.getObjects().find(
            (o) => (o as LayerObject).data?.layerIndex === selectedIndex
        ) as LayerObject | undefined
        if (!obj?.data) return

        const layer = obj.data.layer

        if (layer.type === "text") {
            const tb = obj as unknown as Textbox
            const merged = { ...layer, ...patch } as Extract<EyrenderLayer, { type: "text" }>
            obj.data.layer = merged
            if ("text" in patch) tb.set({ text: resolvePlaceholders(merged.text, mockValues) })
            if ("fontSize" in patch && patch.fontSize !== undefined) tb.set({ fontSize: patch.fontSize })
            if ("fontFamily" in patch && patch.fontFamily !== undefined) tb.set({ fontFamily: patch.fontFamily })
            if ("color" in patch && patch.color !== undefined) tb.set({ fill: patch.color })
            if ("fontStyle" in patch && patch.fontStyle !== undefined) tb.set({ fontStyle: patch.fontStyle as "normal" | "italic" })
            if ("fontWeight" in patch && patch.fontWeight !== undefined) tb.set({ fontWeight: patch.fontWeight })
            if ("align" in patch && patch.align !== undefined) tb.set({ textAlign: patch.align as "left" | "center" | "right" })
        } else {
            const merged = { ...layer, ...patch } as Extract<EyrenderLayer, { type: "image" }>
            obj.data.layer = merged
            // For image layers we only persist the patch; visual update on
            // src/clipShape/fit requires rebuilding the object — handled on
            // next analyze/save cycle (good enough for editor).
        }

        canvasRef.current.requestRenderAll()
        setDirty(true)
        setSelectionVersion((v) => v + 1)
    }

    const deleteSelected = () => {
        if (selectedIndex == null || !canvasRef.current) return
        const canvas = canvasRef.current
        const obj = canvas.getObjects().find(
            (o) => (o as LayerObject).data?.layerIndex === selectedIndex
        )
        if (obj) {
            canvas.remove(obj)
            canvas.discardActiveObject()
            canvas.requestRenderAll()
        }
        setSelectedIndex(null)
        setDirty(true)
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
                <div className="grid lg:grid-cols-[1fr_320px] gap-4">
                    <EditorCanvas
                        containerRef={containerRef}
                        canvasRef={canvasCallbackRef}
                        canvasKey={draft?.analyzed_at || "empty"}
                        hasAIDraft={hasAIDraft}
                    />
                    <PropertiesPanel
                        selectedLayer={selectedLayer}
                        selectionKey={selectedIndex}
                        onChange={updateSelected}
                        onDelete={deleteSelected}
                    />
                </div>
            )}
        </div>
    )
}

export default AIEditor
