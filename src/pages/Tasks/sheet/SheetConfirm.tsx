import { useState } from 'react'

import { cn } from '@/lib/utils'
import {
    AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/uishadcn/ui/alert-dialog'

interface SheetConfirmProps {
    open: boolean
    title: string
    /** Cada renglón es una consecuencia: qué se borra, qué NO se deshace */
    lines: string[]
    confirm: string
    danger?: boolean
    onConfirm: () => Promise<unknown> | unknown
    onClose: () => void
}

/** La confirmación de la ficha: dice exactamente qué va a pasar y espera a que termine antes de cerrarse */
const SheetConfirm = ({ open, title, lines, confirm, danger, onConfirm, onClose }: SheetConfirmProps) => {
    const [busy, setBusy] = useState(false)

    const run = async () => {
        setBusy(true)
        try {
            await onConfirm()
        } finally {
            setBusy(false)
            onClose()
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={value => !value && !busy && onClose()}>
            <AlertDialogContent className="rounded-[24px] border-border p-6 sm:max-w-md">
                <AlertDialogHeader className="place-items-start text-left">
                    <AlertDialogTitle className="text-[17px] font-extrabold tracking-tight">{title}</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="grid gap-1.5 text-[13px] leading-relaxed">
                            {lines.map(line => <p key={line}>{line}</p>)}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel disabled={busy} className="ficha-btn m-0">Cancelar</AlertDialogCancel>
                    <button type="button" disabled={busy} onClick={run} className={cn('ficha-btn', danger ? 'danger' : 'cta')}>
                        {busy ? 'Un momento…' : confirm}
                    </button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default SheetConfirm
