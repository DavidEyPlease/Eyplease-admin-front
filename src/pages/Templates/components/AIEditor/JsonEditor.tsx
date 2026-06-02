import { Code2Icon, SaveIcon } from "lucide-react"

import Button from "@/components/common/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/uishadcn/ui/card"
import { Textarea } from "@/uishadcn/ui/textarea"

interface IProps {
    value: string
    error: string | null
    saving: boolean
    onChange: (value: string) => void
    onFormat: () => void
    onSave: () => void
}

/**
 * Raw `render_configuration` editor: a JSON textarea with format and save
 * actions. Validation/parsing live in the parent.
 */
const JsonEditor = ({ value, error, saving, onChange, onFormat, onSave }: IProps) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base">Editor manual de render_configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
                rows={20}
                className="font-mono text-xs min-h-80"
                aria-invalid={!!error}
                placeholder="{}"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    text={<><Code2Icon className="w-4 h-4 mr-2" />Formatear JSON</>}
                    onClick={onFormat}
                />
                <Button
                    color="primary"
                    rounded
                    text={<><SaveIcon className="w-4 h-4 mr-2" />Guardar JSON</>}
                    loading={saving}
                    onClick={onSave}
                />
            </div>
        </CardContent>
    </Card>
)

export default JsonEditor
