import { API_ROUTES } from "@/constants/api"
import { toast } from "sonner"
import useRequestQuery from "./useRequestQuery"
import { publishEvent } from "@/utils/events"
import { useState } from "react"
import { ConflictHeadingsError, ConflictUsersError, hasConflictHeadingsStructure, hasConflictUsersStructure } from "@/pages/ReportUploads/utils"
import { NetworkRankGroupType } from "@/interfaces/vendors"
import { queryKeys } from "@/utils/queryKeys"
import { useQueryClient } from "@tanstack/react-query"

const useReportUpload = () => {
    const queryClient = useQueryClient();

    const [selectedClient, setSelectedClient] = useState<string>('')
    const [selectedMonth, setSelectedMonth] = useState<string>('')
    const [selectedNewsletter, setSelectedNewsletter] = useState<string>('')
    const [file, setFile] = useState<File | null>(null)
    const [uploadError, setUploadError] = useState<ConflictUsersError | ConflictHeadingsError | null>(null)

    const resetState = () => {
        setSelectedClient('')
        setSelectedMonth('')
        setSelectedNewsletter('')
        setFile(null)
        setUploadError(null)
    }

    const { request, requestState } = useRequestQuery({
        onSuccess: () => {
            resetState()
            toast.success('Reporte subido correctamente')
            publishEvent('clear-file-uploader', true)
        },
        onError: (e) => {
            publishEvent('clear-file-uploader', true)
            if (hasConflictUsersStructure(e)) {
                const conflictUsers = e.errors.conflict_users
                setUploadError(e)
                toast.error(`Error de validación: Conflicto con ${conflictUsers.length} usuario(s)`)
            } else if (hasConflictHeadingsStructure(e)) {
                const { expected_columns, found_columns } = e.errors
                setUploadError(e)
                toast.error(`Error de validación: Se esperaban las columnas ${expected_columns.join(', ')} pero se encontraron ${found_columns.join(', ')}`)
            } else {
                toast.error(e.message || 'Error al subir el reporte')
            }
        }
    })

    const onSubmit = async () => {
        if (!selectedClient || !selectedMonth || !selectedNewsletter || !file) {
            toast.error('Por favor completa todos los campos y adjunta un archivo')
            return
        }

        const formData = new FormData()
        formData.append('user_id', selectedClient)
        formData.append('year_month', selectedMonth)
        formData.append('newsletter_section_id', selectedNewsletter)
        formData.append('file', file)

        await request('POST', API_ROUTES.REPORTS.UPLOAD, formData)
    }

    const onUpdateNetwork = async (clientId: string, rolSelected: NetworkRankGroupType, file: File) => {
        if (!clientId || !file || !rolSelected) {
            toast.error('Por favor completa todos los campos y adjunta un archivo')
            return
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('person_type', rolSelected)

        await request('POST', API_ROUTES.CLIENTS.UPDATE_NETWORK.replace('{id}', clientId), formData)
        await queryClient.invalidateQueries({ queryKey: queryKeys.list(`client/${clientId}/network`) });
    }

    return {
        loading: requestState.loading,
        selectedClient,
        setSelectedClient,
        selectedMonth,
        setSelectedMonth,
        selectedNewsletter,
        setSelectedNewsletter,
        file,
        setFile,
        uploadError,
        setUploadError,
        onSubmit,
        onUpdateNetwork
    }
}

export default useReportUpload