export const CONFLICT_CODES = {
    CROSS_USER_VALIDATION_ERROR: 'CROSS_USER_VALIDATION_ERROR',
    INVALID_REPORT_HEADINGS: 'INVALID_REPORT_HEADINGS'
}

type ErrorControlledBase = { success: boolean, error_code: keyof typeof CONFLICT_CODES }

export interface ConflictUser {
    id: string
    consultant_code: string
    name: string
}

export interface ConflictUsersError {
    errors: ErrorControlledBase & {
        conflict_users: ConflictUser[]
    }
}

export interface ConflictHeadingsError {
    errors: ErrorControlledBase & {
        expected_columns: string[],
        found_columns: string[]
    }
}

export const hasConflictUsersStructure = (error: unknown): error is ConflictUsersError => {
    return error !== null &&
        typeof error === 'object' &&
        'errors' in error &&
        error.errors !== null &&
        typeof error.errors === 'object' &&
        'error_code' in error.errors &&
        (error.errors as Record<string, unknown>).error_code === CONFLICT_CODES.CROSS_USER_VALIDATION_ERROR &&
        'conflict_users' in error.errors &&
        Array.isArray((error.errors as Record<string, unknown>).conflict_users)
}

export const hasConflictHeadingsStructure = (error: unknown): error is ConflictHeadingsError => {
    return error !== null &&
        typeof error === 'object' &&
        'errors' in error &&
        error.errors !== null &&
        typeof error.errors === 'object' &&
        'error_code' in error.errors &&
        (error.errors as Record<string, unknown>).error_code === CONFLICT_CODES.INVALID_REPORT_HEADINGS &&
        'expected_columns' in error.errors &&
        Array.isArray((error.errors as Record<string, unknown>).expected_columns) &&
        'found_columns' in error.errors &&
        Array.isArray((error.errors as Record<string, unknown>).found_columns)
}

export const MAP_LABEL_STATUS: Record<string, string> = {
    processing: 'Procesando',
    completed: 'Completado',
    failed: 'Fallido'
}