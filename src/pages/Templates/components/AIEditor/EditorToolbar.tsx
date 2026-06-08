import {
    CheckCircle2Icon,
    Code2Icon,
    EyeIcon,
    SaveIcon,
} from "lucide-react"

import Button from "@/components/common/Button"
import { Badge } from "@/uishadcn/ui/badge"
import { Card, CardContent } from "@/uishadcn/ui/card"
import { formatDate } from "@/utils/dates"

import { EditorMode } from "./types"

interface IProps {
    layerCount: number
    analyzedAt?: string | null
    dirty: boolean
    mode: EditorMode
    saving: boolean
    onTogglePreview: () => void
    onToggleJson: () => void
    onSave: () => void
}

/**
 * Top action bar: layer-count / status badges on the left, editor actions
 * (preview / JSON / save) on the right. Compact size so it doesn't push
 * the editor canvas too far down on shorter viewports.
 */
const EditorToolbar = ({
    layerCount,
    analyzedAt,
    dirty,
    mode,
    saving,
    onTogglePreview,
    onToggleJson,
    onSave,
}: IProps) => (
    <Card className="py-0">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 px-3">
            <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default" className="bg-emerald-600 h-6">
                    <CheckCircle2Icon className="w-3 h-3 mr-1" />
                    {layerCount} capa{layerCount === 1 ? "" : "s"}
                </Badge>
                {/* {analyzedAt && (
                    <span className="text-[11px] text-muted-foreground">
                        Analizado el {formatDate(new Date(analyzedAt))}
                    </span>
                )} */}
                {dirty && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-900 h-6">
                        Cambios sin guardar
                    </Badge>
                )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    size="sm"
                    variant="outline"
                    text={<><EyeIcon className="w-3.5 h-3.5 mr-1.5" />{mode === "preview" ? "Volver al editor" : "Vista previa"}</>}
                    onClick={onTogglePreview}
                />
                <Button
                    size="sm"
                    variant="outline"
                    text={<><Code2Icon className="w-3.5 h-3.5 mr-1.5" />{mode === "json" ? "Volver al editor" : "Editar JSON"}</>}
                    onClick={onToggleJson}
                />
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

export default EditorToolbar
