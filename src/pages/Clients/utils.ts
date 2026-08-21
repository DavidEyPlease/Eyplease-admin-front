import { IClientListItem } from "@/interfaces/clients";
import { cn } from "@/lib/utils";
import { Column } from "@tanstack/react-table";
import { CSSProperties } from "react";

export const EDITABLE_COLUMN_IDS = new Set([
    'accountPw',
    'phone',
    'guestAccount',
])

/** columnId de la tabla -> campo que acepta el backend en sort_by */
export const SORT_FIELD_BY_COLUMN: Record<string, string> = {
    account: 'name',
    current_month_points: 'current_month_points',
    previous_month_points: 'previous_month_points',
}

export const COLUMN_BY_SORT_FIELD: Record<string, string> = Object.fromEntries(
    Object.entries(SORT_FIELD_BY_COLUMN).map(([columnId, field]) => [field, columnId])
)

/** Columnas cuyo primer clic ordena desc (métricas: interesa el valor más alto) */
export const DESC_FIRST_COLUMNS = new Set([
    'current_month_points',
    'previous_month_points',
])

export const isSortableColumn = (columnId: string) => columnId in SORT_FIELD_BY_COLUMN

export const TRANSLATE_COLUMNS = {
    accountPw: 'Contraseña de Cuenta',
    guestAccount: 'Cuenta de Invitado',
    status: 'Estado',
    plan: 'Plan',
    email: 'Correo Electrónico',
    createdAt: 'Fecha de Creación',
    lastSignInAt: 'Último Inicio de Sesión',
}

export const getStatusColor = (active: boolean) => {
    return active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200';
}

export const isEditableColumn = (columnId: string) => EDITABLE_COLUMN_IDS.has(columnId)

export const getPinningClasses = (column: Column<IClientListItem>): string => {
    const isPinned = column.getIsPinned()
    const isLastLeftPinnedColumn =
        isPinned === 'left' && column.getIsLastColumn('left')
    const isFirstRightPinnedColumn =
        isPinned === 'right' && column.getIsFirstColumn('right')

    const baseClasses = 'transition-colors duration-200'

    if (!isPinned) {
        return baseClasses
    }

    // Clases para columnas pineadas
    const pinnedClasses = cn(
        'sticky',
        // 'bg-muted/90 dark:bg-muted/60',
        'font-semibold',
        'shadow-sm',
        baseClasses,
        isLastLeftPinnedColumn && 'shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_8px_-2px_rgba(0,0,0,0.3)]',
        isFirstRightPinnedColumn && 'shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.3)]',
    )

    return pinnedClasses
}

export const getPinningStyles = (column: Column<IClientListItem>): CSSProperties => {
    const isPinned = column.getIsPinned()

    return {
        left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
        width: column.getSize(),
        minWidth: column.getSize(),
        maxWidth: column.getSize(),
        zIndex: isPinned ? 10 : 0,
    }
}