import { ITemplate } from "@/interfaces/templates"
import { DataTable } from "@/components/generics/DataTable"
import { templatesColumns } from "./ListColumns"
import useTemplatesStore from "@/store/templates"

interface TemplatesTableListProps {
    items: ITemplate[]
    isLoading?: boolean
    enableSelection?: boolean
}

const TemplatesTableList = ({ items, isLoading, enableSelection = false }: TemplatesTableListProps) => {
    const { rowSelection, setRowSelection, setSelectedTemplates } = useTemplatesStore(state => state)

    return (
        <DataTable
            columns={templatesColumns}
            data={items}
            isLoading={isLoading}
            enableSelection={enableSelection}
            getRowId={(row) => row.id}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            onSelectionChange={setSelectedTemplates}
        />
    )
}

export default TemplatesTableList
