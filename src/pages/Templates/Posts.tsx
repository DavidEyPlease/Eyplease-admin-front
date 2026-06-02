import { useState } from "react"
import { PlusIcon } from "lucide-react"

import useTemplates from "./useTemplates"
import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import TemplateForm from "./components/TemplateForm"
import SearchInput from "@/components/generics/SearchInput"
import Dropdown from "@/components/common/Inputs/Dropdown"
import useAuthStore from "@/store/auth"
import useFetchQuery from "@/hooks/useFetchQuery"
import { API_ROUTES } from "@/constants/api"
import { MONTHS_OPTIONS } from "@/constants/app"
import { queryKeys } from "@/utils/queryKeys"
import { INewsletterSectionItem } from "@/interfaces/common"
import { TEMPLATE_ASSET_TYPE_OPTIONS, TemplateFilterKeys, TemplateFilters } from "./page-utils"
import TemplatesList from "./List"
import UploadTemplateFile from "./components/UploadTemplateFiles"

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

    const [openForm, setOpenForm] = useState(false)

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
            enabled: Boolean(filters?.template_group && !['customers-birthdays', 'reports'].includes(filters?.template_group)),
            customQueryKey: queryKeys.list('newsletter_section_items', { section: filters?.template_group }),
        }
    )

    const subgroupOptions = subGroups ? subGroups.map(s => ({ label: s.name, value: s.item_key })) : []

    const onFilterChange = (key: TemplateFilterKeys, value: string) => {
        const next: Partial<TemplateFilters> = { [key]: value } as Partial<TemplateFilters>
        if (key === 'template_group') next.template_subgroup = ''
        onApplyFilters({ not_template_group: 'reports', ...next })
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-x-3">
                <div className="flex-1">
                    <SearchInput
                        placeholder="Buscar plantillas..."
                        value={search}
                        onSubmitSearch={setSearch}
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
                        setSelectedTemplate(null)
                        setOpenForm(false)
                    }}
                >
                    {selectedTemplate ? (
                        <UploadTemplateFile template={selectedTemplate} onSuccess={() => setOpenForm(false)} />
                    ) : (
                        <TemplateForm
                            isReportsTemplates={false}
                            onSuccess={template => {
                                setSelectedTemplate(template)
                            }}
                        />
                    )}
                </Modal>
            </div>

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

            <TemplatesList
                templates={templates || []}
                isLoading={isLoading}
                defaultViewMode="grid"
            />
        </div>
    )
}

export default PostsTemplatesPage
