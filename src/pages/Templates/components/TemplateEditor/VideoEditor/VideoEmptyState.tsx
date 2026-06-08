import { AlertCircleIcon, SparklesIcon } from "lucide-react"

import Button from "@/components/common/Button"
import { Alert, AlertDescription, AlertTitle } from "@/uishadcn/ui/alert"

interface VideoEmptyStateProps {
    /**
     * Variant lacks the base files needed by the AI flow. Takes priority
     * over `needsPreset` because without files nothing else matters.
     */
    needsFiles: boolean
    /**
     * The parent template has no `preset_slug`. The video pipeline can't
     * even start without it (it declares the layer set to the model).
     */
    needsPreset: boolean
    analyzing: boolean
    onAnalyze: () => void
}

const VideoEmptyState = ({ needsFiles, needsPreset, analyzing, onAnalyze }: VideoEmptyStateProps) => {
    if (needsFiles) {
        return (
            <Alert>
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Faltan archivos para usar la IA</AlertTitle>
                <AlertDescription>
                    Sube la plantilla limpia y la referencia renderizada en la variante (desde el menú "Editar archivos") antes de analizarla con IA.
                </AlertDescription>
            </Alert>
        )
    }

    if (needsPreset) {
        return (
            <Alert>
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Falta el preset de IA en este template</AlertTitle>
                <AlertDescription>
                    Selecciona un preset en la pestaña <strong>Información</strong> → <strong>Editar información</strong>. El preset declara las capas que la IA debe detectar (foto, nombre, puntos, etc.).
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[360px] gap-4 border border-dashed rounded-md bg-muted/30 px-6 text-center">
            <div className="rounded-full bg-primary/10 p-4">
                <SparklesIcon className="w-8 h-8 text-primary" />
            </div>
            <div className="max-w-md space-y-1">
                <h3 className="text-base font-semibold">Sin capas configuradas</h3>
                <p className="text-sm text-muted-foreground">
                    Analiza el video con IA para detectar automáticamente las capas a renderizar. Después podrás refinarlas en el editor JSON.
                </p>
            </div>
            <Button
                color="primary"
                text={<><SparklesIcon className="w-4 h-4 mr-2" />Analizar con IA</>}
                loading={analyzing}
                onClick={onAnalyze}
            />
        </div>
    )
}

export default VideoEmptyState
