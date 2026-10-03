import { CopyIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import SwitchInput from "@/components/common/Inputs/Switch";
import { API_ROUTES } from "@/constants/api";
import useFetchQuery from "@/hooks/useFetchQuery";
import useRequest from "@/hooks/useRequest";
import { ApiResponse } from "@/interfaces/common";
import { replaceRecordIdInPath } from "@/utils";
import { formatDate } from "@/utils/dates";
import { queryKeys } from "@/utils/queryKeys";

interface CloneReelStatus {
    enabled: boolean
    enabled_at: string | null
    enabled_by_env: boolean
    reels_this_month: number
    reels_total: number
}

const READINESS = [
    'Consentimiento de imagen y voz firmado',
    'Foto de referencia y character sheet',
    'Video de gestos (sus 3 a 5 fragmentos)',
    'Voz clonada en ElevenLabs',
    'Ficha en la estación con su ID de usuario',
]

/**
 * «Clon activo» con la piel nueva: la misma lógica que `components/CloneReelToggle` (el GET y el PATCH
 * de `clone-reel`). Se prende sólo cuando su clon ya está listo en la Mac; si no, el pedido llega y no
 * hay con qué hacerlo.
 */
const CloneReel = ({ clientId, userId }: { clientId: string, userId?: string }) => {
    const url = replaceRecordIdInPath(API_ROUTES.CLIENTS.CLONE_REEL, clientId)
    const { response: status, loading, setData } = useFetchQuery<CloneReelStatus>(url, {
        customQueryKey: queryKeys.detail('client-clone-reel', clientId),
        enabled: !!clientId,
    })
    const { request, requestState } = useRequest('PATCH')

    const onToggle = async (enabled: boolean) => {
        const res = await request<ApiResponse<CloneReelStatus>, { enabled: boolean }>(url, { enabled })
        if (res.success) setData(res.data)
    }

    const copyId = async () => {
        if (!userId) return
        await navigator.clipboard.writeText(userId)
        toast.success('ID copiado')
    }

    return (
        <section className="shell-glass grid min-w-0 grid-cols-1 rounded-3xl p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="flex items-center gap-2 text-[15px] font-extrabold"><SparklesIcon className="size-4 text-[#6C47FF] dark:text-[#A894FF]" /> Clon activo</h2>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">Puede pedir «Reel con mi clon» desde su portal y su app.</p>
                </div>
                <SwitchInput
                    id={`clone-reel-${clientId}`}
                    checked={!!status?.enabled}
                    disabled={loading || !!status?.enabled_by_env}
                    loading={requestState.loading}
                    onCheckedChange={value => onToggle(value)}
                />
            </div>

            {status?.enabled_by_env && (
                <p className="mt-3 rounded-xl bg-foreground/[.04] px-3 py-2 text-[12px] text-muted-foreground">
                    Está activa desde la lista del servidor (CLONE_REELS_USER_IDS). Para manejarla desde aquí, quítala de esa lista.
                </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-border px-3 py-2.5">
                    <p className="text-[10.5px] font-extrabold tracking-[.1em] text-muted-foreground uppercase">Este mes</p>
                    <p className="text-[20px] font-extrabold tabular-nums">{status?.reels_this_month ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-border px-3 py-2.5">
                    <p className="text-[10.5px] font-extrabold tracking-[.1em] text-muted-foreground uppercase">En total</p>
                    <p className="text-[20px] font-extrabold tabular-nums">{status?.reels_total ?? 0}</p>
                </div>
                {status?.enabled_at && (
                    <div className="col-span-2 rounded-2xl border border-border px-3 py-2.5 sm:col-span-1">
                        <p className="text-[10.5px] font-extrabold tracking-[.1em] text-muted-foreground uppercase">Activo desde</p>
                        <p className="truncate text-[13.5px] font-bold">{formatDate(new Date(status.enabled_at), { date: 'medium' })}</p>
                    </div>
                )}
            </div>

            {userId && (
                <div className="mt-3 flex min-w-0 items-center gap-2 rounded-2xl border border-border px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                        <p className="text-[10.5px] font-extrabold tracking-[.1em] text-muted-foreground uppercase">ID para su ficha en la estación</p>
                        <p className="truncate font-mono text-[12.5px]">{userId}</p>
                    </div>
                    <button type="button" onClick={copyId} aria-label="Copiar ID" title="Copiar ID" className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/[.06] hover:text-foreground">
                        <CopyIcon className="size-3.5" />
                    </button>
                </div>
            )}

            <div className="mt-4">
                <p className="text-[12.5px] font-bold">Antes de prenderlo, confirma en la estación:</p>
                <ul className="mt-1.5 grid gap-1">
                    {READINESS.map(item => (
                        <li key={item} className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                            <span className="size-1.5 shrink-0 rounded-full bg-[#6C47FF]/60" />{item}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export default CloneReel;
