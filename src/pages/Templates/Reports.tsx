import useTemplates from "./useTemplates"
import StatsTemplates from "./components/Stats"
import TemplatesList from "./List"

const ReportsTemplatesPage = () => {
    const {
        isLoading,
        templates,
    } = useTemplates('reports', { template_group: 'reports' })

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
