import Button from "@/components/common/Button";
import SwitchInput from "@/components/common/Inputs/Switch";
import useAuthStore from "@/store/auth";
import { Card, CardContent } from "@/uishadcn/ui/card";
import useRequest from "@/hooks/useRequest";
import { ApiResponse } from "@/interfaces/common";
import { IClient } from "@/interfaces/clients";
import { replaceRecordIdInPath } from "@/utils";
import { API_ROUTES } from "@/constants/api";
import { useState } from "react";
import { publishEvent } from "@/utils/events";

interface Props {
    activePlanId: string | null
    clientId: string
}

const SetPlan = ({ activePlanId, clientId }: Props) => {
    const { utilData } = useAuthStore(state => state)
    const { request, requestState } = useRequest('PATCH')
    const [selectedPlan, setSelectedPlan] = useState<string | null>(activePlanId)

    const onSave = async () => {
        if (!selectedPlan || !clientId) return
        const response = await request<ApiResponse<IClient>, { plan_id: string }>(
            replaceRecordIdInPath(API_ROUTES.CLIENTS.SET_PLAN, clientId),
            { plan_id: selectedPlan }
        )
        if (response.success) {
            publishEvent('client-updated', response.data)
        }
    }

    return (
        <Card className="h-max">
            <CardContent className="space-y-5">
                <p className="mb-5 text-xl font-semibold">Asignar plan manualmente</p>
                <div className="space-y-2">
                    {utilData.plans.map(plan => (
                        <SwitchInput
                            key={plan.id}
                            id={plan.id}
                            label={plan.name}
                            checked={selectedPlan === plan.id}
                            onCheckedChange={(e) => setSelectedPlan(e ? plan.id : null)}
                        />
                    ))}
                </div>
                <Button
                    text='Guardar'
                    color="primary"
                    rounded
                    onClick={onSave}
                    loading={requestState.loading}
                />
            </CardContent>
        </Card>
    )
}

export default SetPlan;