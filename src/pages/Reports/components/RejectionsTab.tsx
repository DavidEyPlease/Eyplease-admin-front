import { Panel } from "./ui"
import { useRejectedUploads, RejectedUpload } from "../useReports"
import { decodeError, periodLabel, fmtDateTime } from "../reports.constants"

const Card = ({ name, account, section, reason, when }: { name: string; account: string; section: string; reason: string; when: string }) => (
    <div className="flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50/40 p-3.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
        </span>
        <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">{name}</span>
                <span className="text-xs text-slate-400">{account}</span>
                <span className="rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-500">{section}</span>
            </div>
            <div className="mt-1 text-sm text-rose-700">{reason}</div>
            <div className="mt-0.5 text-[11px] text-slate-400">{when}</div>
        </div>
    </div>
)

const RejectionsTab = ({ period }: { period: string }) => {
    const { items, loading } = useRejectedUploads(period)

    return (
        <Panel>
            <div className="px-5 pt-5">
                <h3 className="text-sm font-semibold text-slate-800">Reportes rechazados</h3>
                <p className="mt-0.5 text-xs text-slate-400">Cargas con error en el periodo. Revisa el motivo y vuelve a subir.</p>
            </div>
            <div className="space-y-3 px-5 py-4">
                {loading ? (
                    <div className="py-10 text-center text-sm text-slate-400">Cargando…</div>
                ) : items.length ? (
                    items.map((u: RejectedUpload) => (
                        <Card key={u.id} name={u.name} account={u.account} section={u.section} reason={decodeError(u.reason)} when={fmtDateTime(u.created_at)} />
                    ))
                ) : (
                    <div className="py-12 text-center">
                        <div className="text-2xl">✓</div>
                        <div className="mt-2 text-sm text-slate-500">Ningún reporte rechazado en {periodLabel(period)}.</div>
                    </div>
                )}
            </div>
        </Panel>
    )
}

export default RejectionsTab
