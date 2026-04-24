import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/uishadcn/ui/command"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import Button from "../common/Button"
import useFetchQuery from "@/hooks/useFetchQuery"
import { queryKeys } from "@/utils/queryKeys"
import { INetworkPerson } from "@/interfaces/vendors"
import { API_ROUTES } from "@/constants/api"

const SEARCH_DELAY_MS = 400
const MIN_SEARCH_LENGTH = 2

const NetworkPeopleSearch = () => {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(inputValue)
        }, SEARCH_DELAY_MS)
        return () => clearTimeout(timer)
    }, [inputValue])

    const isSearchEnabled = debouncedSearch.length >= MIN_SEARCH_LENGTH

    const { response: persons, loading } = useFetchQuery<Array<INetworkPerson & { sponsor?: INetworkPerson }>>(
        API_ROUTES.NETWORK_PERSONS,
        {
            queryParams: { search: debouncedSearch },
            customQueryKey: queryKeys.list("network-persons", { search: debouncedSearch }),
            enabled: isSearchEnabled,
        }
    )

    const handleOpenChange = (value: boolean) => {
        setOpen(value)
        if (!value) {
            setInputValue("")
            setDebouncedSearch("")
        }
    }

    const showEmpty = isSearchEnabled && !loading && (!persons || persons.length === 0)
    const showResults = isSearchEnabled && persons && persons.length > 0

    return (
        <div className="flex flex-col gap-4">
            <Button
                variant="outline"
                rounded
                size="sm"
                text='Buscar cuentas y personas'
                onClick={() => setOpen(true)}
            />
            <CommandDialog open={open} onOpenChange={handleOpenChange} showCloseButton={false}>
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar por nombre o cuenta..."
                        value={inputValue}
                        onValueChange={setInputValue}
                        loading={loading && isSearchEnabled
                            ? <Loader2 className="size-4 shrink-0 animate-spin opacity-50" />
                            : undefined
                        }
                    />
                    <CommandList>
                        {showEmpty && (
                            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                        )}
                        {!isSearchEnabled && (
                            <CommandEmpty>Escribe al menos 2 caracteres para buscar.</CommandEmpty>
                        )}
                        {showResults && (
                            <CommandGroup heading="Personas">
                                {persons.map((person) => (
                                    <CommandItem key={person.id} value={person.id}>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium text-sm">{person.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground text-xs">{person.account}</span>
                                                <span className="text-muted-foreground text-xs">·</span>
                                                <span className="text-muted-foreground text-xs">{person.rank}</span>
                                                {person.sponsor && (
                                                    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                                                        Cliente: {person.sponsor.name} · {person.sponsor.account}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2 text-xs">
                                            {person.isClient && (
                                                <span className={`px-2 py-0.5 rounded-full font-medium ${person.isClientActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                                                    {person.isClientActive ? "Cliente activo" : "Cliente inactivo"}
                                                </span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </CommandDialog>
        </div>
    )
}

export default NetworkPeopleSearch