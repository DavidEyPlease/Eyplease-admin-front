import { IClient } from "@/interfaces/clients"
import { ClientsService } from "@/services/clients.service"
import { CellContext } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { parsePhoneNumber } from "libphonenumber-js"
import PhoneInput, { PhoneValue } from "@/components/common/Inputs/PhoneInput"
import usePhoneValidation from "@/hooks/usePhoneValidation"
import { COUNTRIES, DEFAULT_COUNTRY_CODE } from "@/constants/app"

const toPhoneValue = (raw: unknown): PhoneValue => {
    const stored = typeof raw === 'string' ? raw.trim() : ''

    if (stored) {
        try {
            const parsed = parsePhoneNumber(stored)
            const country = parsed?.country
            if (country && COUNTRIES.some(c => c.code === country)) {
                return { countryCode: country, number: parsed.nationalNumber }
            }
        } catch {
            // Falls back to default country below
        }
    }

    return { countryCode: DEFAULT_COUNTRY_CODE, number: stored.replace(/[^0-9]/g, '') }
}

const toStoredValue = ({ countryCode, number }: PhoneValue): string => {
    if (!number) return ''
    const dial = COUNTRIES.find(c => c.code === countryCode)?.dial ?? ''
    return `${dial}${number}`
}

const EditablePhoneCell = ({
    getValue,
    row: { index, original },
    column: { id },
    table,
}: CellContext<IClient, unknown>) => {
    const rawValue = getValue()
    const { validate } = usePhoneValidation()

    const [value, setValue] = useState<PhoneValue>(() => toPhoneValue(rawValue))
    const [lastCommitted, setLastCommitted] = useState<string>(() => toStoredValue(toPhoneValue(rawValue)))
    const [error, setError] = useState<string>()

    useEffect(() => {
        const next = toPhoneValue(rawValue)
        setValue(next)
        setLastCommitted(toStoredValue(next))
        setError(undefined)
    }, [rawValue])

    // Empty clears the phone; any value must match the country format
    const validatePhone = (next: PhoneValue) => {
        if (!next.number) return { valid: true }
        return validate(next.number, next.countryCode)
    }

    const commitValue = (next: PhoneValue) => {
        const stored = toStoredValue(next)
        if (stored === lastCommitted) {
            setError(undefined)
            return
        }

        const { valid, message } = validatePhone(next)
        if (!valid) {
            setError(message)
            return
        }
        setError(undefined)

        table.options.meta?.updateData(index, id, stored)
        setLastCommitted(stored)

        const clientId = original?.id
        if (!clientId) return

        ClientsService.update(clientId, { phone: stored }).catch(() => {
            toast.error('Error al actualizar el teléfono')
            table.options.meta?.updateData(index, id, lastCommitted)
            setValue(toPhoneValue(lastCommitted))
            setLastCommitted(lastCommitted)
        })
    }

    const handleChange = (next: PhoneValue) => {
        setValue(next)

        // Live format feedback while typing / changing country
        const { valid, message } = validatePhone(next)
        setError(valid ? undefined : message)

        // Country changes are discrete actions, persist them right away
        if (valid && next.countryCode !== value.countryCode) {
            commitValue(next)
        }
    }

    return (
        <PhoneInput
            value={value}
            error={error}
            onChange={handleChange}
            onBlur={() => commitValue(value)}
        />
    )
}

export default EditablePhoneCell
