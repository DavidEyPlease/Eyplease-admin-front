import { EyrenderLayer } from "@/interfaces/templates"
import VideoLayerCard from "./VideoLayerCard"

interface VideoLayersListProps {
    layers: EyrenderLayer[]
    canvas?: {
        width: number
        height: number
        fps: number
        durationInFrames: number
    }
}

const VideoLayersList = ({ layers, canvas }: VideoLayersListProps) => (
    <div className="flex flex-col gap-4">
        {canvas && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                    <span className="font-semibold text-foreground">Canvas:</span> {canvas.width} × {canvas.height}
                </span>
                <span>
                    <span className="font-semibold text-foreground">FPS:</span> {canvas.fps}
                </span>
                <span>
                    <span className="font-semibold text-foreground">Duración:</span> {canvas.durationInFrames} frames
                    {canvas.fps > 0 && ` (${(canvas.durationInFrames / canvas.fps).toFixed(1)}s)`}
                </span>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {layers.map((layer, index) => (
                <VideoLayerCard
                    key={layer.id ?? `${layer.data_key ?? "layer"}-${index}`}
                    layer={layer}
                    index={index}
                />
            ))}
        </div>
    </div>
)

export default VideoLayersList
