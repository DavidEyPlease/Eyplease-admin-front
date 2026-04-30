import { ITemplate } from "@/interfaces/templates"
import { DataTable } from "@/components/generics/DataTable"
import { templatesColumns } from "../../components/ListColumns"

interface TemplatesTableListProps {
    items: ITemplate[]
    isLoading?: boolean
}

const TemplatesTableList = ({ items, isLoading }: TemplatesTableListProps) => {
    return (
        <DataTable
            columns={templatesColumns}
            data={items}
            isLoading={isLoading}
        />
    )
}

export default TemplatesTableList
