import { isNewShell } from './useNewShell'

interface Props {
    /** Antetítulo en versalitas: dónde está («Mi negocio», «Contenido»…) */
    eyebrow: string
    /** El título; lo que vaya en `<em>` sale con el degradado de la marca */
    title: React.ReactNode
    sub?: React.ReactNode
    /** Lo que va a la derecha: botones, contadores, buscador */
    children?: React.ReactNode
}

/**
 * El encabezado de todas las páginas del rediseño, para que Publicaciones, Biblioteca o Reportes
 * se presenten igual que el Hoy. Con el marco de siempre no pinta nada: allá el nombre de la
 * página lo pone la barra de arriba, y cada página conserva su cabecera.
 */
const PageHead = ({ eyebrow, title, sub, children }: Props) => !isNewShell() ? null : (
    <header className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
        <div className="min-w-0">
            <p className="text-[10.5px] font-extrabold tracking-[.14em] text-[#6C47FF] uppercase dark:text-[#A894FF]">{eyebrow}</p>
            <h1 className="shell-title mt-1 text-[28px] leading-[1.1] font-extrabold tracking-tight">{title}</h1>
            {sub && <p className="mt-1.5 max-w-[62ch] text-[13.5px] text-muted-foreground">{sub}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
)

export default PageHead
