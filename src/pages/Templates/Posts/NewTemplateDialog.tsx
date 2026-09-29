import { useState } from "react"

import Modal from "@/components/common/Modal"
import { ITemplate } from "@/interfaces/templates"
import TemplateForm from "../components/TemplateForm"
import UploadTemplateFiles from "../components/UploadTemplateFiles"

/**
 * Crear una plantilla, en los mismos dos pasos de siempre: sus datos y, ya creada, su arte. El formulario
 * y la subida son los de siempre; al guardar, la lista se refresca sola (el formulario invalida su llave).
 */
const NewTemplateDialog = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
    const [created, setCreated] = useState<ITemplate | null>(null)

    const close = () => {
        setCreated(null)
        onClose()
    }

    return (
        <Modal
            title={created ? `Sube el arte de «${created.name}»` : 'Nueva plantilla'}
            description={created ? 'La plantilla ya existe; falta su arte para que el motor la pueda usar.' : 'Sus datos: nombre, mes, sección y, si aplica, el subgrupo.'}
            open={open}
            size="xxl"
            onOpenChange={next => { if (!next) close() }}
        >
            {created
                ? <UploadTemplateFiles template={created} onSuccess={close} />
                : <TemplateForm onSuccess={setCreated} />}
        </Modal>
    )
}

export default NewTemplateDialog
