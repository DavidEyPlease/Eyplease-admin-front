import SearchInput from "../SearchInput"
import { Button } from "@/uishadcn/ui/button";
import { FilterIcon, SlidersHorizontalIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/uishadcn/ui/popover";
import { FiltersAndSearchProps } from "./types";
import FiltersContent from "./FiltersContent";
import { useMemo, useState } from "react";
import { Badge } from "@/uishadcn/ui/badge";
import { Separator } from "@/uishadcn/ui/separator";

const FiltersAndSearch = ({ activeFilters, title, setSearch, onApplyFilters, resetFilters, ...props }: FiltersAndSearchProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const onOpenChange = () => setIsOpen(!isOpen)

    const apply = () => {
        onApplyFilters(activeFilters || {})
        onOpenChange()
    }

    const reset = () => {
        resetFilters()
        onOpenChange()
    }

    const countActiveFilters = Object.values(activeFilters || {}).filter(i => !!i).length

    const filterButton = useMemo(() => (
        <Button variant="outline" size="icon" className="relative rounded-full bg-primary size-10 hover:bg-primary/90 shadow-md">
            <SlidersHorizontalIcon className="text-white" />
            {countActiveFilters > 0 && (
                <Badge
                    variant="destructive"
                    className="absolute text-white -top-3 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                    {countActiveFilters > 9 ? "9+" : countActiveFilters}
                </Badge>
            )}
        </Button>
    ), [countActiveFilters, isOpen])

    return (
        <div className="flex gap-x-2 items-center">
            <SearchInput
                placeholder="Buscar clientes"
                onSubmitSearch={setSearch}
            />
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    {filterButton}
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    {title && <h4 className="leading-none font-medium mb-2">{title}</h4>}
                    <FiltersContent
                        selectedFilters={activeFilters}
                        onOpenChange={onOpenChange}
                        {...props}
                    />

                    <Separator className="my-4" />
                    <div className="flex gap-x-2">
                        <Button variant="ghost" size="sm" className="w-full" onClick={onOpenChange}>Cerrar</Button>
                        <Button variant="secondary" size="sm" className="w-full" onClick={reset}>Limpiar</Button>
                        <Button variant="default" size="sm" className="w-full" onClick={apply}>Aplicar</Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default FiltersAndSearch