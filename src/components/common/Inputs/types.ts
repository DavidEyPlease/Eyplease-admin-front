// import { AutocompleteItem } from "@/types/common"
import { UseFormRegisterReturn } from "react-hook-form"

type BaseInputProps = {
    label: string
    variant?: "bordered" | "flat" | "faded" | "underlined"
    error?: string
    placeholder?: string
    isRequired?: boolean
    disabled?: boolean
    readonly?: boolean
    className?: string
}

export interface TextInputProps extends BaseInputProps {
    type?: string
    value?: string
    register?: UseFormRegisterReturn<string>
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

// export interface SelectProps extends BaseInputProps {
//     items: Iterable<AutocompleteItem>
//     register?: UseFormRegisterReturn<string>
// }

export interface AutocompleteProps extends BaseInputProps {
    value?: string | number
    endpoint: string
    keyValue?: string
    keyLabel?: string
    register?: UseFormRegisterReturn<string>
    onSelected?: (key: string | number) => void
}

export interface DatePickerProps extends BaseInputProps {
    value?: Date
    onChange: (date: Date) => void
}

export interface NumericInputProps extends BaseInputProps {
    value?: number | string
    decimalScale?: number
    prefix?: string
    suffix?: string
    register?: UseFormRegisterReturn<string>
    dataType?: 'number' | 'string'
    onChange: (number: number | string) => void
}

export type SwitchInputProps = {
    id: string;
    label?: string;
    checked?: boolean;
    disabled?: boolean;
    badge?: boolean;
    loading?: boolean
    className?: string
    onCheckedChange?: (checked: boolean) => void;
}