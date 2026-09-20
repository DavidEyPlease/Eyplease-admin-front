import { useState } from "react"
import { LinkIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import { cn } from "@/lib/utils"
import { queryKeys } from "@/utils/queryKeys"

interface LinkedAccount {
    id: string
    account: string
    country: string
    name: string
    plan: string | null
    active: boolean
    current: boolean
}

const PAISES: Record<string, { bandera: string; nombre: string }> = {
    MEX: { bandera: "🇲🇽", nombre: "México" },
    COL: { bandera: "🇨🇴", nombre: "Colombia" },
    USA: { bandera: "🇺🇸", nombre: "Estados Unidos" },
}

const paisDe = (codigo: string) => PAISES[codigo?.toUpperCase()] ?? { bandera: "🌎", nombre: codigo }

/**
 * Las cuentas de una misma persona: su unidad de México y la de otro país.
 *
 * Mary Kay le da un número distinto en cada país (186234 y 186234MX), así que son dos cuentas
 * separadas, cada una con su plan, su cobranza, sus consultoras y sus reportes. Ligarlas sólo dice
 * que son de la misma persona, y es lo que le deja a ELLA cambiar de una a otra sin cerrar sesión.
 */
const LinkedAccounts = ({ clientId }: { clientId: string }) => {
    const [abriendo, setAbriendo] = useState(false)
    const [numero, setNumero] = useState("")

    const llave = queryKeys.detail("client-accounts", clientId)
    const { response, loading } = useFetchQuery<LinkedAccount[]>(`/clients/${clientId}/accounts`, {
        customQueryKey: llave,
    })
    const { request, requestState } = useRequestQuery({ invalidateQueries: [llave] })

    const cuentas = Array.isArray(response) ? response : []

    const ligar = async () => {
        const cuenta = numero.trim()
        if (!cuenta) return

        try {
            await request("POST", `/clients/${clientId}/accounts`, { account: cuenta })
            toast.success(`Ligada con la cuenta ${cuenta}`)
            setNumero("")
            setAbriendo(false)
        } catch (error) {
            toast.error((error as { message?: string })?.message || "No se pudo ligar esa cuenta")
        }
    }

    const desligar = async () => {
        try {
            await request("DELETE", `/clients/${clientId}/accounts`)
            toast.success("Cuenta desligada")
        } catch {
            toast.error("No se pudo desligar")
        }
    }

    return (
        <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <LinkIcon className="size-4 text-primary" /> Sus cuentas
                </h3>
                {cuentas.length > 0 && (
                    <button type="button" onClick={desligar} disabled={requestState.loading} className="cursor-pointer text-[11.5px] font-bold text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50">
                        <Trash2Icon className="mr-1 inline size-3.5" />Desligar
                    </button>
                )}
            </div>

            {loading ? (
                <div className="mt-3 h-12 animate-pulse rounded-xl bg-foreground/[.06]" />
            ) : cuentas.length > 0 ? (
                <ul className="mt-3 grid gap-1.5">
                    {cuentas.map((cuenta) => {
                        const pais = paisDe(cuenta.country)
                        return (
                            <li key={cuenta.id} className={cn("flex items-center gap-2.5 rounded-xl border border-border px-3 py-2", cuenta.current && "border-primary/40 bg-primary/[.06]")}>
                                <span aria-hidden className="text-base leading-none">{pais.bandera}</span>
                                <span className="min-w-0 flex-1">
                                    <b className="block truncate text-[13px] font-bold">{pais.nombre}{cuenta.current ? " · esta ficha" : ""}</b>
                                    <small className="block truncate text-[11.5px] text-muted-foreground">
                                        {cuenta.account}{cuenta.plan ? ` · ${cuenta.plan}` : ""}{!cuenta.active ? " · desactivada" : ""}
                                    </small>
                                </span>
                            </li>
                        )
                    })}
                </ul>
            ) : (
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                    Sólo tiene esta cuenta. Si abrió unidad en otro país, Mary Kay le dio un número distinto:
                    crea esa clienta aparte y después lígala aquí para que pueda cambiar de una a otra sin
                    cerrar sesión.
                </p>
            )}

            {abriendo ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                        autoFocus
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") ligar() }}
                        placeholder="Número de la otra cuenta (ej. 186234MX)"
                        className="h-9 min-w-[230px] flex-1 rounded-xl border border-border bg-card px-3 text-[13px] outline-none focus:border-[#5B47E0]"
                    />
                    <button type="button" onClick={ligar} disabled={!numero.trim() || requestState.loading} className="h-9 cursor-pointer rounded-xl bg-primary px-3.5 text-[12.5px] font-bold text-white disabled:opacity-50">
                        Ligar
                    </button>
                    <button type="button" onClick={() => { setAbriendo(false); setNumero("") }} className="h-9 cursor-pointer px-2 text-[12.5px] font-bold text-muted-foreground hover:text-foreground">
                        Cancelar
                    </button>
                </div>
            ) : (
                <button type="button" onClick={() => setAbriendo(true)} className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-[12.5px] font-bold text-primary hover:underline">
                    <PlusIcon className="size-3.5" /> Ligar su cuenta de otro país
                </button>
            )}
        </section>
    )
}

export default LinkedAccounts
