import { useEffect, useRef, useState } from "react"
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon, PlayIcon, RefreshCwIcon } from "lucide-react"
import { toast } from "sonner"

import Button from "@/components/common/Button"
import { Badge } from "@/uishadcn/ui/badge"
import { Progress } from "@/uishadcn/ui/progress"
import useRequestQuery from "@/hooks/useRequestQuery"
import { API_ROUTES } from "@/constants/api"
import { ITemplate } from "@/interfaces/templates"

interface IProps {
    template: ITemplate
}

type JobStatus = "queued" | "started" | "running" | "in-progress" | "finished" | "error" | string

interface IPreviewResponse {
    id: string
    status: JobStatus
    outputUrl?: string | null
    stats?: {
        error?: string
    }
}

const STATUS_LABELS: Record<string, { label: string; variant: "secondary" | "default" | "destructive"; icon: React.ReactNode }> = {
    queued: {
        label: "En cola",
        variant: "secondary",
        icon: <Loader2Icon className="w-3.5 h-3.5 mr-1 animate-spin" />,
    },
    started: {
        label: "Iniciando",
        variant: "secondary",
        icon: <Loader2Icon className="w-3.5 h-3.5 mr-1 animate-spin" />,
    },
    running: {
        label: "Procesando",
        variant: "secondary",
        icon: <Loader2Icon className="w-3.5 h-3.5 mr-1 animate-spin" />,
    },
    "in-progress": {
        label: "Procesando",
        variant: "secondary",
        icon: <Loader2Icon className="w-3.5 h-3.5 mr-1 animate-spin" />,
    },
    finished: {
        label: "Finalizado",
        variant: "default",
        icon: <CheckCircle2Icon className="w-3.5 h-3.5 mr-1" />,
    },
    error: {
        label: "Error",
        variant: "destructive",
        icon: <AlertCircleIcon className="w-3.5 h-3.5 mr-1" />,
    },
}

const getPollIntervalSeconds = (assetType: ITemplate["template_asset_type"]) =>
    assetType === "video" ? 30 : 5

const isTerminalStatus = (status: JobStatus) => status === "finished" || status === "error"

const NexrenderPreviewTemplate = ({ template }: IProps) => {
    const pollSeconds = getPollIntervalSeconds(template.template_asset_type)

    const [response, setResponse] = useState<IPreviewResponse | null>(null)
    const [secondsLeft, setSecondsLeft] = useState<number>(pollSeconds)

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const { request: startRequest, requestState: startState } = useRequestQuery({
        onError: () => { toast.error("No se pudo iniciar la prueba de plantilla") },
    })
    const { request: pollRequest, requestState: pollState } = useRequestQuery({
        onError: () => { toast.error("No se pudo obtener el estado del job") },
    })

    const clearTimers = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        if (countdownRef.current) {
            clearInterval(countdownRef.current)
            countdownRef.current = null
        }
    }

    useEffect(() => {
        return () => clearTimers()
    }, [])

    const fetchJob = async (jobId: string) => {
        const url = `${API_ROUTES.TEMPLATES.GET_JOB_PREVIEW}?jobId=${encodeURIComponent(jobId)}`
        try {
            const res = await pollRequest<undefined, IPreviewResponse>("GET", url)
            if (res?.data) {
                setResponse(res.data)
                if (isTerminalStatus(res.data.status)) {
                    clearTimers()
                    if (res.data.status === "finished") {
                        toast.success("Preview generado correctamente")
                    } else {
                        toast.error(res.data.stats?.error || "El job finalizó con error")
                    }
                }
            }
        } catch {
            // toast handled in onError
        }
    }

    const startPolling = (jobId: string) => {
        clearTimers()
        setSecondsLeft(pollSeconds)

        countdownRef.current = setInterval(() => {
            setSecondsLeft(prev => (prev <= 1 ? pollSeconds : prev - 1))
        }, 1000)

        intervalRef.current = setInterval(() => {
            fetchJob(jobId)
        }, pollSeconds * 1000)
    }

    const onTestTemplate = async () => {
        try {
            const url = API_ROUTES.TEMPLATES.PREVIEW_TEMPLATE.replace("{id}", template.id)
            const res = await startRequest<undefined, IPreviewResponse>("POST", url)
            if (res?.data) {
                setResponse(res.data)
                if (!isTerminalStatus(res.data.status)) {
                    startPolling(res.data.id)
                }
            }
        } catch {
            // toast handled in onError
        }
    }

    const onManualRefresh = () => {
        if (response?.id) fetchJob(response.id)
    }

    const onReset = () => {
        clearTimers()
        setResponse(null)
        setSecondsLeft(pollSeconds)
    }

    const statusInfo = response ? STATUS_LABELS[response.status] || {
        label: response.status,
        variant: "secondary" as const,
        icon: <Loader2Icon className="w-3.5 h-3.5 mr-1 animate-spin" />,
    } : null

    const isFinished = response?.status === "finished"
    const isError = response?.status === "error"
    const isPolling = !!response && !isTerminalStatus(response.status)

    const progressValue = isPolling
        ? ((pollSeconds - secondsLeft) / pollSeconds) * 100
        : 0

    return (
        <div className="p-4 border border-dashed border-gray-300 rounded-md aspect-square max-w-lg mx-auto flex items-center justify-center relative">
            {!response && (
                <Button
                    text={
                        <>
                            <PlayIcon className="w-4 h-4 mr-2" />
                            Probar plantilla
                        </>
                    }
                    loading={startState.loading}
                    onClick={onTestTemplate}
                />
            )}

            {response && (
                <div className="w-full h-full flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                            {statusInfo && (
                                <Badge variant={statusInfo.variant} className="flex items-center">
                                    {statusInfo.icon}
                                    {statusInfo.label}
                                </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                                Job: <span className="font-mono">{response.id}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            {isPolling && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    text={
                                        <>
                                            <RefreshCwIcon className={`w-3.5 h-3.5 mr-1 ${pollState.loading ? "animate-spin" : ""}`} />
                                            Actualizar
                                        </>
                                    }
                                    loading={pollState.loading}
                                    onClick={onManualRefresh}
                                />
                            )}
                            {(isFinished || isError) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    text={
                                        <>
                                            <PlayIcon className="w-3.5 h-3.5 mr-1" />
                                            Probar de nuevo
                                        </>
                                    }
                                    onClick={onReset}
                                />
                            )}
                        </div>
                    </div>

                    {isPolling && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                    Próxima consulta en {secondsLeft}s
                                </span>
                                <span>
                                    Cada {pollSeconds}s ({template.template_asset_type === "video" ? "video" : "imagen"})
                                </span>
                            </div>
                            <Progress value={progressValue} className="h-1.5" />
                        </div>
                    )}

                    <div className="flex-1 min-h-0 flex items-center justify-center bg-muted/30 rounded-md overflow-hidden">
                        {isFinished && response.outputUrl ? (
                            template.template_asset_type === "video" ? (
                                <video
                                    src={response.outputUrl}
                                    controls
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <img
                                    src={response.outputUrl}
                                    alt={`Preview ${template.name}`}
                                    className="w-full h-full object-contain"
                                />
                            )
                        ) : isError ? (
                            <div className="flex flex-col items-center text-destructive p-4 text-center">
                                <AlertCircleIcon className="w-8 h-8 mb-2" />
                                <p className="text-sm font-medium">Ocurrió un error</p>
                                {response.stats?.error && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {response.stats.error}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-muted-foreground p-4 text-center">
                                <Loader2Icon className="w-8 h-8 mb-2 animate-spin" />
                                <p className="text-sm">
                                    {response.status === "queued"
                                        ? "Tu solicitud está en cola, esperando ser procesada..."
                                        : "Procesando preview, esto puede tardar unos minutos..."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NexrenderPreviewTemplate
