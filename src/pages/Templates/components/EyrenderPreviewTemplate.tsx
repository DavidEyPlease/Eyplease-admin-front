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
    /**
     * Optional: if the parent already has unsaved edits in the canvas, it
     * can pass the live `layersTemplate` to preview without persisting first.
     * For now we keep it simple and always preview the persisted template.
     */
    disabled?: boolean
    disabledReason?: string
}

// Eyrender status vocabulary
type JobStatus = "queued" | "processing" | "done" | "failed" | string

interface IPreviewResponse {
    jobId: string
    status: JobStatus
    result?: { s3Url?: string | null, s3Key?: string | null } | null
    error?: { message?: string } | null
}

const STATUS_LABELS: Record<string, { label: string; variant: "secondary" | "default" | "destructive"; icon: React.ReactNode }> = {
    queued: {
        label: "En cola",
        variant: "secondary",
        icon: <Loader2Icon className="w-3.5 h-3.5 mr-1 animate-spin" />,
    },
    processing: {
        label: "Procesando",
        variant: "secondary",
        icon: <Loader2Icon className="w-3.5 h-3.5 mr-1 animate-spin" />,
    },
    done: {
        label: "Finalizado",
        variant: "default",
        icon: <CheckCircle2Icon className="w-3.5 h-3.5 mr-1" />,
    },
    failed: {
        label: "Error",
        variant: "destructive",
        icon: <AlertCircleIcon className="w-3.5 h-3.5 mr-1" />,
    },
}

const POLL_SECONDS = 2
const TIMEOUT_SECONDS = 60

const isTerminalStatus = (status: JobStatus) => status === "done" || status === "failed"

const EyrenderPreviewTemplate = ({ template, disabled, disabledReason }: IProps) => {
    const [response, setResponse] = useState<IPreviewResponse | null>(null)
    const [secondsLeft, setSecondsLeft] = useState<number>(POLL_SECONDS)
    const [elapsed, setElapsed] = useState<number>(0)

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const { request: startRequest, requestState: startState } = useRequestQuery({
        onError: () => { toast.error("No se pudo iniciar la prueba de plantilla") },
    })
    const { request: pollRequest, requestState: pollState } = useRequestQuery({
        onError: () => { toast.error("No se pudo obtener el estado del job") },
    })

    const clearTimers = () => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
        if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null }
        if (timeoutRef.current) { clearInterval(timeoutRef.current); timeoutRef.current = null }
    }

    useEffect(() => () => clearTimers(), [])

    const fetchJob = async (jobId: string) => {
        const url = API_ROUTES.TEMPLATES.GET_EYRENDER_JOB.replace("{jobId}", jobId)
        try {
            const res = await pollRequest<undefined, IPreviewResponse>("GET", url)
            if (res?.data) {
                setResponse({ ...res.data, jobId })
                if (isTerminalStatus(res.data.status)) {
                    clearTimers()
                    if (res.data.status === "done") {
                        toast.success("Preview generado correctamente")
                    } else {
                        toast.error(res.data.error?.message || "El job finalizó con error")
                    }
                }
            }
        } catch { /* toast handled */ }
    }

    const startPolling = (jobId: string) => {
        clearTimers()
        setSecondsLeft(POLL_SECONDS)
        setElapsed(0)

        countdownRef.current = setInterval(() => {
            setSecondsLeft(prev => (prev <= 1 ? POLL_SECONDS : prev - 1))
        }, 1000)

        intervalRef.current = setInterval(() => {
            fetchJob(jobId)
        }, POLL_SECONDS * 1000)

        timeoutRef.current = setInterval(() => {
            setElapsed(prev => {
                const next = prev + 1
                if (next >= TIMEOUT_SECONDS) {
                    clearTimers()
                    toast.error("Tiempo de espera agotado para el preview")
                    setResponse(r => r ? { ...r, status: "failed", error: { message: "Preview timeout" } } : r)
                }
                return next
            })
        }, 1000)
    }

    const onTestTemplate = async () => {
        try {
            const url = API_ROUTES.TEMPLATES.EYRENDER_PREVIEW.replace("{id}", template.id)
            const res = await startRequest<undefined, IPreviewResponse>("POST", url)
            if (res?.data) {
                setResponse(res.data)
                if (!isTerminalStatus(res.data.status)) {
                    startPolling(res.data.jobId)
                }
            }
        } catch { /* toast handled */ }
    }

    const onManualRefresh = () => {
        if (response?.jobId) fetchJob(response.jobId)
    }

    const onReset = () => {
        clearTimers()
        setResponse(null)
        setSecondsLeft(POLL_SECONDS)
        setElapsed(0)
    }

    const statusInfo = response ? STATUS_LABELS[response.status] || {
        label: response.status,
        variant: "secondary" as const,
        icon: <Loader2Icon className="w-3.5 h-3.5 mr-1 animate-spin" />,
    } : null

    const isFinished = response?.status === "done"
    const isError = response?.status === "failed"
    const isPolling = !!response && !isTerminalStatus(response.status)
    const progressValue = isPolling ? ((POLL_SECONDS - secondsLeft) / POLL_SECONDS) * 100 : 0

    return (
        <div className="p-4 border border-dashed border-gray-300 rounded-md aspect-square max-w-lg mx-auto flex items-center justify-center relative">
            {!response && (
                <div className="flex flex-col items-center gap-2">
                    <Button
                        text={<><PlayIcon className="w-4 h-4 mr-2" />Vista previa con datos demo</>}
                        loading={startState.loading}
                        disabled={disabled}
                        onClick={onTestTemplate}
                    />
                    {disabled && disabledReason && (
                        <p className="text-xs text-muted-foreground text-center max-w-xs">{disabledReason}</p>
                    )}
                </div>
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
                                Job: <span className="font-mono">{response.jobId}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            {isPolling && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    text={<><RefreshCwIcon className={`w-3.5 h-3.5 mr-1 ${pollState.loading ? "animate-spin" : ""}`} />Actualizar</>}
                                    loading={pollState.loading}
                                    onClick={onManualRefresh}
                                />
                            )}
                            {(isFinished || isError) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    text={<><PlayIcon className="w-3.5 h-3.5 mr-1" />Probar de nuevo</>}
                                    onClick={onReset}
                                />
                            )}
                        </div>
                    </div>

                    {isPolling && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Próxima consulta en {secondsLeft}s</span>
                                <span>Tiempo transcurrido: {elapsed}s</span>
                            </div>
                            <Progress value={progressValue} className="h-1.5" />
                        </div>
                    )}

                    <div className="flex-1 min-h-0 flex items-center justify-center bg-muted/30 rounded-md overflow-hidden">
                        {isFinished && response.result?.s3Url ? (
                            <img
                                src={response.result.s3Url}
                                alt={`Preview ${template.name}`}
                                className="w-full h-full object-contain"
                            />
                        ) : isError ? (
                            <div className="flex flex-col items-center text-destructive p-4 text-center">
                                <AlertCircleIcon className="w-8 h-8 mb-2" />
                                <p className="text-sm font-medium">Ocurrió un error</p>
                                {response.error?.message && (
                                    <p className="text-xs text-muted-foreground mt-1">{response.error.message}</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-muted-foreground p-4 text-center">
                                <Loader2Icon className="w-8 h-8 mb-2 animate-spin" />
                                <p className="text-sm">
                                    {response.status === "queued"
                                        ? "Tu solicitud está en cola, esperando ser procesada..."
                                        : "Renderizando preview, esto puede tardar unos segundos..."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default EyrenderPreviewTemplate
