import { useState } from "react"
import { PlusIcon } from "lucide-react"

import useTemplates from "../useTemplates"
import StatsTemplates from "../components/Stats"
import Button from "@/components/common/Button"
import SearchInput from "@/components/generics/SearchInput"
import { CardDescription, CardTitle } from "@/uishadcn/ui/card"
import { DataTable } from "@/components/generics/DataTable"
import { templatesColumns } from "../components/ListColumns"
import Modal from "@/components/common/Modal"
import TemplateForm from "../components/TemplateForm"
import ManageClients from "../components/ManageClients"
import TemplateDetail from "../components/TemplateDetail"

const TemplatesPage = () => {
    const { isLoading, templates, actionDialogOpen, selectedTemplate, setSearch, setSelectedTemplate } = useTemplates()
    const [openForm, setOpenForm] = useState(false)

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
                    onOpenChange={() => setOpenForm(false)}
                >
                    <TemplateForm onSuccess={() => setOpenForm(false)} />
                </Modal>
            </div>

            <StatsTemplates />
            <DataTable
                columns={templatesColumns}
                contentHeader={
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Plantillas de Boletín</CardTitle>
                            <CardDescription>Gestiona todas las plantillas disponibles</CardDescription>
                        </div>
                        <SearchInput
                            placeholder="Buscar plantillas"
                            onSubmitSearch={(e) => setSearch(e)}
                        />
                    </div>
                }
                isLoading={isLoading}
                data={templates ?? []}
            />

            <Modal
                title={`Editar plantilla: ${selectedTemplate?.name}`}
                description="Edita la plantilla de boletín para tus clientes"
                open={actionDialogOpen === 'edit'}
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