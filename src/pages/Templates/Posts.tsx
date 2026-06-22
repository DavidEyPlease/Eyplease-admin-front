import { RotateCcwIcon } from "lucide-react"

import useTemplates from "./useTemplates"
import Dropdown from "@/components/common/Inputs/Dropdown"
import useAuthStore from "@/store/auth"
import useFetchQuery from "@/hooks/useFetchQuery"
import { Button as ShadcnButton } from "@/uishadcn/ui/button"
import { API_ROUTES } from "@/constants/api"
import { MONTHS_OPTIONS } from "@/constants/app"
import { queryKeys } from "@/utils/queryKeys"
import { INewsletterSectionItem } from "@/interfaces/common"
import { TEMPLATE_ASSET_TYPE_OPTIONS, TEMPLATE_GROUP_REPORTS, TemplateFilterKeys, TemplateFilters } from "./page-utils"
import TemplatesList from "./List"
import TemplatesHeader from "./components/TemplatesHeader"

// Filter keys that count as "active" when present and non-empty. Excludes
// the technical base filter `not_template_group` which always carries
// 'reports' on this page.
const ACTIVE_FILTER_KEYS: Array<keyof TemplateFilters> = [
    'month',
    'template_group',
    'template_subgroup',
    'template_asset_type',
]

const PostsTemplatesPage = () => {

    const {
        isLoading,
        templates,
        filters,
        search,
        selectedTemplate,
        setSelectedTemplate,
        setSearch,
        onApplyFilters,
    } = useTemplates('posts')
    const { utilData } = useAuthStore(state => state)

    const templateGroupOptions = [
        { label: 'Cumpleaños Mis Clientes', value: 'customers-birthdays' },
        ...utilData.newsletters.flatMap(n =>
            n.sections
                .filter(i => i.has_publish_posts)
                .map(s => ({
                    label: `${n.name} - ${s.name}`,
                    value: s.sectionKey,
                }))
        ),
    ]

    const { response: subGroups } = useFetchQuery<INewsletterSectionItem[]>(
        API_ROUTES.GET_NEWSLETTER_SECTION_ITEMS.replace('{sectionKey}', filters?.template_group || ''),
        {
            enabled: Boolean(filters?.template_group && !['customers-birthdays', ...TEMPLATE_GROUP_REPORTS].includes(filters?.template_group)),
            customQueryKey: queryKeys.list('newsletter_section_items', { section: filters?.template_group }),
        }
    )

    const subgroupOptions = subGroups ? subGroups.map(s => ({ label: s.name, value: s.item_key })) : []

    const onFilterChange = (key: TemplateFilterKeys, value: string) => {
        const next: Partial<TemplateFilters> = { [key]: value } as Partial<TemplateFilters>
        if (key === 'template_group') next.template_subgroup = ''
        onApplyFilters({ not_template_group: 'reports', ...next })
    }

    const hasActiveFilters = ACTIVE_FILTER_KEYS.some(key => Boolean(filters?.[key])) || Boolean(search)

    const handleClearFilters = () => {
        onApplyFilters({ not_template_group: 'reports' })
        setSearch('')
    }

    return (
        <div className="space-y-5">
            <TemplatesHeader
                search={search}
                onSearch={setSearch}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
            />

            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Dropdown
                        placeholder="Mes"
                        items={MONTHS_OPTIONS}
                        value={filters?.month || ''}
                        onChange={v => onFilterChange('month', v)}
                    />
                    <Dropdown
                        placeholder="Grupo"
                        items={templateGroupOptions}
                        value={filters?.template_group || ''}
                        onChange={v => onFilterChange('template_group', v)}
                    />
                    <Dropdown
                        placeholder="Subgrupo"
                        items={subgroupOptions}
                        value={filters?.template_subgroup || ''}
                        disabled={!filters?.template_group || ['customers-birthdays'].includes(filters?.template_group)}
                        onChange={v => onFilterChange('template_subgroup', v)}
                    />
                    <Dropdown
                        placeholder="Recurso"
                        items={TEMPLATE_ASSET_TYPE_OPTIONS}
                        value={filters?.template_asset_type || ''}
                        onChange={v => onFilterChange('template_asset_type', v)}
                    />
                </div>

                {hasActiveFilters && (
                    <div className="flex justify-end">
                        <ShadcnButton
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            className="text-muted-foreground hover:text-foreground gap-1.5"
                        >
                            <RotateCcwIcon className="w-3.5 h-3.5" />
                            Limpiar filtros
                        </ShadcnButton>
                    </div>
                )}
            </div>

            <TemplatesList
                templates={templates || []}
                isLoading={isLoading}
                defaultViewMode="grid"
                lockViewMode
            />
        </div>
    )
}

export default PostsTemplatesPage
