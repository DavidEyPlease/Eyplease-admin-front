/**
 * La carga con la forma de lo que viene: franja, las cuatro columnas, la tabla y la fila de
 * render. Así la página no «salta» al llegar los datos y se entiende qué se está cargando.
 */
const Bone = ({ className }: { className: string }) => <span className={`pub-skel ${className}`} />

const BoardSkeleton = () => (
    <div className="grid min-w-0 grid-cols-1 gap-4" aria-busy aria-label="Cargando lo que falta por publicar">
        <div className="flex flex-wrap items-center gap-2">
            <Bone className="h-10 w-48 rounded-2xl" />
            <Bone className="h-10 w-72 rounded-2xl" />
        </div>

        <section className="shell-glass pub-ribbon grid gap-3">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <Bone className="h-9 w-56 rounded-xl" />
                <span className="grid w-full max-w-[520px] gap-2"><Bone className="h-3 w-full rounded-full" /><Bone className="h-3 w-2/3 rounded-full" /></span>
            </div>
            <Bone className="h-3 w-full rounded-full" />
            <div className="flex flex-wrap gap-4">{['w-24', 'w-32', 'w-20', 'w-36'].map(width => <Bone key={width} className={`h-3 rounded-full ${width}`} />)}</div>
        </section>

        <div className="pub-lanes">
            {[0, 1, 2, 3].map(lane => (
                <div key={lane} className="pub-lane" style={{ '--i': lane } as React.CSSProperties}>
                    <Bone className="h-3 w-32 rounded-full" />
                    <Bone className="h-3 w-full rounded-full" />
                    {[0, 1].map(item => (
                        <div key={item} className="grid gap-2 rounded-[15px] border border-border p-3">
                            <span className="flex justify-between"><Bone className="h-3.5 w-28 rounded-full" /><Bone className="h-3.5 w-10 rounded-full" /></span>
                            <Bone className="h-2.5 w-full rounded-full" />
                            <Bone className="h-7 w-36 rounded-full" />
                        </div>
                    ))}
                </div>
            ))}
        </div>

        <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="shell-glass min-w-0 overflow-hidden rounded-3xl">
                <div className="px-[18px] py-4"><Bone className="h-4 w-24 rounded-full" /></div>
                {[0, 1, 2, 3, 4, 5].map(row => (
                    <div key={row} className="pub-row !cursor-default">
                        <span className="grid gap-1.5"><Bone className="h-3.5 w-32 rounded-full" /><Bone className="h-2.5 w-20 rounded-full" /></span>
                        {[0, 1, 2].map(cell => <span key={cell} className="grid gap-1.5"><Bone className="h-3 w-16 rounded-full" /><Bone className="h-1.5 w-full rounded-full" /></span>)}
                        <Bone className="h-3 w-16 rounded-full" />
                        <Bone className="h-6 w-24 rounded-full" />
                    </div>
                ))}
            </section>
            <aside className="shell-glass grid gap-4 rounded-3xl px-[18px] py-4">
                <Bone className="h-4 w-28 rounded-full" />
                {[0, 1, 2, 3].map(job => <span key={job} className="grid gap-2"><Bone className="h-3.5 w-full rounded-full" /><Bone className="h-1.5 w-full rounded-full" /></span>)}
            </aside>
        </div>
    </div>
)

export default BoardSkeleton
