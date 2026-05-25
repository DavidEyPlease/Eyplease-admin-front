import useTemplates from "./useTemplates"
import StatsTemplates from "./components/Stats"
import { TemplateFilters } from "./page-utils"
import TemplatesList from "./List"

interface TemplatesPageProps {
    defaultFilters?: Partial<TemplateFilters>
}

const ReportsTemplatesPage = ({ defaultFilters }: TemplatesPageProps) => {
    const {
        isLoading,
        templates,
    } = useTemplates('templates/reports', defaultFilters)

    return (
        <div className="space-y-5">
            <StatsTemplates />

            <TemplatesList
                templates={templates || []}
                isLoading={isLoading}
            />
        </div>
    )
}

export default ReportsTemplatesPage
