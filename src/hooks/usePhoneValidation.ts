import { useCallback } from "react"
import { isValidPhoneNumber, type CountryCode } from "libphonenumber-js"

export interface PhoneValidationResult {
    valid: boolean
    message?: string
}

const usePhoneValidation = () => {
    const validate = useCallback((phoneNumber: string, countryCode: string): PhoneValidationResult => {
        const trimmed = (phoneNumber ?? '').trim()
        if (!countryCode) {
            return { valid: false, message: 'Selecciona un país' }
        }
        if (!trimmed) {
            return { valid: false, message: 'Ingresa tu WhatsApp' }
        }
        console.log(isValidPhoneNumber(trimmed, countryCode as CountryCode))
        if (!isValidPhoneNumber(trimmed, countryCode as CountryCode)) {
            return { valid: false, message: 'Número inválido para el país seleccionado' }
        }
        return { valid: true }
    }, [])

    return { validate }
}

export default usePhoneValidation
