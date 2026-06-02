import {
    AlertCircleIcon,
    CheckCircle2Icon,
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

import { EditorMode } from "./types"

interface IProps {
    hasAIDraft: boolean
    layerCount: number
    analyzedAt?: string | null
    dirty: boolean
    mode: EditorMode
    analyzing: boolean
    saving: boolean
    onAnalyze: () => void
    onTogglePreview: () => void
    onToggleJson: () => void
    onSave: () => void
}

/**
 * Top action bar: analysis status badges on the left, editor actions
 * (analyze / preview / JSON / save) on the right.
 */
const EditorToolbar = ({
    hasAIDraft,
    layerCount,
    analyzedAt,
    dirty,
    mode,
    analyzing,
    saving,
    onAnalyze,
    onTogglePreview,
    onToggleJson,
    onSave,
}: IProps) => (
    <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
                {hasAIDraft ? (
                    <Badge variant="default" className="bg-emerald-600">
                        <CheckCircle2Icon className="w-3.5 h-3.5 mr-1" />
                        {layerCount} capa{layerCount === 1 ? "" : "s"} detectada{layerCount === 1 ? "" : "s"}
                    </Badge>
                ) : (
                    <Badge variant="secondary">
                        <AlertCircleIcon className="w-3.5 h-3.5 mr-1" />
                        Sin análisis aún
                    </Badge>
                )}
                {analyzedAt && (
                    <span className="text-xs text-muted-foreground">
                        Analizado el {formatDate(new Date(analyzedAt))}
                    </span>
                )}
                {dirty && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-900">
                        Cambios sin guardar
                    </Badge>
                )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    variant={hasAIDraft ? "outline" : undefined}
                    text={
                        <>
                            {hasAIDraft
                                ? <RefreshCwIcon className="w-4 h-4 mr-2" />
                                : <SparklesIcon className="w-4 h-4 mr-2" />}
                            {hasAIDraft ? "Re-analizar con IA" : "Analizar con IA"}
                        </>
                    }
                    loading={analyzing}
                    onClick={onAnalyze}
                />
                <Button
                    variant="outline"
                    text={<><EyeIcon className="w-4 h-4 mr-2" />{mode === "preview" ? "Volver al editor" : "Vista previa"}</>}
                    onClick={onTogglePreview}
                    disabled={!hasAIDraft}
                />
                <Button
                    variant="outline"
                    text={<><Code2Icon className="w-4 h-4 mr-2" />{mode === "json" ? "Volver al editor" : "Editar JSON"}</>}
                    onClick={onToggleJson}
                />
                <Button
                    color="primary"
                    text={<><SaveIcon className="w-4 h-4 mr-2" />Guardar</>}
                    disabled={!hasAIDraft || !dirty}
                    loading={saving}
                    onClick={onSave}
                />
            </div>
        </CardContent>
    </Card>
)

export default EditorToolbar
