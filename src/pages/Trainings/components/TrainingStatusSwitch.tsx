import SwitchInput from "@/components/common/Inputs/Switch"
import { BROWSER_EVENTS } from "@/constants/browserEvents"
import { API_ROUTES } from "@/constants/api"
import useRequest from "@/hooks/useRequest"
import { ApiResponse } from "@/interfaces/common"
import { ITraining } from "@/interfaces/training"
import { publishEvent } from "@/utils/events"

const TrainingStatusSwitch = ({ training }: { training: ITraining }) => {
    const { request, requestState } = useRequest('PATCH')

    const handleChange = async (active: boolean) => {
        const response = await request<ApiResponse<ITraining>, { active: boolean }>(
            API_ROUTES.TRAININGS.PUBLISH.replace('{id}', training.id),
            { active }
        )
        if (response?.success) {
            publishEvent(BROWSER_EVENTS.TRAININGS_LIST_UPDATED, { ...response.data })
        }
    }

    return (
        <SwitchInput
            id={`training-status-${training.id}`}
            checked={training.active}
            label={training.active ? "Activo" : "Inactivo"}
            loading={requestState.loading}
            onCheckedChange={handleChange}
        />
    )
}

export default TrainingStatusSwitch
