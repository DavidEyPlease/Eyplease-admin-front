import { useCallback, useState } from 'react'

export default function useBooleanHandlers(defaultValue = false) {
    const [open, setOpen] = useState<boolean>(defaultValue)

    const onOpen = useCallback(() => setOpen(true), [])
    const onClose = useCallback(() => setOpen(false), [])

    return [open, onOpen, onClose] as [boolean, typeof onOpen, typeof onClose]
}
