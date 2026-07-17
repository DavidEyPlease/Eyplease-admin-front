import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Panel, BtnPrimary } from "./ui"
import { useDispatchImport } from "../useReports"
import { MESES } from "../reports.constants"
import Dropdown from "@/components/common/Inputs/Dropdown"
import useAuthStore from "@/store/auth"
import { NewsletterTypes } from "@/interfaces/common"
import { Checkbox } from "@/uishadcn/ui/checkbox"
import { Switch } from "@/uishadcn/ui/switch"
import { Separator } from "@/uishadcn/ui/separator"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldTitle } from "@/uishadcn/ui/field"

const EARLY_SECTION = { label: "Tempraneras", value: "early" }

const RunTab = () => {
    const { dispatch, dispatching } = useDispatchImport()
    const { utilData } = useAuthStore((s) => s)

    const [type, setType] = useState<string>("")
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
    const [sections, setSections] = useState<string[]>([])
    const [onlyNew, setOnlyNew] = useState(false)
    const [account, setAccount] = useState("")

    // Boletines y sus secciones importables — dinámico desde utilData (nada hardcodeado).
    // Tempraneras (early) solo aplica al boletín de Unidad.
    const newsletters = useMemo(
        () =>
            utilData.newsletters.map((n) => ({
                code: n.code,
                name: n.name,
                sections: [
                    ...n.sections.filter((s) => s.canImported).map((s) => ({ label: s.name, value: s.sectionKey })),
                    ...(n.code === NewsletterTypes.UNITY ? [EARLY_SECTION] : []),
                ],
            })),
        [utilData.newsletters]
    )
    const boletinOptions = newsletters.map((n) => ({ label: n.name, value: n.code }))
    const currentSections = newsletters.find((n) => n.code === type)?.sections ?? []

    // Solo mes anterior / actual / siguiente (lo que acepta el endpoint).
    const monthOptions = useMemo(() => {
        const now = new Date()
        return [-1, 0, 1].map((off) => {
            const d = new Date(now.getFullYear(), now.getMonth() + off, 1)
            const tag = off === 0 ? " (actual)" : off === -1 ? " (anterior)" : " (siguiente)"
            return { value: String(d.getMonth() + 1), label: `${MESES[d.getMonth()]} ${d.getFullYear()}${tag}` }
        })
    }, [])

    const toggleSection = (value: string, checked: boolean) =>
        setSections((prev) => (checked ? [...prev, value] : prev.filter((s) => s !== value)))

    const runDispatch = () => {
        if (!type) {
            toast.error("Selecciona un boletín")
            return
        }
        const name = newsletters.find((n) => n.code === type)?.name ?? "boletín"
        const scope = sections.length ? `${sections.length} sección(es)` : "todas las secciones"
        toast(`¿Procesar importación de ${name} (${MESES[month - 1]})?`, {
            description: `Se importarán ${scope}${onlyNew ? ", solo registros nuevos" : ""}.`,
            action: {
                label: "Sí, procesar",
                onClick: async () => {
                    try {
                        await dispatch({ type, month, sections, only_new: onlyNew })
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
        toast.info("Pendiente")
    }

    return (
        <div className="grid items-start gap-5 lg:grid-cols-2">
            <Panel>
                <div className="px-5 pt-5">
                    <h3 className="text-sm font-semibold text-slate-800">Procesar reportes hacia boletines</h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Re-ejecuta la importación de los reportes ya descargados (S3) hacia la plataforma
                    </p>
                </div>
                <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                    <Dropdown
                        label="Boletín"
                        placeholder="Selecciona un boletín"
                        value={type}
                        items={boletinOptions}
                        onChange={(v) => { setType(v); setSections([]); setOnlyNew(false) }}
                    />
                    <Dropdown
                        label="Mes"
                        placeholder="Selecciona un mes"
                        value={String(month)}
                        items={monthOptions}
                        onChange={(v) => setMonth(Number(v))}
                    />
                </div>

                {type && (
                    <div className="flex flex-col gap-4 px-5 pb-2">
                        <FieldSet>
                            <FieldDescription>
                                Solo se importarán las secciones seleccionadas; si no seleccionas ninguna se importarán todas las secciones del boletín.
                            </FieldDescription>
                            <FieldGroup className="gap-3">
                                {currentSections.map((s) => (
                                    <Field orientation="horizontal" key={s.value}>
                                        <Checkbox
                                            id={s.value}
                                            checked={sections.includes(s.value)}
                                            onCheckedChange={(checked) => toggleSection(s.value, checked === true)}
                                        />
                                        <FieldLabel htmlFor={s.value} className="font-normal">{s.label}</FieldLabel>
                                    </Field>
                                ))}
                            </FieldGroup>
                        </FieldSet>
                        <Separator />
                        <FieldGroup className="w-full max-w-sm">
                            <FieldLabel htmlFor="only-new-import">
                                <Field orientation="horizontal">
                                    <FieldContent>
                                        <FieldTitle>Importar solo nuevos</FieldTitle>
                                        <FieldDescription>
                                            Si activas esta opción, solo se importarán los registros que no existan en la base de datos. Los registros existentes no se actualizarán.
                                        </FieldDescription>
                                    </FieldContent>
                                    <Switch id="only-new-import" checked={onlyNew} onCheckedChange={setOnlyNew} />
                                </Field>
                            </FieldLabel>
                        </FieldGroup>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3 px-5 pb-5 pt-2">
                    <BtnPrimary onClick={runDispatch} disabled={dispatching || !type}>
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        {dispatching ? "Procesando…" : "Procesar importación"}
                    </BtnPrimary>
                    <span className="text-xs text-slate-400">Solo mes anterior / actual / siguiente.</span>
                </div>
            </Panel>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-16px_rgba(91,71,224,0.18)]">
                <div className="px-5 pt-5">
                    <h3 className="text-sm font-semibold text-slate-800">
                        Correr descarga de reportes
                        <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">Pendiente</span>
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">Dispara la descarga de los reportes.</p>
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
