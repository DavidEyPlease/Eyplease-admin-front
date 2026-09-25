import { useState } from "react"
import { CheckIcon, HeartIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import { moneyIn } from "@/constants/countries"
import { cn } from "@/lib/utils"
import { queryKeys } from "@/utils/queryKeys"

type MonthStatus = "yes" | "no" | "pending"

interface PinkCircleMember {
    id: string
    account: string
    name: string
    status: string | null
    /** Meses seguidos al cierre del último mes terminado del reporte. */
    months: number
    /** El reporte no alcanza a ver el principio de la racha: lleva ESTO o más. */
    at_least: boolean
    source: "report" | "capture"
    current_month_reached: boolean
    /** `months` + el mes en curso si ya llegó al descuento. */
    months_now: number
    in_circle: boolean
    next_milestone: number | null
    needs_capture: boolean
    capture: { months: number, as_of: string, captured_at: string | null, captured_by: string | null } | null
    /** Del mes más reciente al más viejo. */
    history: Array<{ month: string, status: MonthStatus, amount: number }>
}

interface PinkCircleUnit {
    report: { current_month: string, closed_month: string, uploaded_at: string | null, threshold: number } | null
    members: PinkCircleMember[]
    totals: { members: number, in_circle: number, current_month_reached: number, needs_capture: number }
}

const mes = (yearMonth: string, month: "long" | "short" = "long") => {
    const [year, number] = yearMonth.split("-").map(Number)
    const nombre = new Date(year, number - 1, 1).toLocaleDateString("es-CO", { month })
    return month === "long" ? `${nombre} ${year}` : nombre.replace(".", "")
}

const PARTICULAS = new Set(["de", "del", "la", "las", "los", "y", "e"])

/** El padrón guarda los nombres en minúsculas: «yesica de la cruz» → «Yesica de la Cruz». */
const nombrePropio = (name: string) => name
    .split(" ")
    .map((palabra, index) => index > 0 && PARTICULAS.has(palabra) ? palabra : palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ")

const MONTH_CLASS: Record<MonthStatus, string> = {
    yes: "bg-pink-500",
    no: "bg-foreground/10",
    pending: "border border-dashed border-pink-400 bg-transparent",
}

const MONTH_LABEL: Record<MonthStatus, string> = {
    yes: "llegó al 30%",
    no: "no llegó",
    pending: "en curso, aún no llega",
}

/**
 * Círculo Rosa de COLOMBIA en la ficha de una Directora.
 *
 * Allá no hay reporte del programa: los meses seguidos se cuentan con su reporte de Ventas en pesos
 * (un mes cuenta si sus órdenes llegaron al 30% de descuento). Ese reporte trae 13 meses, así que de
 * quien calificó en todos sólo se sabe que lleva «12 o más»: aquí se captura cuántos lleva de verdad,
 * y de ahí en adelante suma sola cada mes que vuelve a calificar.
 */
const PinkCircleColombia = ({ clientId }: { clientId: string }) => {
    const [todas, setTodas] = useState(false)
    const [editando, setEditando] = useState<string | null>(null)
    const [meses, setMeses] = useState("")

    const llave = queryKeys.detail("client-pink-circle", clientId)
    const { response, loading } = useFetchQuery<PinkCircleUnit>(`/clients/${clientId}/pink-circle`, {
        customQueryKey: llave,
    })
    const { request, requestState } = useRequestQuery({
        invalidateQueries: [llave],
        onError: (error) => { toast.error((error as { message?: string })?.message || "No se pudo guardar") },
    })

    const reporte = response?.report ?? null
    const integrantes = response?.members ?? []
    const enRacha = integrantes.filter(persona => persona.months_now > 0 || persona.needs_capture || persona.capture)
    const lista = todas ? integrantes : enRacha

    const abrir = (persona: PinkCircleMember) => {
        setEditando(persona.id)
        // Sólo se precarga una captura que ya existe: un «12» puesto de guía acababa en «1220» al teclear encima.
        setMeses(persona.capture ? String(persona.capture.months) : "")
    }

    const guardar = async (persona: PinkCircleMember) => {
        const cifra = Number(meses)
        if (!Number.isInteger(cifra) || cifra < 1) {
            toast.error("Escribe cuántos meses seguidos lleva (1 o más)")
            return
        }
        await request("PUT", `/clients/${clientId}/pink-circle/${persona.id}`, { months: cifra })
        toast.success(`${nombrePropio(persona.name)}: ${cifra} meses al cierre de ${reporte ? mes(reporte.closed_month) : "su último mes"}`)
        setEditando(null)
    }

    const quitar = async (persona: PinkCircleMember) => {
        await request("DELETE", `/clients/${clientId}/pink-circle/${persona.id}`)
        toast.success("Captura quitada: vuelve a contar sólo con el reporte")
    }

    return (
        <section className="rounded-2xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <HeartIcon className="size-4 text-pink-500" /> Círculo Rosa · Colombia
            </h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                Se cuenta solo con su reporte de <b>Ventas en pesos</b>: un mes cuenta si sus órdenes llegaron al 30% de
                descuento{reporte ? ` (${moneyIn(reporte.threshold, "COP")})` : ""}. Entra al Círculo con 3 meses seguidos, y un mes sin
                llegar la regresa a cero.
            </p>

            {loading ? (
                <div className="mt-4 h-24 animate-pulse rounded-xl bg-foreground/[.06]" />
            ) : !reporte ? (
                <div className="mt-4 rounded-xl border border-dashed border-border p-4 text-[12.5px] leading-relaxed text-muted-foreground">
                    Todavía no tiene cargado su reporte de Ventas en pesos. En el portal de Mary Kay Colombia baja
                    «Ventas Mensuales Personales» en la vista <b>Pesos</b> y súbelo en Reportes como
                    «Círculo Rosa · Ventas en pesos».
                </div>
            ) : (
                <>
                    <p className="mt-3 text-[12px] text-muted-foreground">
                        Meses cerrados hasta <b className="text-foreground">{mes(reporte.closed_month)}</b>
                        {/* La API guarda la hora en UTC */}
                        {reporte.uploaded_at ? ` · reporte cargado el ${new Date(`${reporte.uploaded_at.replace(" ", "T")}Z`).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}` : ""}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <Pastilla valor={response?.totals.in_circle ?? 0} texto="en el Círculo (3 o más)" />
                        <Pastilla valor={response?.totals.current_month_reached ?? 0} texto={`ya aseguraron ${mes(reporte.current_month, "short")}`} />
                        {(response?.totals.needs_capture ?? 0) > 0 && (
                            <Pastilla valor={response?.totals.needs_capture ?? 0} texto="por capturar" aviso />
                        )}
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 text-[12px] font-bold">
                        <button type="button" onClick={() => setTodas(false)} className={cn("cursor-pointer rounded-lg px-2.5 py-1", !todas ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
                            En racha ({enRacha.length})
                        </button>
                        <button type="button" onClick={() => setTodas(true)} className={cn("cursor-pointer rounded-lg px-2.5 py-1", todas ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
                            Todas ({integrantes.length})
                        </button>
                    </div>

                    {lista.length === 0 ? (
                        <p className="mt-3 text-[12.5px] text-muted-foreground">Nadie va en racha según este reporte.</p>
                    ) : (
                        <ul className="mt-3 grid gap-2">
                            {lista.map(persona => {
                                const abierta = editando === persona.id
                                const faltan = persona.next_milestone ? persona.next_milestone - persona.months_now : null

                                return (
                                    <li key={persona.id} className={cn("rounded-xl border px-3.5 py-3", persona.needs_capture && !persona.capture ? "border-amber-300 bg-amber-50/70 dark:bg-amber-500/10" : "border-border")}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <b className="block truncate text-[13px] font-bold">{nombrePropio(persona.name)}</b>
                                                <small className="block text-[11.5px] text-muted-foreground">
                                                    {persona.account}{persona.status ? ` · ${persona.status}` : ""}
                                                    {persona.in_circle ? " · en el Círculo" : ""}
                                                </small>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <b className="block text-[22px] font-extrabold leading-none text-pink-600">
                                                    {persona.months_now}{persona.at_least ? "+" : ""}
                                                </b>
                                                <small className="text-[11px] text-muted-foreground">
                                                    {persona.months_now === 1 && !persona.at_least ? "mes seguido" : "meses seguidos"}
                                                </small>
                                            </div>
                                        </div>

                                        {/* Del mes más viejo al más reciente, como se leen */}
                                        <div className="mt-2.5 flex items-center gap-1" aria-label="Meses del reporte">
                                            {[...persona.history].reverse().map(dato => (
                                                <span
                                                    key={dato.month}
                                                    title={`${mes(dato.month)} · ${moneyIn(dato.amount, "COP")} · ${MONTH_LABEL[dato.status]}`}
                                                    className={cn("h-3 flex-1 rounded-[3px]", MONTH_CLASS[dato.status])}
                                                />
                                            ))}
                                        </div>

                                        <p className="mt-2 text-[12px] text-muted-foreground">
                                            {persona.current_month_reached && (
                                                <span className="mr-2 font-semibold text-emerald-600">
                                                    <CheckIcon className="mr-0.5 inline size-3.5" />ya aseguró {mes(reporte.current_month, "short")}
                                                </span>
                                            )}
                                            {faltan !== null && persona.months_now > 0 && !persona.at_least && (
                                                <span>Le {faltan === 1 ? "falta 1 mes" : `faltan ${faltan} meses`} para el hito de {persona.next_milestone}</span>
                                            )}
                                        </p>

                                        {abierta ? (
                                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                                <span className="text-[12px] text-foreground">Meses seguidos al cierre de {mes(reporte.closed_month)}:</span>
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    min={1}
                                                    value={meses}
                                                    placeholder={persona.at_least ? `${persona.months} o más` : String(persona.months)}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => setMeses(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === "Enter") guardar(persona) }}
                                                    className="h-8 w-24 rounded-lg border border-border bg-card px-2 text-[13px] outline-none focus:border-[#5B47E0]"
                                                />
                                                <button type="button" onClick={() => guardar(persona)} disabled={requestState.loading} className="h-8 cursor-pointer rounded-lg bg-primary px-3 text-[12px] font-bold text-white disabled:opacity-50">
                                                    Guardar
                                                </button>
                                                <button type="button" onClick={() => setEditando(null)} className="h-8 cursor-pointer px-1.5 text-[12px] font-bold text-muted-foreground hover:text-foreground">
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : persona.capture ? (
                                            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                                                <span>
                                                    Capturado: <b className="text-foreground">{persona.capture.months}</b> al cierre de {mes(persona.capture.as_of)}
                                                    {persona.capture.captured_by ? ` · ${persona.capture.captured_by}` : ""}
                                                    {persona.source === "report" ? " · ya no cuenta: después se le cortó la racha" : ""}
                                                </span>
                                                <button type="button" onClick={() => abrir(persona)} className="cursor-pointer font-bold text-primary hover:underline">
                                                    <PencilIcon className="mr-0.5 inline size-3" />Cambiar
                                                </button>
                                                <button type="button" onClick={() => quitar(persona)} disabled={requestState.loading} className="cursor-pointer font-bold hover:text-destructive disabled:opacity-50">
                                                    <Trash2Icon className="mr-0.5 inline size-3" />Quitar
                                                </button>
                                            </p>
                                        ) : persona.needs_capture ? (
                                            <p className="mt-2 text-[12px] text-amber-800 dark:text-amber-300">
                                                Calificó en todos los meses del reporte: lleva {persona.months} o más.{" "}
                                                <button type="button" onClick={() => abrir(persona)} className="cursor-pointer font-bold underline">
                                                    Capturar cuántos lleva
                                                </button>
                                            </p>
                                        ) : persona.months_now > 0 ? (
                                            <button type="button" onClick={() => abrir(persona)} className="mt-1.5 cursor-pointer text-[11.5px] font-bold text-muted-foreground hover:text-primary">
                                                ¿No es su cifra? Corregir
                                            </button>
                                        ) : null}
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </>
            )}
        </section>
    )
}

const Pastilla = ({ valor, texto, aviso = false }: { valor: number, texto: string, aviso?: boolean }) => (
    <span className={cn("rounded-full border px-2.5 py-1 text-[12px]", aviso ? "border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200" : "border-border text-muted-foreground")}>
        <b className={cn("mr-1", aviso ? "" : "text-foreground")}>{valor}</b>{texto}
    </span>
)

export default PinkCircleColombia
