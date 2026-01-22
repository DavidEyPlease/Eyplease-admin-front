import { FormEvent, useState } from "react";

import Autosuggest, { ChangeEvent } from 'react-autosuggest';

import { ApiListParams, ApiResponse } from "@/interfaces/common";
import Spinner from "../common/Spinner";
import { Label } from "@/uishadcn/ui/label";

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
    onChange: (value: string) => void
}

const ApiAutocomplete = <T,>({ label, value, defaultSuggestions, disabled, suggestionKeyValue = 'id', suggestionKeyLabel = 'name', placeholder = 'Seleccionar', queryFn, onChange }: Props<T>) => {
    const [suggestions, setSuggestions] = useState<ApiAutocompleteItems>(defaultSuggestions || [])
    const [searchValue, setSearchValue] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const fetchItems = async (search: string) => {
        try {
            setLoading(true)
            const response = await queryFn({ search, page: 1, pageSize: 10 })
            const fetchedItems = response.data.map((item: any) => ({
                id: item[suggestionKeyValue],
                label: item[suggestionKeyLabel] || 'N/A'
            }))
            setSuggestions(fetchedItems)
        } catch (error) {
            console.error('Error fetching items:', error)
        } finally {
            setLoading(false)
        }
    }

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
            <div className="relative">
                <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={e => fetchItems(e.value)}
                    // onSuggestionsClearRequested={() => {
                    //     console.log('clear input')
                    //     onChange('')
                    // }}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    inputProps={inputProps}
                />
                <div className="absolute right-0 top-0 mt-2 mr-2">
                    {loading && <Spinner size="sm" />}
                </div>
            </div>
        </div>
    )
}

export default ApiAutocomplete;