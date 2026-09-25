import { SparklesIcon } from "lucide-react";

import SwitchInput from "@/components/common/Inputs/Switch";
import CopyButton from "@/components/generics/CopyButton";
import FieldValue from "@/components/generics/FieldValue";
import { API_ROUTES } from "@/constants/api";
import useFetchQuery from "@/hooks/useFetchQuery";
import useRequest from "@/hooks/useRequest";
import { ApiResponse } from "@/interfaces/common";
import { Card, CardContent } from "@/uishadcn/ui/card";
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

interface Props {
    clientId: string
    /** users.id de la clienta: es el que va en su ficha de la estación (directora.eyplease_user_id). */
    userId?: string
}

const READINESS = [
    'Consentimiento de imagen y voz firmado',
    'Foto de referencia y character sheet',
    'Video de gestos (sus 3 a 5 fragmentos)',
    'Voz clonada en ElevenLabs',
    'Ficha en la estación con su ID de usuario',
]

/**
 * «Clon activo»: la Directora puede pedir «Reel con mi clon» desde su portal y su app.
 * Se prende sólo cuando su clon ya está listo en la Mac; si no, el pedido llega y no hay con qué hacerlo.
 */
const CloneReelToggle = ({ clientId, userId }: Props) => {
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

    return (
        <Card className="h-max">
            <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="flex items-center gap-2 text-xl font-semibold"><SparklesIcon className="size-5 text-primary" />Clon activo</p>
                        <p className="text-sm text-muted-foreground">Puede pedir «Reel con mi clon» desde su portal y su app.</p>
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
                    <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                        Está activa desde la lista del servidor (CLONE_REELS_USER_IDS). Para manejarla desde aquí, quítala de esa lista.
                    </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <FieldValue label="Reels este mes" value={String(status?.reels_this_month ?? 0)} flexDirection="col" className="items-start" />
                    <FieldValue label="Reels en total" value={String(status?.reels_total ?? 0)} flexDirection="col" className="items-start" />
                    {status?.enabled_at && <FieldValue label="Activo desde" value={formatDate(new Date(status.enabled_at))} flexDirection="col" className="items-start" />}
                </div>

                {userId && (
                    <FieldValue label="ID para su ficha" flexDirection="col" className="items-start">
                        <CopyButton text={userId} />
                    </FieldValue>
                )}

                <div>
                    <p className="mb-1 text-sm font-semibold">Antes de prenderlo, confirma en la estación:</p>
                    <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
                        {READINESS.map(item => <li key={item}>{item}</li>)}
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}

export default CloneReelToggle;
