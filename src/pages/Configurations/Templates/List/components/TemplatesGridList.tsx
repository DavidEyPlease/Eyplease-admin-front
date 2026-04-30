import FadeInGrid from "@/components/generics/FadeInGrid"
import { ITemplate } from "@/interfaces/templates"
import TemplateCard from "./TemplateCard"

interface TemplatesGridListProps {
    items: ITemplate[]
}

const TemplatesGridList = ({ items }: TemplatesGridListProps) => {
    return (
        <FadeInGrid gridClassName="md:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
                <TemplateCard key={item.id} template={item} />
            ))}
        </FadeInGrid>
    )
}

export default TemplatesGridList
