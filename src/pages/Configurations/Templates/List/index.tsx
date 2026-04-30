import { useEffect, useState } from "react"
import { GridIcon, PlusIcon, TableIcon } from "lucide-react"

import useTemplates from "../useTemplates"
import StatsTemplates from "../components/Stats"
import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import TemplateForm from "../components/TemplateForm"
import ManageClients from "../components/ManageClients"
import TemplateDetail from "../components/TemplateDetail"
import PageLoader from "@/components/generics/PageLoader"
import FiltersAndSearch from "@/components/generics/FiltersAndSearch"
import DynamicTabs from "@/components/generics/DynamicTabs"
import { FilterTypes } from "@/components/generics/FiltersAndSearch/types"
import { useHeaderActions } from "@/providers/HeaderActionsProvider"
import useAuthStore from "@/store/auth"
import TemplatesTableList from "./components/TemplatesTableList"
import TemplatesGridList from "./components/TemplatesGridList"
import { TEMPLATES_FILTER_ITEMS, TemplateFilterKeys } from "./page-utils"

const TemplatesPage = () => {
    const {
        isLoading,
        templates,
        selectedFilters,
        actionDialogOpen,
        selectedTemplate,
        setSearch,
        setSelectedTemplate,
        onApplyFilters,
        onSelectedFilter,
        cleanSelectedFilters,
    } = useTemplates()
    const { utilData } = useAuthStore(state => state)
    const { setHeaderActions } = useHeaderActions()

    const [openForm, setOpenForm] = useState(false)
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')

    useEffect(() => {
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
    }, [viewMode, setHeaderActions])

    const templateGroupOptions = [
        { label: 'Reportes de boletín', value: 'reports' },
        { label: 'Cumpleaños Mis Clientes', value: 'customers-birthdays' },
        ...utilData.newsletters.flatMap(n =>
            n.sections
                .filter(i => i.has_publish_posts)
                .map(s => ({
                    label: `${n.name} - ${s.name}`,
                    value: s.sectionKey,
                }))
        ),
    ]

    const filterList = TEMPLATES_FILTER_ITEMS.map(i => {
        if (i.id === 'template_group' && i.type === FilterTypes.MULTI_SELECT) {
            i.options = templateGroupOptions
        }
        return i
    })

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Plantillas</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Administra las plantillas de boletín y su disponibilidad</p>
                </div>
                <Button
                    rounded
                    text={
                        <>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Nueva Plantilla
                        </>
                    }
                    onClick={() => setOpenForm(!openForm)}
                />
                <Modal
                    title="Crear nueva plantilla"
                    description="Crea una nueva plantilla de boletín para tus clientes"
                    open={openForm}
                    size="xxl"
                    onOpenChange={() => setOpenForm(false)}
                >
                    <TemplateForm onSuccess={() => setOpenForm(false)} />
                </Modal>
            </div>

            <StatsTemplates />

            <div className="flex items-center gap-x-2">
                <div className="flex-1">
                    <FiltersAndSearch
                        title="Filtros de plantillas"
                        columns="1"
                        placeholderSearch="Buscar plantillas..."
                        renderComponent="popover"
                        filters={filterList}
                        setSearch={setSearch}
                        activeFilters={selectedFilters}
                        onSelectFilter={(k, v) => onSelectedFilter(k as TemplateFilterKeys, v)}
                        onApplyFilters={onApplyFilters}
                        resetFilters={cleanSelectedFilters}
                    />
                </div>
            </div>

            {isLoading ? (
                <PageLoader />
            ) : viewMode === 'table' ? (
                <TemplatesTableList items={templates ?? []} isLoading={isLoading} />
            ) : (
                <TemplatesGridList items={templates ?? []} />
            )}

            <Modal
                title={`Editar plantilla: ${selectedTemplate?.name}`}
                description="Edita la plantilla de boletín para tus clientes"
                open={actionDialogOpen === 'edit'}
                size="xxl"
                onOpenChange={() => {
                    setSelectedTemplate(null)
                }}
            >
                <TemplateForm item={selectedTemplate || null} onSuccess={() => setSelectedTemplate(null)} />
            </Modal>

            <Modal
                title={`Vista de Plantilla: ${selectedTemplate?.name}`}
                description="Fondos disponibles"
                open={actionDialogOpen === 'view'}
                size="xxl"
                className="max-h-[80vh] overflow-y-auto"
                onOpenChange={() => {
                    setSelectedTemplate(null)
                }}
            >
                {selectedTemplate && <TemplateDetail template={selectedTemplate} />}
            </Modal>

            <Modal
                title={`Gestionar Clientes: Plantilla ${selectedTemplate?.name}`}
                description="Activa o desactiva esta plantilla para clientes específicos"
                open={actionDialogOpen === 'manageClient'}
                size="xl"
                className="max-h-[80vh] overflow-y-auto"
                onOpenChange={() => {
                    setSelectedTemplate(null)
                }}
            >
                {selectedTemplate && <ManageClients template={selectedTemplate} />}
            </Modal>
        </div>
    )
}

export default TemplatesPage