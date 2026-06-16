import { ChevronDownIcon } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/uishadcn/ui/dropdown-menu"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/uishadcn/ui/input-group"
import ErrorText from "./ErrorText"
import { COUNTRIES } from "@/constants/app"

export interface PhoneValue {
    countryCode: string
    number: string
}

interface Props {
    label?: string
    error?: string
    value: PhoneValue
    onChange: (next: PhoneValue) => void
    onBlur?: () => void
    disabled?: boolean
}

const PhoneInput = ({ value, onChange, onBlur, error, disabled }: Props) => {
    const selected = COUNTRIES.find(c => c.code === value.countryCode) ?? COUNTRIES[0]

    const handleCountry = (countryCode: string) => {
        onChange({ ...value, countryCode })
    }

    const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        const onlyDigits = e.target.value.replace(/[^0-9]/g, "")
        onChange({ ...value, number: onlyDigits })
    }

    return (
        <div>
            <InputGroup className="[--radius:1rem]">
                <InputGroupAddon align="inline-start">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <InputGroupButton
                                variant="ghost"
                                size="sm"
                                aria-label="Código de país"
                                disabled={disabled}
                                className="gap-1.5 font-semibold"
                            >
                                <span className="text-base leading-none">{selected.flag}</span>
                                <span>{selected.dial}</span>
                                <ChevronDownIcon className="size-3 opacity-60" />
                            </InputGroupButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto [--radius:0.95rem]">
                            <DropdownMenuRadioGroup value={selected.code} onValueChange={handleCountry}>
                                {COUNTRIES.map(country => (
                                    <DropdownMenuRadioItem key={country.code} value={country.code}>
                                        <span className="inline-flex items-center gap-2">
                                            <span className="text-base leading-none">{country.flag}</span>
                                            <span>{country.name}</span>
                                            <span className="text-muted-foreground">{country.dial}</span>
                                        </span>
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </InputGroupAddon>
                <InputGroupInput
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="Número de WhatsApp"
                    aria-invalid={error ? "true" : "false"}
                    value={value.number}
                    onChange={handleNumber}
                    onBlur={onBlur}
                    disabled={disabled}
                />
            </InputGroup>
            {error && <ErrorText error={error} />}
        </div>
    )
}

export default PhoneInput
