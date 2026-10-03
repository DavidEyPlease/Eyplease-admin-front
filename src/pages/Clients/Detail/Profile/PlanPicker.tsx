import { useState } from "react";
import { CheckIcon, Loader2Icon, LayersIcon } from "lucide-react";
import { toast } from "sonner";

import { API_ROUTES } from "@/constants/api";
import { moneyIn } from "@/constants/countries";
import useRequest from "@/hooks/useRequest";
import { IClient } from "@/interfaces/clients";
import { ApiResponse } from "@/interfaces/common";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/auth";
import { replaceRecordIdInPath } from "@/utils";
import { publishEvent } from "@/utils/events";

interface Props {
    clientId: string
    activePlanId: string | null
}

/**
 * Asignarle un plan a mano: el mismo PATCH de siempre (`set-plan`), con los planes en tarjetas y el
 * suyo marcado. Al guardar avisa con `client-updated` para que la ficha se ponga al día sola.
 */
const PlanPicker = ({ clientId, activePlanId }: Props) => {
    const plans = useAuthStore(state => state.utilData.plans)
    const { request, requestState } = useRequest('PATCH')
    const [selected, setSelected] = useState<string | null>(activePlanId)
    const changed = !!selected && selected !== activePlanId

    const onSave = async () => {
        if (!selected) return
        const response = await request<ApiResponse<IClient>, { plan_id: string }>(
            replaceRecordIdInPath(API_ROUTES.CLIENTS.SET_PLAN, clientId),
            { plan_id: selected }
        )
        if (response.success) {
            publishEvent('client-updated', response.data)
            toast.success('Plan actualizado')
        }
    }

    return (
        <section className="shell-glass grid min-w-0 grid-cols-1 rounded-3xl p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-extrabold"><LayersIcon className="size-4 text-[#6C47FF] dark:text-[#A894FF]" /> Su plan</h2>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">El que tiene asignado. Para cambiárselo a mano, elige otro y guarda.</p>

            <div className="mt-4 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                {plans.map(plan => {
                    const isSelected = selected === plan.id
                    const isCurrent = activePlanId === plan.id
                    return (
                        <button
                            key={plan.id}
                            type="button"
                            onClick={() => setSelected(plan.id)}
                            className={cn(
                                'flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors',
                                isSelected ? 'border-[#6C47FF] bg-[#6C47FF]/[.07]' : 'border-border bg-card/50 hover:border-[#6C47FF]/40'
                            )}
                        >
                            <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border', isSelected ? 'shell-grad border-transparent text-white' : 'border-border')}>
                                {isSelected && <CheckIcon className="size-3" strokeWidth={3} />}
                            </span>
                            <span className="min-w-0 flex-1">
                                <b className="block truncate text-[13.5px] font-bold">{plan.name}</b>
                                <small className="block truncate text-[11.5px] text-muted-foreground">{moneyIn(Number(plan.price), plan.currency ?? 'MXN')}/mes{plan.free ? ' · gratis' : ''}</small>
                            </span>
                            {isCurrent && <span className="pulse-tag plain shrink-0">El suyo</span>}
                        </button>
                    )
                })}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
                {changed && <button type="button" onClick={() => setSelected(activePlanId)} className="h-10 cursor-pointer rounded-xl px-3.5 text-[13px] font-bold text-muted-foreground hover:text-foreground">Cancelar</button>}
                <button type="button" onClick={onSave} disabled={!changed || requestState.loading} className="shell-cta inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-[13px] font-bold text-white disabled:cursor-default disabled:opacity-50">
                    {requestState.loading && <Loader2Icon className="size-4 animate-spin" />} Guardar plan
                </button>
            </div>
        </section>
    )
}

export default PlanPicker;
