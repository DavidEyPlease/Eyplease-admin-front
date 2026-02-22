import { FormEvent, useState } from "react";

import Autosuggest, { ChangeEvent } from 'react-autosuggest';

import { ApiListParams, ApiResponse } from "@/interfaces/common";
import Spinner from "../common/Spinner";
import { Label } from "@/uishadcn/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/uishadcn/ui/button";
import { XIcon } from "lucide-react";

export type GetListAction<T> = (params: ApiListParams) => Promise<ApiResponse<T[]>>

type ApiAutocompleteItem = { id: string; label: string }
type ApiAutocompleteItems = Array<ApiAutocompleteItem>

interface Props<T> {
    label?: string
    suggestionKeyValue: string
    suggestionKeyLabel?: string
    placeholder?: string
    value: string
    defaultSuggestions?: ApiAutocompleteItems
    disabled?: boolean
    queryFn: GetListAction<T>
    onEmptyValue?: () => void
    onChange: (value: string) => void
}

const ApiAutocomplete = <T,>({ label, disabled, suggestionKeyValue = 'id', suggestionKeyLabel = 'name', placeholder = 'Seleccionar', queryFn, onChange }: Props<T>) => {
    const [searchValue, setSearchValue] = useState<string>('')

    const fetchItems = async () => {
        try {
            const response = await queryFn({ search: searchValue, page: 1, pageSize: 10 })
            const fetchedItems: ApiAutocompleteItems = response.data.map((item: any) => ({
                id: item[suggestionKeyValue],
                label: item[suggestionKeyLabel] || 'N/A'
            }))
            return fetchedItems
        } catch (error) {
            console.error('Error fetching items:', error)
        }
    }

    const { data, isLoading, isRefetching } = useQuery({
        queryKey: ['autocomplete', searchValue],
        queryFn: fetchItems,
        staleTime: 3000,
        enabled: !!searchValue && !disabled,
        refetchOnWindowFocus: false,
    })

    const inputProps = {
        placeholder,
        value: searchValue,
        disabled,
        onChange: (event: FormEvent<HTMLElement>, params: ChangeEvent) => {
            setSearchValue(params.newValue)
        }
    }

    const getSuggestionValue = (suggestion: ApiAutocompleteItem) => {
        onChange(suggestion.id)
        return suggestion.label;
    };

    const renderSuggestion = (suggestion: ApiAutocompleteItem) => {
        return (
            <div>
                {suggestion.label}
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <div className="relative flex items-center gap-x-1">
                <Autosuggest
                    suggestions={data || []}
                    onSuggestionsFetchRequested={search => setSearchValue(search.value)}
                    // onSuggestionsClearRequested={() => {
                    //     console.log('clear input')
                    //     // onChange('')
                    // }}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    inputProps={inputProps}
                />
                {!isLoading && !isRefetching && searchValue && (
                    <Button size='icon' variant='ghost' type="button" onClick={() => {
                        setSearchValue('')
                        onChange('')
                    }}>
                        <XIcon className="text-primary" />
                    </Button>
                )}
                <div className="absolute right-0 top-0 mt-2 mr-2">
                    {(isLoading || isRefetching) && <Spinner size="sm" color="primary" />}
                </div>
            </div>
        </div>
    )
}

export default ApiAutocomplete;