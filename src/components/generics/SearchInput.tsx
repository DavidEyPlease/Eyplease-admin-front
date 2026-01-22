import useSearchInput from '@/hooks/useSearchInput';
import TextInput from '../common/Inputs/TextInput';
import { IconClear } from '../Svg/IconClear';
import { SearchIcon } from 'lucide-react';

interface Props {
    placeholder?: string
    value?: string;
    onSubmitSearch: (_value: string) => void
}

const SearchInput = ({ value, placeholder, onSubmitSearch }: Props) => {
    const { text, onSubmit, onChange, onClearSearch } = useSearchInput({
        value: value || '',
        onValueChange: onSubmitSearch,
    })

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSubmit(e)
        }
    }

    return (
        <div className="relative min-w-64 flex-1">
            <SearchIcon className="absolute top-3.5 left-4 text-muted-foreground" />
            <TextInput
                label=''
                value={text}
                variant='underlined'
                placeholder={placeholder}
                className='rounded-4xl ps-12 pe-5 py-6 shadow-md text-primary dark:text-white'
                onChange={onChange}
                onKeyDown={onKeyDown}
            />
            {text && <button className='absolute cursor-pointer text-primary dark:text-white top-3.5 right-4' onClick={onClearSearch}><IconClear /></button>}
        </div>
    )
}

export default SearchInput;