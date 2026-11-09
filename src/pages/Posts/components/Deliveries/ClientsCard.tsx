import { useState } from 'react'
import { useNavigate } from 'react-router'

import { APP_ROUTES } from '@/constants/app'
import { ClientCheckKey, DeliveryClient } from '@/interfaces/deliveries'
import { initials, shortDate } from '../../deliveries.utils'

const CHECKS: Array<{ key: ClientCheckKey, label: string }> = [
    { key: 'robot', label: 'Robot' },
    { key: 'closing', label: 'Cierre' },
    { key: 'daily', label: 'Diarios' },
    { key: 'pieces', label: 'Piezas' },
    { key: 'library', label: 'Biblioteca' },
]

interface Props {
    clients: DeliveryClient[]
    publishing: boolean
    onGeneratePieces: (client: DeliveryClient) => void
}

const ClientRow = ({ client, publishing, onGeneratePieces }: { client: DeliveryClient, publishing: boolean, onGeneratePieces: (client: DeliveryClient) => void }) => {
    const navigate = useNavigate()
    const canGenerate = client.missing.includes('pieces')

    return (
        <div className="pub-client">
            <span className="pub-avatar">{initials(client.name)}</span>
            <span className="pub-name min-w-0">
                <b className="truncate">{client.name}</b>
                <small>{client.account} · {client.plan.replace('Plan ', '')}{client.country !== 'MEX' ? ` · ${client.country}` : ''}</small>
                <small className="ent-why">{client.reasons.map(reason => `${reason.label}${reason.at ? ` (${shortDate(reason.at)})` : ''}`).join(' · ')}</small>
            </span>
            <span className="flex min-w-0 flex-wrap gap-1.5">
                {CHECKS.map(({ key, label }) => {
                    const check = client.checks[key]
                    const missing = check.state === 'missing'
                    return (
                        <span key={key} className={missing ? 'pub-chip bad' : check.state === 'ok' ? 'pub-chip ok' : 'pub-chip ent-off'} title={check.text}>
                            {missing && <i />}
                            {missing ? `${label}: ${check.text}` : label}
                        </span>
                    )
                })}
            </span>
            <span className="flex justify-end">
                {canGenerate ? (
                    <button type="button" disabled={publishing} className="vta-btn gro-primary !h-8 !text-[12px]" onClick={() => onGeneratePieces(client)}>
                        Generar sus piezas
                    </button>
                ) : (
                    <button type="button" className="vta-btn !h-8 !text-[12px]" onClick={() => navigate(`${APP_ROUTES.CLIENTS.LIST}?search=${encodeURIComponent(client.account)}`)}>
                        Abrir ficha
                    </button>
                )}
            </span>
        </div>
    )
}

/** Las que llegaron este mes (alta, regreso, promoción) o siguen sin reportes del cierre: lo que le falta a cada una. */
const ClientsCard = ({ clients, publishing, onGeneratePieces }: Props) => {
    const [showOk, setShowOk] = useState(false)
    const pending = clients.filter(client => !client.ok)
    const ok = clients.filter(client => client.ok)

    return (
        <section className="shell-glass pulse-rise min-w-0 overflow-hidden rounded-3xl">
            <header className="flex flex-wrap items-center gap-x-3 gap-y-1 px-[18px] py-4">
                <h2 className="text-[15px] font-extrabold tracking-tight">Clientas por poner al corriente</h2>
                <span className="ml-auto text-[12px] text-muted-foreground">{pending.length ? `${pending.length} con pendientes` : 'Ninguna pendiente'}</span>
            </header>

            {pending.map(client => <ClientRow key={client.client_id} client={client} publishing={publishing} onGeneratePieces={onGeneratePieces} />)}

            {ok.length > 0 && (
                <>
                    <button type="button" className="ent-fold" onClick={() => setShowOk(value => !value)}>
                        {showOk ? 'Ocultar' : 'Ver'} las {ok.length} que ya están al corriente
                    </button>
                    {showOk && ok.map(client => <ClientRow key={client.client_id} client={client} publishing={publishing} onGeneratePieces={onGeneratePieces} />)}
                </>
            )}
        </section>
    )
}

export default ClientsCard
