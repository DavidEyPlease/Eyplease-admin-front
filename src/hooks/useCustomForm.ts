import { DefaultValues, FieldValues, useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';

const useCustomForm = <T extends FieldValues>(schema: any, defaultValues: DefaultValues<T>) => {
    const form = useForm<T>({
        resolver: zodResolver(schema),
        defaultValues
    })

    return form
}

export default useCustomForm