import { Input } from "@/uishadcn/ui/input"
import { Label } from "@/uishadcn/ui/label"
import Spinner from "../Spinner"
import { cn } from "@/lib/utils"

interface InputFileProps {
    id: string
    label?: string
    multiple?: boolean
    accept?: string
    loading?: boolean
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function InputFile({ id, accept = '*', loading, multiple, label = 'Seleccionar archivo', onChange }: InputFileProps) {
    return (
        <Label htmlFor={id} className={cn({
            'cursor-pointer': !loading,
            'cursor-not-allowed opacity-70': loading
        })}>
            <div className="text-sm flex-1 flex gap-2 items-center mb-2 font-medium px-3 py-2 border border-primary rounded-lg text-indigo-600 hover:text-indigo-500">
                <span>
                    {label}
                </span>
                {loading && <Spinner size="sm" className="w-max" />}
            </div>

            <Input
                id={id}
                type="file"
                multiple={multiple}
                className="hidden"
                accept={accept}
                disabled={loading}
                onChange={onChange}
            />
        </Label>
    )
}
