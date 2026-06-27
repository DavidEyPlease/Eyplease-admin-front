import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Panel, BtnPrimary } from "./ui"
import { useDispatchImport, DispatchImportInput } from "../useReports"
import { MESES } from "../reports.constants"

const RunTab = () => {
    const { dispatch, dispatching } = useDispatchImport()
    const [type, setType] = useState<DispatchImportInput["type"]>("unit_newsletter")
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
    const [account, setAccount] = useState("")

    // Solo mes anterior / actual / siguiente (lo que acepta el endpoint).
    const monthOptions = useMemo(() => {
        const now = new Date()
        return [-1, 0, 1].map((off) => {
            const d = new Date(now.getFullYear(), now.getMonth() + off, 1)
            const tag = off === 0 ? " (actual)" : off === -1 ? " (anterior)" : " (siguiente)"
            return { value: d.getMonth() + 1, label: `${MESES[d.getMonth()]} ${d.getFullYear()}${tag}` }
        })
    }, [])

    const runDispatch = () => {
        const typeLabel = type === "unit_newsletter" ? "Unidad" : "Nacional"
        toast(`¿Procesar importación del boletín ${typeLabel} (${MESES[month - 1]})?`, {
            description: "Re-procesa los reportes ya descargados hacia la plataforma.",
            action: {
                label: "Sí, procesar",
                onClick: async () => {
                    try {
                        await dispatch({ month, type })
                        toast.success("Importación encolada correctamente")
                    } catch {
                        toast.error("No se pudo encolar la importación")
                    }
                },
            },
        })
    }

    const runScraper = (scope: "all" | "one") => {
        if (scope === "one" && !account.trim()) {
            toast.error("Escribe la cuenta del cliente")
            return
        }
        toast.info("Pendiente: falta el endpoint del scraper en el backend (ver CONTRATO_ALEJANDRO.md)")
    }

    const selectCls = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#5B47E0]"

    return (
        <div className="space-y-5">
            <Panel>
                <div className="px-5 pt-5">
                    <h3 className="text-sm font-semibold text-slate-800">Procesar reportes hacia boletines</h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Re-ejecuta la importación de los reportes ya descargados (S3) hacia la plataforma. Endpoint real:{" "}
                        <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">POST /admin/reports/dispatch-import</code>
                    </p>
                </div>
                <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                    <label className="text-sm">
                        <span className="mb-1 block font-medium text-slate-600">Boletín</span>
                        <select className={selectCls} value={type} onChange={(e) => setType(e.target.value as DispatchImportInput["type"])}>
                            <option value="unit_newsletter">Unidad</option>
                            <option value="national_newsletter">Nacional</option>
                        </select>
                    </label>
                    <label className="text-sm">
                        <span className="mb-1 block font-medium text-slate-600">Mes</span>
                        <select className={selectCls} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                            {monthOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </label>
                </div>
                <div className="flex flex-wrap items-center gap-3 px-5 pb-5">
                    <BtnPrimary onClick={runDispatch} disabled={dispatching}>
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        {dispatching ? "Procesando…" : "Procesar importación"}
                    </BtnPrimary>
                    <span className="text-xs text-slate-400">Se encola en la cola <code className="rounded bg-slate-100 px-1 py-0.5">imports</code>. Solo mes anterior / actual / siguiente.</span>
                </div>
            </Panel>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-16px_rgba(91,71,224,0.18)]">
                <div className="px-5 pt-5">
                    <h3 className="text-sm font-semibold text-slate-800">
                        Correr scraper de descarga (Mary Kay InTouch)
                        <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">Pendiente backend</span>
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">Dispara el Playwright que entra a InTouch y baja los reportes. Requiere un endpoint que Alejandro debe crear.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <button onClick={() => runScraper("all")} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg> Correr para TODOS
                    </button>
                    <div className="flex items-center gap-2">
                        <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Cuenta del cliente (ej. WG3471)" className="w-56 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#5B47E0]" />
                        <button onClick={() => runScraper("one")} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Correr para UNO</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RunTab
