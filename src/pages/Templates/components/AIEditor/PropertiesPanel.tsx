import { ImageIcon, TypeIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/uishadcn/ui/card"
import { EyrenderLayer } from "@/interfaces/templates"

import SelectedTextPanel from "./SelectedTextPanel"
import SelectedImagePanel from "./SelectedImagePanel"

interface IProps {
    selectedLayer: EyrenderLayer | null
    /** Index of the selected layer, used to remount the panel on change. */
    selectionKey: number | null
    onChange: (patch: Partial<EyrenderLayer>) => void
    onDelete: () => void
}

/**
 * Right-hand column showing the property editor for the currently selected
 * layer (or an empty state when nothing is selected).
 */
const PropertiesPanel = ({ selectedLayer, selectionKey, onChange, onDelete }: IProps) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
                {selectedLayer?.type === "text"
                    ? <TypeIcon className="w-4 h-4" />
                    : selectedLayer?.type === "image"
                        ? <ImageIcon className="w-4 h-4" />
                        : null}
                Propiedades
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {!selectedLayer && (
                <p className="text-xs text-muted-foreground">
                    Selecciona una capa en el canvas para ver sus propiedades.
                </p>
            )}
            {selectedLayer?.type === "text" && (
                <SelectedTextPanel
                    key={selectionKey ?? "none"}
                    layer={selectedLayer}
                    onChange={onChange}
                    onDelete={onDelete}
                />
            )}
            {selectedLayer?.type === "image" && (
                <SelectedImagePanel
                    key={selectionKey ?? "none"}
                    layer={selectedLayer}
                    onChange={onChange}
                    onDelete={onDelete}
                />
            )}
        </CardContent>
    </Card>
)

export default PropertiesPanel
