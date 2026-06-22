import { useState } from "react"
import { PlusIcon } from "lucide-react"

import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import SearchInput from "@/components/generics/SearchInput"
import { ITemplate } from "@/interfaces/templates"
import TemplateForm from "./TemplateForm"
import UploadTemplateFile from "./UploadTemplateFiles"

interface TemplatesHeaderProps {
    search: string
    onSearch: (value: string) => void
    selectedTemplate: ITemplate | null
    onSelectTemplate: (template: ITemplate | null) => void
    isReportsTemplates?: boolean
}

const TemplatesHeader = ({
    search,
    onSearch,
    selectedTemplate,
    onSelectTemplate,
    isReportsTemplates = false,
}: TemplatesHeaderProps) => {
    const [openForm, setOpenForm] = useState(false)

    return (
        <div className="flex items-center justify-between gap-x-3">
            <div className="flex-1">
                <SearchInput
                    placeholder="Buscar plantillas..."
                    value={search}
                    onSubmitSearch={onSearch}
                />
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
                onOpenChange={() => {
                    onSelectTemplate(null)
                    setOpenForm(false)
                }}
            >
                {selectedTemplate ? (
                    <UploadTemplateFile template={selectedTemplate} onSuccess={() => setOpenForm(false)} />
                ) : (
                    <TemplateForm
                        isReportsTemplates={isReportsTemplates}
                        onSuccess={template => {
                            onSelectTemplate(template)
                        }}
                    />
                )}
            </Modal>
        </div>
    )
}

export default TemplatesHeader
