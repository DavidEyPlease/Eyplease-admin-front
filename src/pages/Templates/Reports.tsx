import useTemplates from "./useTemplates"
import StatsTemplates from "./components/Stats"
import TemplatesList from "./List"
import TemplatesHeader from "./components/TemplatesHeader"

const ReportsTemplatesPage = () => {
    const {
        isLoading,
        templates,
        search,
        selectedTemplate,
        setSearch,
        setSelectedTemplate,
    } = useTemplates('reports', { template_group: 'reports' })

    return (
        <div className="space-y-5">
            <TemplatesHeader
                search={search}
                onSearch={setSearch}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
                isReportsTemplates
            />

            <StatsTemplates />

            <TemplatesList
                templates={templates || []}
                isLoading={isLoading}
            />
        </div>
    )
}

export default ReportsTemplatesPage
