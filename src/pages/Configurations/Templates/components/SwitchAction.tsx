import SwitchInput from "@/components/common/Inputs/Switch"
import { SwitchInputProps } from "@/components/common/Inputs/types"
import { API_ROUTES } from "@/constants/api"
import useRequestQuery from "@/hooks/useRequestQuery"
import { ITemplate } from "@/interfaces/templates"
import { publishEvent } from "@/utils/events"
import { queryKeys } from "@/utils/queryKeys"

interface Props {
    id: string
    templateId: string
    actionField: 'active' | 'enabled_all_clients'
}

const SwitchAction = ({ id, templateId, actionField, ...props }: Props & SwitchInputProps) => {
    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.list('templates/stats')],
    })

    const onSwitchAction = async (checked: boolean) => {
        const response = await request<Partial<ITemplate>, ITemplate>('PUT', API_ROUTES.TEMPLATES.UPDATE.replace('{id}', templateId), { [actionField]: checked })
        if (response.success) {
            publishEvent('templates-updated', { ...response.data })
        }
    }

    return (
        <SwitchInput
            id={id}
            badge
            {...props}
            loading={requestState.loading}
            onCheckedChange={onSwitchAction}
        />
    )
}

export default SwitchAction