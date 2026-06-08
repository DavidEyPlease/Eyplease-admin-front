import {
    CheckCircle2Icon,
    ClipboardCopyIcon,
    Code2Icon,
    EyeIcon,
    RefreshCwIcon,
    SaveIcon,
    SparklesIcon,
} from "lucide-react"

import Button from "@/components/common/Button"
import { Badge } from "@/uishadcn/ui/badge"
import { Card, CardContent } from "@/uishadcn/ui/card"
import { formatDate } from "@/utils/dates"

export type VideoEditorMode = "layers" | "preview" | "json"

interface IProps {
    layerCount: number
    analyzedAt?: string | null
    dirty: boolean
    hasAnalysis: boolean
    mode: VideoEditorMode
    analyzing: boolean
    saving: boolean
    onAnalyze: () => void
    onTogglePreview: () => void
    onToggleJson: () => void
    onSave: () => void
    /**
     * Copy the current analysis as a render config ready to paste into
     * eyrender-studio: prepends a background layer pointing at the clean
     * video and resolves placeholders with mock/default data.
     */
    onCopyStudioJson: () => void
}

/**
 * Toolbar for the video variant editor. Layout mirrors the image toolbar
 * but the primary action is AI analysis (video has no Konva editing). The
 * analyze button flips its label between "Analizar" / "Re-analizar"
 * depending on whether a draft is already present.
 */
const VideoEditorToolbar = ({
    layerCount,
    analyzedAt,
    dirty,
    hasAnalysis,
    mode,
    analyzing,
    saving,
    onAnalyze,
    onTogglePreview,
    onToggleJson,
    onSave,
    onCopyStudioJson,
}: IProps) => (
    <Card className="py-0">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
            <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default" className="bg-emerald-600 h-6">
                    <CheckCircle2Icon className="w-3 h-3 mr-1" />
                    {layerCount} capa{layerCount === 1 ? "" : "s"}
                </Badge>
                {analyzedAt && (
                    <span className="text-[11px] text-muted-foreground">
                        Analizado el {formatDate(new Date(analyzedAt))}
                    </span>
                )}
                {dirty && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-900 h-6">
                        Cambios sin guardar
                    </Badge>
                )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    size="sm"
                    variant={hasAnalysis ? "outline" : undefined}
                    text={
                        <>
                            {hasAnalysis
                                ? <RefreshCwIcon className="w-3.5 h-3.5 mr-1.5" />
                                : <SparklesIcon className="w-3.5 h-3.5 mr-1.5" />}
                            {hasAnalysis ? "Re-analizar" : "Analizar con IA"}
                        </>
                    }
                    loading={analyzing}
                    onClick={onAnalyze}
                />
                <Button
                    size="sm"
                    variant="outline"
                    text={<><EyeIcon className="w-3.5 h-3.5 mr-1.5" />{mode === "preview" ? "Volver" : "Vista previa"}</>}
                    onClick={onTogglePreview}
                />
                <Button
                    size="sm"
                    variant="outline"
                    text={<><Code2Icon className="w-3.5 h-3.5 mr-1.5" />{mode === "json" ? "Volver" : "Editar JSON"}</>}
                    onClick={onToggleJson}
                />
                {hasAnalysis && (
                    <Button
                        size="sm"
                        variant="outline"
                        text={<><ClipboardCopyIcon className="w-3.5 h-3.5 mr-1.5" />Copiar Studio JSON</>}
                        onClick={onCopyStudioJson}
                    />
                )}
                <Button
                    size="sm"
                    color="primary"
                    text={<><SaveIcon className="w-3.5 h-3.5 mr-1.5" />Guardar</>}
                    disabled={!dirty}
                    loading={saving}
                    onClick={onSave}
                />
            </div>
        </CardContent>
    </Card>
)

export default VideoEditorToolbar
