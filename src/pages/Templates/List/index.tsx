import { useEffect, useState } from "react"
import { GridIcon, TableIcon } from "lucide-react"
import { toast } from "sonner"

import TemplateDialogs from "../components/TemplateDialogs"
import TemplatesTableList from "../components/TemplatesTableList"
import TemplatesGridList from "../components/TemplatesGridList"
import { TemplateFilters } from "../page-utils"
import { ITemplate } from "@/interfaces/templates"
import useTemplatesStore from "@/store/templates"
import { EmptySection } from "@/components/generics/EmptySection"
import DynamicTabs from "@/components/generics/DynamicTabs"
import SkeletonLayout from "@/components/generics/SkeletonLayout"
import { ToastActionContainer } from "@/components/generics/ToastAction"
import { useHeaderActions } from "@/providers/HeaderActionsProvider"
import useRequestQuery from "@/hooks/useRequestQuery"
import { API_ROUTES } from "@/constants/api"
import { queryKeys } from "@/utils/queryKeys"

interface TemplatesListProps {
    defaultFilters?: Partial<TemplateFilters>
    isLoading: boolean
    templates: ITemplate[]
    defaultViewMode?: 'grid' | 'table'
    /**
     * When true, hides the grid/table toggle in the page header and forces
     * the list to always render in `defaultViewMode`. Posts uses this to
     * keep a card-only experience; Reports keeps the toggle.
     */
    lockViewMode?: boolean
}

const TemplatesList = ({ isLoading, templates, defaultViewMode = 'table', lockViewMode = false }: TemplatesListProps) => {
    const { setHeaderActions } = useHeaderActions()
    const [viewMode, setViewMode] = useState<'grid' | 'table'>(defaultViewMode)
    const [deleteState, setDeleteState] = useState<'initial' | 'loading' | 'success'>('initial')

    const {
        selectedTemplates,
        resetSelection,
    } = useTemplatesStore(state => state)

    useEffect(() => {
        if (lockViewMode) {
            setHeaderActions(null)
            return
        }

        setHeaderActions(
            <DynamicTabs
                value={viewMode}
                onValueChange={e => setViewMode(e as 'grid' | 'table')}
                items={[
                    { label: 'Tarjetas', value: 'grid', icon: <GridIcon /> },
                    { label: 'Tabla', value: 'table', icon: <TableIcon /> },
                ]}
            />
        )
    }, [viewMode, setHeaderActions, lockViewMode])

    // Locked grid never displays the table selection; clear any leftovers.
    const effectiveViewMode: 'grid' | 'table' = lockViewMode ? defaultViewMode : viewMode

    useEffect(() => {
        if (effectiveViewMode !== 'table' && selectedTemplates.length > 0) {
            resetSelection()
        }
    }, [effectiveViewMode])

    const { request } = useRequestQuery({
        invalidateQueries: [queryKeys.list('config/templates')],
        onSuccess: () => {
            toast.success('Plantillas eliminadas correctamente')
            resetSelection()
            setDeleteState('initial')
        },
        onError: (error) => {
            toast.error(`Error al eliminar plantillas: ${error.message}`)
            setDeleteState('initial')
        },
    })

    const handleDelete = async () => {
        if (!selectedTemplates.length) return
        setDeleteState('loading')
        await request<{ ids: string[] }>('DELETE', API_ROUTES.TEMPLATES.LIST, {
            ids: selectedTemplates.map(t => t.id),
        })
    }

    const selectedCount = selectedTemplates.length

    return (
        <>
            <SkeletonLayout
                loading={isLoading}
                variant={effectiveViewMode}
                count={effectiveViewMode === 'table' ? 8 : 6}
                columns={5}
                gridClassName="md:grid-cols-2 lg:grid-cols-3"
            >
                {effectiveViewMode === 'table' ? (
                    <TemplatesTableList
                        items={templates ?? []}
                        isLoading={isLoading}
                        enableSelection
                    />
                ) : (
                    <TemplatesGridList items={templates ?? []} />
                )}
            </SkeletonLayout>

            {!isLoading && !templates.length && (
                <EmptySection title="No hay nada que mostrar aquí" description="Aplica filtros o realiza una búsqueda" />
            )}

            <ToastActionContainer
                show={selectedCount > 0}
                state={deleteState}
                onReset={resetSelection}
                onSave={handleDelete}
                labels={{
                    initialText: `${selectedCount} ${selectedCount === 1 ? 'plantilla seleccionada' : 'plantillas seleccionadas'}`,
                    loadingText: 'Eliminando...',
                    successText: 'Plantillas eliminadas',
                    resetButtonText: 'Cancelar',
                    saveButtonText: 'Eliminar',
                }}
            />

            <TemplateDialogs />
        </>
    )
}

export default TemplatesList
