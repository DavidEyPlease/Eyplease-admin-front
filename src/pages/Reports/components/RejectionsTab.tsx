import { Panel } from "./ui"
import { useRejectedUploads, RejectedUpload } from "../useReports"
import { decodeError, periodLabel, fmtDateTime, type ReportsCountry } from "../reports.constants"

const Card = ({ name, account, section, reason, when }: { name: string; account: string; section: string; reason: string; when: string }) => (
    <div className="flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-500/10 p-3.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
        </span>
        <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{name}</span>
                <span className="text-xs text-muted-foreground">{account}</span>
                <span className="rounded bg-card px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">{section}</span>
            </div>
            <div className="mt-1 text-sm text-rose-700 dark:text-rose-400">{reason}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{when}</div>
        </div>
    </div>
)

const RejectionsTab = ({ period, country }: { period: string; country: ReportsCountry }) => {
    const { items, loading } = useRejectedUploads(period, country)

    return (
        <Panel>
            <div className="px-5 pt-5">
                <h3 className="text-sm font-semibold text-foreground">Reportes rechazados</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Cargas con error en el periodo. Revisa el motivo y vuelve a subir.</p>
            </div>
            <div className="space-y-3 px-5 py-4">
                {loading ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">Cargando…</div>
                ) : items.length ? (
                    items.map((u: RejectedUpload) => (
                        <Card key={u.id} name={u.name} account={u.account} section={u.section} reason={decodeError(u.reason)} when={fmtDateTime(u.created_at)} />
                    ))
                ) : (
                    <div className="py-12 text-center">
                        <div className="text-2xl">✓</div>
                        <div className="mt-2 text-sm text-muted-foreground">Ningún reporte rechazado en {periodLabel(period)}.</div>
                    </div>
                )}
            </div>
        </Panel>
    )
}

export default RejectionsTab
