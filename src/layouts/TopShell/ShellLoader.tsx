import ISOTIPO from '@/assets/images/icon-white.png'
import './shell.css'

/**
 * La espera al entrar o al recargar, con el lenguaje del marco nuevo: el fondo de la
 * escena, el orbe de la marca y una barra que avanza de verdad (la vieja era un 72 % fijo).
 */
const ShellLoader = ({ label }: { label: string }) => (
    <div className="shell-loader fixed inset-0 z-50 grid place-items-center bg-background" role="status" aria-live="polite">
        <div className="shell-backdrop"><i className="shell-blob a" /><i className="shell-blob b" /><i className="shell-blob c" /></div>

        <div className="relative z-[1] flex flex-col items-center gap-5 px-6 text-center">
            <span className="shell-grad shell-orb grid size-[84px] place-items-center rounded-full shadow-[0_18px_40px_-14px_rgba(78,49,192,.8)]">
                <img src={ISOTIPO} alt="" className="relative w-[46%]" />
            </span>
            <span className="text-[22px] leading-none font-extrabold tracking-tight text-foreground">
                eyplease<span className="text-[#6C47FF] dark:text-[#2CD4D9]">+</span>
                <small className="ml-1.5 align-middle text-[10.5px] font-bold tracking-[.16em] text-muted-foreground uppercase">Admin</small>
            </span>
            <span className="shell-loader-bar" aria-hidden><i /></span>
            <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        </div>
    </div>
)

export default ShellLoader
