import Modal from "@/components/common/Modal"
import { CONFLICT_CODES, ConflictUsersError, ConflictHeadingsError } from "../utils"
import { Separator } from "@/uishadcn/ui/separator"
import { ScrollArea } from "@/uishadcn/ui/scroll-area"

interface Props {
    open: boolean
    uploadError: ConflictUsersError | ConflictHeadingsError | null
    onClose: () => void
}

const UploadErrorFeedback = ({ open, onClose, uploadError }: Props) => {
    const { error_code } = uploadError?.errors || {}
    const conflictUsersError = error_code === CONFLICT_CODES.CROSS_USER_VALIDATION_ERROR ? (uploadError as ConflictUsersError).errors.conflict_users : []
    const headingsErrors = error_code === CONFLICT_CODES.INVALID_REPORT_HEADINGS ? (uploadError as ConflictHeadingsError).errors : null

    return (
        <Modal
            title={`Error al subir el reporte: ${uploadError?.errors?.error_code}`}
            open={open}
            size="xxl"
            onOpenChange={onClose}
        >
            {error_code === CONFLICT_CODES.CROSS_USER_VALIDATION_ERROR && (
                <>
                    <p>Error de validación: Conflicto con {conflictUsersError.length} usuario(s)</p>
                    <Separator className="my-2" />
                    <ScrollArea className="h-72 w-full rounded-md border">
                        <div className="p-4">
                            <h4 className="mb-4 text-lg leading-none font-medium">
                                Usuarios en conflicto:
                            </h4>
                            {(conflictUsersError || []).map((user) => (
                                <div key={user.id}>
                                    <div className="text-sm">{user.consultant_code} - {user.name}</div>
                                    <Separator className="my-4" />
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </>
            )}

            {error_code === CONFLICT_CODES.INVALID_REPORT_HEADINGS && (
                <>
                    <p>Error de validación: Conflicto con cabeceras del archivo cargado</p>
                    <Separator className="my-2" />
                    <div className="grid md:grid-cols-2 gap-4">
                        <ScrollArea className="h-72 w-full rounded-md border">
                            <div className="p-4">
                                <h4 className="mb-4 text-lg leading-none font-medium">
                                    Columnas encontradas:
                                </h4>
                                {(headingsErrors?.found_columns || []).map((column) => (
                                    <div key={column} className="text-sm">{column}</div>
                                ))}
                            </div>
                        </ScrollArea>
                        <ScrollArea className="h-72 w-full rounded-md border">
                            <div className="p-4">
                                <h4 className="mb-4 text-lg leading-none font-medium">
                                    Columnas esperadas:
                                </h4>
                                {(headingsErrors?.expected_columns || []).map((column) => (
                                    <div key={column} className="text-sm">{column}</div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </>
            )}
        </Modal>
    )
}

export default UploadErrorFeedback