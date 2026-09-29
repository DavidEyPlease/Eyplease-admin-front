import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { EyeIcon, SaveIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Switch } from '@/uishadcn/ui/switch'
import { Acomodo, FontKey, PreviewResult } from '@/interfaces/challenges'

import { fromHex, toHex } from '../retos.utils'

type Face = { cx: number, cy: number, ancho: number }
type NameBox = { cx: number, base2: number, cap: number, ancho_max: number }
type ValueBox = { cx: number, base: number, alto: number, ancho_max: number }
type Style = { fuente: FontKey, peso: number, sx: number, top: string, bottom: string, sombra: boolean, relieve: boolean, brillo: boolean }
type Drag = 'face' | 'face-size' | 'name' | 'name-width' | 'name-height' | 'value' | 'value-width' | 'value-height' | 'velo-top' | 'velo-bottom'

/** Del alto de las mayúsculas al alto de los dos renglones (de la cima de la «M» de arriba a la línea base de abajo). */
const TWO_LINES = 2.13
const SHADOW: [number, number, number, number, [number, number, number]] = [2, 3, 3.5, 0.55, [6, 12, 30]]

/* `cap`: alto de las mayúsculas entre el tamaño de la letra, medido en las fuentes del servidor (public/fonts) */
const FONTS: Array<{ key: FontKey, label: string, family: string, css: string, cap: number }> = [
    { key: 'playfair', label: 'Playfair (clásica)', family: 'Playfair Display', css: '"Playfair Display", Georgia, serif', cap: 0.708 },
    { key: 'playfair-italica', label: 'Playfair cursiva', family: 'Playfair Display', css: '"Playfair Display", Georgia, serif', cap: 0.708 },
    { key: 'lora', label: 'Lora (serif suave)', family: 'Lora', css: 'Lora, Georgia, serif', cap: 0.7 },
    { key: 'poppins', label: 'Poppins (moderna)', family: 'Poppins', css: 'Poppins, "Inter Variable", sans-serif', cap: 0.709 },
    { key: 'inter', label: 'Inter (sencilla)', family: 'Inter Variable', css: '"Inter Variable", Inter, sans-serif', cap: 0.728 },
]
/* Las mismas familias que usa el servidor, sólo para que la muestra se parezca (la pieza de verdad sale de allá) */
const GOOGLE_FONTS = 'https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600;1,700;1,800;1,900&family=Poppins:wght@600;700;800;900&display=swap'
const SAMPLE_LINES = ['María Guadalupe', 'Hernández Villaseñor']
const SAMPLE_VALUE = '1,502'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const round = (value: number) => Math.round(value)

export interface Sample { id: string | null, label: string, value: string | null }

interface Props {
    /** La imagen que se mide (la base nueva o la vigente) */
    imageUrl: string
    /** El reto lleva número (puntos o corazones) */
    hasValue: boolean
    /** Las medidas guardadas, si esta base ya se midió */
    initial: Acomodo | null
    samples: Sample[]
    busy: string
    saveLabel: string
    onPreview: (acomodo: Acomodo, sample: Sample) => Promise<PreviewResult | null>
    onSave: (acomodo: Acomodo) => Promise<unknown>
}

/**
 * El medidor de la base (David, 28-sep-2026: la base va SIN molde y se mide a mano). Encima de la base se pintan las
 * zonas que el sistema va a llenar —la cara, el nombre en dos renglones y, si el reto lo lleva, el número— y se
 * acomodan arrastrando. La figura tenue alrededor de la cara es dónde caen la cabeza y los hombros. «Ver cómo sale»
 * arma la pieza de verdad en el servidor con estas medidas, sin guardarlas.
 */
const BaseEditor = ({ imageUrl, hasValue, initial, samples, busy, saveLabel, onPreview, onSave }: Props) => {
    const stage = useRef<HTMLDivElement>(null)
    const drag = useRef<{ kind: Drag, x: number, y: number, face: Face, name: NameBox, value: ValueBox, velo: [number, number] } | null>(null)
    const [size, setSize] = useState<{ w: number, h: number } | null>(null)
    const [shown, setShown] = useState(0)
    const [face, setFace] = useState<Face>({ cx: 0, cy: 0, ancho: 0 })
    const [name, setName] = useState<NameBox>({ cx: 0, base2: 0, cap: 0, ancho_max: 0 })
    const [value, setValue] = useState<ValueBox>({ cx: 0, base: 0, alto: 0, ancho_max: 0 })
    const [velo, setVelo] = useState<[number, number]>([0, 0])
    const [veloOn, setVeloOn] = useState(true)
    const [filo, setFilo] = useState<string | null>(null)
    const [style, setStyle] = useState<Style>({ fuente: 'playfair', peso: 800, sx: 0.83, top: '#fde9e1', bottom: '#f0b0ac', sombra: true, relieve: true, brillo: true })
    const [sampleIndex, setSampleIndex] = useState(0)
    const [result, setResult] = useState<{ url: string, caption: string } | null>(null)
    const [fontTick, setFontTick] = useState(0)
    const gradientId = useId().replace(/:/g, '')
    const measurer = useMemo(() => document.createElement('canvas').getContext('2d'), [])

    /* Las fuentes de la muestra: se cargan una vez; al cambiar de letra se espera a que llegue para medirla */
    useEffect(() => {
        if (!document.querySelector('link[data-retos-fonts]')) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = GOOGLE_FONTS
            link.dataset.retosFonts = '1'
            document.head.appendChild(link)
        }
    }, [])
    useEffect(() => {
        const family = (FONTS.find(item => item.key === style.fuente) ?? FONTS[0]).family
        const italic = style.fuente === 'playfair-italica' ? 'italic ' : ''
        document.fonts.load(`${italic}${style.peso} 40px "${family}"`).then(() => setFontTick(tick => tick + 1)).catch(() => undefined)
    }, [style.fuente, style.peso])

    /* Al cargar la imagen: sus medidas reales, y las zonas donde estaban (o unas de partida si es una base nueva) */
    const onLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        const w = event.currentTarget.naturalWidth
        const h = event.currentTarget.naturalHeight
        setSize({ w, h })
        setResult(null)
        if (initial) {
            setFace(initial.cara)
            setName({ cx: initial.nombre.cx, base2: initial.nombre.base2, cap: initial.nombre.cap, ancho_max: initial.nombre.ancho_max })
            if (initial.valor) setValue({ cx: initial.valor.cx, base: initial.valor.base, alto: initial.valor.alto, ancho_max: initial.valor.ancho_max })
            else setValue({ cx: w / 2, base: 0.79 * h, alto: 0.081 * h, ancho_max: 0.43 * w })
            setVeloOn(!!initial.velo)
            setFilo(initial.circulo?.filo ? toHex(initial.circulo.filo) : null)
            setVelo(initial.velo ?? [0.47 * h, 0.62 * h])
            const grad = initial.nombre.grad
            setStyle({
                fuente: initial.nombre.fuente ?? 'playfair',
                peso: initial.nombre.peso ?? 800,
                sx: initial.nombre.sx ?? 0.83,
                top: toHex(grad[0]),
                bottom: toHex(grad[grad.length - 1]),
                sombra: initial.nombre.sombra !== null,
                relieve: initial.nombre.relieve ?? true,
                brillo: initial.nombre.brillo ?? true,
            })
            return
        }
        const cap = 0.046 * h
        const base2 = 0.68 * h
        setFace({ cx: 0.70 * w, cy: 0.33 * h, ancho: 0.30 * w })
        setName({ cx: w / 2, base2, cap, ancho_max: 0.62 * w })
        setValue({ cx: w / 2, base: 0.79 * h, alto: 0.081 * h, ancho_max: 0.43 * w })
        const top = base2 - TWO_LINES * cap
        setVelo([top - 0.10 * h, top + 0.055 * h])
    }

    /* El ancho con que se ve la base cambia con la ventana: las zonas se pintan a esa escala */
    useEffect(() => {
        if (!stage.current) return
        const observer = new ResizeObserver(entries => setShown(entries[0].contentRect.width))
        observer.observe(stage.current)
        return () => observer.disconnect()
    }, [])

    const s = size && shown ? shown / size.w : 0

    const start = (kind: Drag) => (event: React.PointerEvent) => {
        event.preventDefault()
        event.stopPropagation()
        ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
        drag.current = { kind, x: event.clientX, y: event.clientY, face, name, value, velo }
    }

    const move = (event: React.PointerEvent) => {
        const d = drag.current
        if (!d || !size || !s) return
        const dx = (event.clientX - d.x) / s
        const dy = (event.clientY - d.y) / s
        const { w, h } = size
        switch (d.kind) {
            case 'face': setFace({ ...d.face, cx: clamp(d.face.cx + dx, 0, w), cy: clamp(d.face.cy + dy, 0, h) }); break
            case 'face-size': setFace({ ...d.face, ancho: clamp(d.face.ancho + 2 * dx, 0.06 * w, w) }); break
            case 'name': setName({ ...d.name, cx: clamp(d.name.cx + dx, 0, w), base2: clamp(d.name.base2 + dy, 0, h) }); break
            case 'name-width': setName({ ...d.name, ancho_max: clamp(d.name.ancho_max + 2 * dx, 0.15 * w, w) }); break
            case 'name-height': {
                const top = d.name.base2 - TWO_LINES * d.name.cap
                const tall = clamp(TWO_LINES * d.name.cap + dy, 0.02 * h, 0.4 * h)
                setName({ ...d.name, cap: tall / TWO_LINES, base2: top + tall })
                break
            }
            case 'value': setValue({ ...d.value, cx: clamp(d.value.cx + dx, 0, w), base: clamp(d.value.base + dy, 0, h) }); break
            case 'value-width': setValue({ ...d.value, ancho_max: clamp(d.value.ancho_max + 2 * dx, 0.1 * w, w) }); break
            case 'value-height': {
                const top = d.value.base - d.value.alto
                const tall = clamp(d.value.alto + dy, 0.015 * h, 0.3 * h)
                setValue({ ...d.value, alto: tall, base: top + tall })
                break
            }
            case 'velo-top': setVelo([clamp(d.velo[0] + dy, 0, d.velo[1] - 10), d.velo[1]]); break
            case 'velo-bottom': setVelo([d.velo[0], clamp(d.velo[1] + dy, d.velo[0] + 10, h)]); break
        }
    }

    const end = () => { drag.current = null }

    /* Lo que se manda: las medidas en píxeles de la base, como las lee llenar_ganadora.py */
    const acomodo = (): Acomodo => {
        const text = {
            fuente: style.fuente,
            sx: style.sx,
            grad: [fromHex(style.top), fromHex(style.bottom)] as Array<[number, number, number]>,
            sombra: style.sombra ? SHADOW : null,
            relieve: style.relieve,
            brillo: style.brillo,
        }
        return {
            cara: { cx: round(face.cx), cy: round(face.cy), ancho: round(face.ancho) },
            velo: veloOn ? [round(velo[0]), round(velo[1])] : null,
            min_cara: 200,
            nombre: { ...text, peso: style.peso, cx: round(name.cx), base2: round(name.base2), cap: round(name.cap), interlinea: round(1.13 * name.cap), ancho_max: round(name.ancho_max) },
            valor: hasValue ? { ...text, peso: Math.min(900, style.peso + 100), cx: round(value.cx), base: round(value.base), alto: round(value.alto), ancho_max: round(value.ancho_max) } : null,
            circulo: filo ? { filo: fromHex(filo) } : null,
        }
    }

    const preview = async () => {
        const sample = samples[sampleIndex] ?? samples[0]
        const data = await onPreview(acomodo(), sample)
        if (!data) return
        const why = data.fill?.foto === 'avatar' ? `avatar (${data.fill.motivo ?? 'sin foto'})`
            : data.fill?.foto === 'circulo' ? `su foto en círculo (${data.fill.motivo ?? 'foto cerrada'})` : 'su foto'
        setResult({ url: data.url, caption: `${sample.label} · salió con ${why}` })
    }

    const font = FONTS.find(item => item.key === style.fuente) ?? FONTS[0]
    const italic = style.fuente === 'playfair-italica'

    /* El tamaño de la muestra, como lo calcula llenar_ganadora.py: por el alto de las mayúsculas y, si el renglón más
       ancho no cabe, se achica de a 3 % hasta el 70 %. El número, por su alto, y se achica si no cabe. */
    const widthOf = (text: string, px: number, weight: number) => {
        if (!measurer) return 0
        measurer.font = `${italic ? 'italic ' : ''}${weight} ${px}px ${font.css}`
        return measurer.measureText(text).width * style.sx
    }
    const nameSize = useMemo(() => {
        let px = name.cap / font.cap
        const least = 0.7 * px
        while (Math.max(...SAMPLE_LINES.map(line => widthOf(line, px, style.peso))) > name.ancho_max && px >= least) px *= 0.97
        return px
        // eslint-disable-next-line react-hooks/exhaustive-deps -- widthOf depende de lo mismo que aquí se lista
    }, [name.cap, name.ancho_max, font, style.peso, style.sx, fontTick, measurer])
    const valueWeight = Math.min(900, style.peso + 100)
    const valueSize = useMemo(() => {
        const px = value.alto / font.cap
        const wide = widthOf(SAMPLE_VALUE, px, valueWeight)
        return wide > value.ancho_max ? px * value.ancho_max / wide : px
        // eslint-disable-next-line react-hooks/exhaustive-deps -- widthOf depende de lo mismo que aquí se lista
    }, [value.alto, value.ancho_max, font, valueWeight, style.sx, fontTick, measurer])

    const nameTop = name.base2 - TWO_LINES * name.cap
    const interline = 1.13 * name.cap
    const squeeze = (cx: number) => `translate(${cx * s} 0) scale(${style.sx} 1) translate(${-cx * s} 0)`

    return (
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="min-w-0">
                <div ref={stage} className="rt-stage" onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
                    <img src={imageUrl} alt="La base de las ganadoras" onLoad={onLoad} draggable={false} />

                    {s > 0 && size && <>
                        {/* Dónde caen la cabeza y los hombros de una foto normal: sólo para acomodar a ojo */}
                        <svg className="rt-ghost" style={{ left: 0, top: 0 }} width={shown} height={size.h * s} aria-hidden="true">
                            <ellipse cx={face.cx * s} cy={(face.cy - 0.12 * face.ancho) * s} rx={0.62 * face.ancho * s} ry={0.8 * face.ancho * s} fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.7)" strokeDasharray="5 5" />
                            <rect x={(face.cx - 1.6 * face.ancho) * s} y={(face.cy + 0.95 * face.ancho) * s} width={3.2 * face.ancho * s} height={2 * face.ancho * s} rx={0.8 * face.ancho * s} fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.55)" strokeDasharray="5 5" />
                        </svg>

                        {/* La muestra: dónde y de qué tamaño queda el texto (la pieza real sale del servidor) */}
                        <svg className="rt-ghost" style={{ left: 0, top: 0, filter: style.sombra ? 'drop-shadow(1px 2px 2px rgba(6,12,30,.55))' : 'none' }} width={shown} height={size.h * s} aria-hidden="true">
                            <defs>
                                <linearGradient id={`${gradientId}n`} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={(name.base2 - interline - nameSize * font.cap) * s} y2={(name.base2 + 0.22 * nameSize) * s}>
                                    <stop offset="0" stopColor={style.top} /><stop offset="1" stopColor={style.bottom} />
                                </linearGradient>
                                <linearGradient id={`${gradientId}v`} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={(value.base - valueSize * font.cap) * s} y2={value.base * s}>
                                    <stop offset="0" stopColor={style.top} /><stop offset="1" stopColor={style.bottom} />
                                </linearGradient>
                            </defs>
                            {SAMPLE_LINES.map((line, index) => (
                                <text
                                    key={line}
                                    x={name.cx * s}
                                    y={(index === 0 ? name.base2 - interline : name.base2) * s}
                                    textAnchor="middle"
                                    fontFamily={font.css}
                                    fontWeight={style.peso}
                                    fontStyle={italic ? 'italic' : 'normal'}
                                    fontSize={nameSize * s}
                                    fill={`url(#${gradientId}n)`}
                                    transform={squeeze(name.cx)}
                                >{line}</text>
                            ))}
                            {hasValue && (
                                <text x={value.cx * s} y={value.base * s} textAnchor="middle" fontFamily={font.css} fontWeight={valueWeight} fontStyle={italic ? 'italic' : 'normal'} fontSize={valueSize * s} fill={`url(#${gradientId}v)`} transform={squeeze(value.cx)}>{SAMPLE_VALUE}</text>
                            )}
                        </svg>

                        {veloOn && <>
                            <div className="rt-line" style={{ top: velo[0] * s }} onPointerDown={start('velo-top')}><span>Empieza a fundirse</span></div>
                            <div className="rt-line" style={{ top: velo[1] * s }} onPointerDown={start('velo-bottom')}><span>Ya fundida</span></div>
                        </>}

                        <div
                            className="rt-zone rt-face"
                            style={{ left: (face.cx - face.ancho / 2) * s, top: (face.cy - face.ancho / 2) * s, width: face.ancho * s, height: face.ancho * s }}
                            onPointerDown={start('face')}
                            title="Arrastra para mover la cara"
                        >
                            <span className="rt-label">Cara</span>
                        </div>
                        <span className="rt-handle ew" style={{ left: (face.cx + face.ancho / 2) * s - 7, top: face.cy * s - 7 }} onPointerDown={start('face-size')} title="Tamaño de la cara" />

                        <div
                            className="rt-zone rt-box"
                            style={{ left: (name.cx - name.ancho_max / 2) * s, top: nameTop * s, width: name.ancho_max * s, height: TWO_LINES * name.cap * s }}
                            onPointerDown={start('name')}
                            title="Arrastra para mover el nombre"
                        >
                            <span className="rt-label">Nombre</span>
                        </div>
                        <span className="rt-handle ew" style={{ left: (name.cx + name.ancho_max / 2) * s - 7, top: (nameTop + TWO_LINES * name.cap / 2) * s - 7 }} onPointerDown={start('name-width')} title="Ancho del nombre" />
                        <span className="rt-handle ns" style={{ left: name.cx * s - 7, top: name.base2 * s - 7 }} onPointerDown={start('name-height')} title="Tamaño de la letra" />

                        {hasValue && <>
                            <div
                                className="rt-zone rt-box value"
                                style={{ left: (value.cx - value.ancho_max / 2) * s, top: (value.base - value.alto) * s, width: value.ancho_max * s, height: value.alto * s }}
                                onPointerDown={start('value')}
                                title="Arrastra para mover el número"
                            >
                                <span className="rt-label">Número</span>
                            </div>
                            <span className="rt-handle ew" style={{ left: (value.cx + value.ancho_max / 2) * s - 7, top: (value.base - value.alto / 2) * s - 7 }} onPointerDown={start('value-width')} title="Ancho del número" />
                            <span className="rt-handle ns" style={{ left: value.cx * s - 7, top: value.base * s - 7 }} onPointerDown={start('value-height')} title="Tamaño del número" />
                        </>}
                    </>}
                </div>
                <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground">
                    Arrastra la cara, el nombre{hasValue ? ' y el número' : ''}; los puntos blancos cambian su tamaño. La figura punteada es dónde caen la cabeza y los hombros de una foto normal. El nombre se achica solo si no cabe.
                </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 content-start gap-3.5">
                <div className="grid grid-cols-2 gap-3 [&>*]:min-w-0">
                    <label className="rt-field">
                        Tipo de letra
                        <select value={style.fuente} onChange={event => setStyle({ ...style, fuente: event.target.value as FontKey, sx: event.target.value === 'playfair' ? style.sx : Math.max(style.sx, 0.9) })}>
                            {FONTS.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}
                        </select>
                    </label>
                    <label className="rt-field">
                        Grosor
                        <select value={style.peso} onChange={event => setStyle({ ...style, peso: Number(event.target.value) })}>
                            <option value={600}>Normal</option>
                            <option value={700}>Negrita</option>
                            <option value={800}>Extra</option>
                        </select>
                    </label>
                    <label className="rt-field">
                        Color de arriba
                        <input type="color" value={style.top} onChange={event => setStyle({ ...style, top: event.target.value })} />
                    </label>
                    <label className="rt-field">
                        Color de abajo
                        <input type="color" value={style.bottom} onChange={event => setStyle({ ...style, bottom: event.target.value })} />
                    </label>
                    <label className="rt-field col-span-2">
                        Ancho de la letra · {Math.round(style.sx * 100)} %
                        <input type="range" min={0.75} max={1} step={0.01} value={style.sx} onChange={event => setStyle({ ...style, sx: Number(event.target.value) })} />
                    </label>
                </div>

                <div className="grid gap-2 text-[12.5px] font-semibold">
                    {([['sombra', 'Sombra detrás de las letras'], ['relieve', 'Relieve'], ['brillo', 'Brillo metálico']] as Array<[keyof Style, string]>).map(([key, label]) => (
                        <label key={key} className="flex items-center justify-between gap-3">
                            {label}
                            <Switch checked={!!style[key]} onCheckedChange={checked => setStyle({ ...style, [key]: checked })} />
                        </label>
                    ))}
                    <label className="flex items-center justify-between gap-3">
                        Fundir el cuerpo antes del nombre
                        <Switch checked={veloOn} onCheckedChange={setVeloOn} />
                    </label>
                    <label className="flex items-center justify-between gap-3">
                        <span>Filo de color en las fotos en círculo <small className="block text-[11px] font-normal text-muted-foreground">Las que cortan la cabeza salen en círculo con aro blanco</small></span>
                        <span className="flex items-center gap-2">
                            {filo && <input type="color" value={filo} onChange={event => setFilo(event.target.value)} className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent p-0.5" aria-label="Color del filo" />}
                            <Switch checked={!!filo} onCheckedChange={checked => setFilo(checked ? '#e5077d' : null)} />
                        </span>
                    </label>
                </div>

                <div className="grid gap-2 rounded-[16px] border border-border p-3">
                    <label className="rt-field">
                        Probar con
                        <select value={sampleIndex} onChange={event => setSampleIndex(Number(event.target.value))}>
                            {samples.map((sample, index) => <option key={sample.id ?? 'prueba'} value={index}>{sample.label}</option>)}
                        </select>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" className="rt-btn" disabled={!!busy || !size} onClick={preview}>
                            <EyeIcon className="size-4" /> {busy === 'preview' ? 'Armando…' : 'Ver cómo sale'}
                        </button>
                        <button type="button" className="rt-btn cta" disabled={!!busy || !size} onClick={() => onSave(acomodo())}>
                            <SaveIcon className="size-4" /> {busy === 'save' ? 'Guardando…' : saveLabel}
                        </button>
                    </div>
                    <p className="text-[11px] leading-snug text-muted-foreground">«Ver cómo sale» arma la pieza de verdad en el servidor (unos segundos) sin guardar nada.</p>
                </div>

                {result && (
                    <figure className={cn('grid gap-1.5')}>
                        <img src={result.url} alt="Cómo sale la pieza" className="w-full rounded-[16px] border border-border" />
                        <figcaption className="text-[11.5px] text-muted-foreground">{result.caption}</figcaption>
                    </figure>
                )}
            </div>
        </div>
    )
}

export default BaseEditor
