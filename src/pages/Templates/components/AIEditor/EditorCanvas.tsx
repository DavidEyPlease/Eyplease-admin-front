import { RefObject } from "react"
import { SparklesIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/uishadcn/ui/card"

interface IProps {
    containerRef: RefObject<HTMLDivElement | null>
    /** Callback ref that creates/disposes the Fabric canvas (owned by parent). */
    canvasRef: (node: HTMLCanvasElement | null) => void
    /** Key forcing a full canvas remount when the draft changes. */
    canvasKey: string
    hasAIDraft: boolean
}

/**
 * The visual editor card hosting the Fabric `<canvas>`. The Fabric lifecycle
 * itself is owned by the parent through the `canvasRef` callback ref; this
 * component only renders the DOM and the empty/help overlays.
 */
const EditorCanvas = ({ containerRef, canvasRef, canvasKey, hasAIDraft }: IProps) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base">Editor visual</CardTitle>
        </CardHeader>
        <CardContent>
            <div
                ref={containerRef}
                className="relative flex justify-center bg-muted/30 rounded-md p-2 overflow-auto min-h-[400px]"
            >
                {/*
                  key changes between "empty" and the analyzed_at timestamp so
                  that going from "no draft" → "draft present" forces a full
                  canvas remount (callback ref disposes old Fabric, creates new
                  one). Same on re-analyze.
                */}
                <canvas key={canvasKey} ref={canvasRef} />
                {!hasAIDraft && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground text-center p-6 bg-background/80 backdrop-blur-sm">
                        <SparklesIcon className="w-10 h-10" />
                        <p className="text-sm max-w-xs">
                            Aún no se han detectado capas en esta plantilla. Haz click en <strong>Analizar con IA</strong> para empezar.
                        </p>
                    </div>
                )}
            </div>
            {hasAIDraft && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    Arrastra las cajas para reposicionar. Los textos son editables haciendo doble click.
                </p>
            )}
        </CardContent>
    </Card>
)

export default EditorCanvas
