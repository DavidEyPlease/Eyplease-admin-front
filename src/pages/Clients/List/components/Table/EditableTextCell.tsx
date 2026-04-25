import { IClient } from "@/interfaces/clients"
import { ClientsService } from "@/services/clients.service"
import { CellContext } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const EditableTextCell = ({
    getValue,
    row: { index, original },
    column: { id },
    table,
}: CellContext<IClient, unknown>) => {
    const initialValue = getValue()
    const [value, setValue] = useState(initialValue)
    const [lastCommitted, setLastCommitted] = useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
        setLastCommitted(initialValue)
    }, [initialValue])

    const commitValue = () => {
        const trimmed = typeof value === 'string' ? value.trim() : value
        if (trimmed === lastCommitted) return

        table.options.meta?.updateData(index, id, trimmed)
        setLastCommitted(trimmed)

        const clientId = original?.id
        if (clientId) {
            ClientsService.update(clientId, { [id]: trimmed }).catch(() => {
                toast.error('Error al actualizar el campo')
                table.options.meta?.updateData(index, id, lastCommitted)
                setValue(lastCommitted)
                setLastCommitted(lastCommitted)
            })
        }
    }

    return (
        <input
            value={(value ?? '') as string | number}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commitValue}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    commitValue()
                    e.currentTarget.blur()
                }
                if (e.key === 'Escape') {
                    setValue(lastCommitted)
                    e.currentTarget.blur()
                }
            }}
            className="w-full border-0 bg-transparent p-0 text-inherit outline-none focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder=""
        />
    )
}

export default EditableTextCell