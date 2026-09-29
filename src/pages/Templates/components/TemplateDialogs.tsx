import Modal from "@/components/common/Modal"
import useTemplatesStore from "@/store/templates"
import ManageClients from "./ManageClients"
import TemplateDetail from "./TemplateDetail"
import TemplateForm from "./TemplateForm"

/**
 * Los diálogos de una plantilla —editar sus datos, clonarla, ver su arte y repartirla a clientas—, que
 * se abren desde el menú de cada una con `setSelectedTemplate(plantilla, acción)`. Viven aparte para que
 * la lista de Reportes y la de Publicaciones abran exactamente los mismos.
 */
const TemplateDialogs = () => {
    const { actionDialogOpen, selectedTemplate, setSelectedTemplate } = useTemplatesStore(state => state)
    const close = () => setSelectedTemplate(null)

    return (
        <>
            <Modal
                title={`Editar plantilla: ${selectedTemplate?.name}`}
                description="Edita la plantilla de boletín para tus clientes"
                open={actionDialogOpen === 'edit'}
                size="xxl"
                onOpenChange={close}
            >
                <TemplateForm item={selectedTemplate || null} onSuccess={close} />
            </Modal>

            <Modal
                title={`Clonar plantilla: ${selectedTemplate?.name}`}
                description="Crea una copia con toda la configuración de variantes. Ajusta los datos antes de guardar."
                open={actionDialogOpen === 'clone'}
                size="xxl"
                onOpenChange={close}
            >
                <TemplateForm cloneFrom={selectedTemplate || null} onSuccess={close} />
            </Modal>

            <Modal
                title={`Vista de Plantilla: ${selectedTemplate?.name}`}
                description="Fondos disponibles"
                open={actionDialogOpen === 'view'}
                size="xxl"
                className="max-h-[80vh] overflow-y-auto"
                onOpenChange={close}
            >
                {selectedTemplate && <TemplateDetail template={selectedTemplate} />}
            </Modal>

            <Modal
                title={`Gestionar Clientes: Plantilla ${selectedTemplate?.name}`}
                description="Activa o desactiva esta plantilla para clientes específicos"
                open={actionDialogOpen === 'manageClient'}
                size="xl"
                className="max-h-[80vh] overflow-y-auto"
                onOpenChange={close}
            >
                {selectedTemplate && <ManageClients template={selectedTemplate} />}
            </Modal>
        </>
    )
}

export default TemplateDialogs
