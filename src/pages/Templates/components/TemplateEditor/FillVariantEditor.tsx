import { useEffect, useMemo, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ImageUpIcon, LayersIcon, SparklesIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/uishadcn/ui/button"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/uishadcn/ui/alert-dialog"
import { API_ROUTES } from "@/constants/api"
import { Acomodo, PreviewResult } from "@/interfaces/challenges"
import { ApiResponse } from "@/interfaces/common"
import { ITemplate, ITemplateVariant } from "@/interfaces/templates"
import { cn } from "@/lib/utils"
import BaseEditor, { Sample } from "@/pages/Challenges/components/BaseEditor"
import { errorText } from "@/pages/Challenges/useChallenges"
import HttpService from "@/services/http"
import { uploadImageTo } from "@/utils/files"
import { queryKeys } from "@/utils/queryKeys"

import { fillConfigOf, kindLabel } from "../../page-utils"
import "@/pages/Challenges/retos.css"

/** La Directora de la persona de prueba: se manda con la vista previa para que la pieza diga lo mismo que la muestra */
const TEST_FIRMA = "Ana Camila García González"

/** Cómo se dice cada formato en los avisos, como en la lista de plantillas */
const FORMAT_NAME: Record<string, string> = { image: "vertical", image_square: "cuadrada" }

/** Una base recién subida: todavía no es de la variante (se registra al guardar sus medidas) */
export interface NewBase {
    variantId: string
    key: string
    /** Para verla mientras tanto, desde el navegador */
    url: string
    w: number
    h: number
    /** Mide lo mismo que la base de ahora: sus medidas le sirven */
    sameSize: boolean
}

/** La carpeta de los archivos de la variante: la misma de «Editar archivos» */
const folderOf = (template: ITemplate, variant: ITemplateVariant) => `public/templates/posts/${template.slug}/variants/${variant.kind}/`

const naturalSize = (url: string) => new Promise<{ w: number, h: number }>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve({ w: image.naturalWidth, h: image.naturalHeight })
    image.onerror = () => reject(new Error("No se pudo leer la imagen"))
    image.src = url
})

/** Sube la base a la carpeta de la variante y la compara con la de ahora; no la registra (eso es al guardar) */
const uploadBase = async (file: File, template: ITemplate, variant: ITemplateVariant): Promise<NewBase> => {
    const url = URL.createObjectURL(file)
    try {
        const [size, current, key] = await Promise.all([
            naturalSize(url),
            fillConfigOf(variant) && variant.template_file_url ? naturalSize(variant.template_file_url).catch(() => null) : null,
            uploadImageTo(file, folderOf(template, variant), "base"),
        ])
        return { variantId: variant.id, key, url, ...size, sameSize: !!current && current.w === size.w && current.h === size.h }
    } catch (error) {
        URL.revokeObjectURL(url)
        throw error
    }
}

/**
 * Las medidas de partida de una base nueva, en sus píxeles: la cara en el tercio de arriba, el nombre en dos renglones
 * cerca de abajo y el de la Directora debajo; quien no tiene foto, en círculo. Son para empezar a acomodar.
 */
const startingAcomodo = (w: number, h: number): Acomodo => {
    const unit = Math.min(w, h)
    const cap = Math.round(0.06 * unit)
    const base2 = Math.round(0.8 * h)
    const nameTop = base2 - 2.13 * cap
    return {
        cara: { cx: Math.round(0.5 * w), cy: Math.round(0.27 * h), ancho: Math.round(0.25 * unit) },
        velo: [Math.round(nameTop - 0.09 * unit), Math.round(nameTop + 0.09 * unit)],
        min_cara: 200,
        avatar: "circulo",
        nombre: {
            fuente: "playfair", peso: 800, sx: 0.84, cap, cx: Math.round(0.5 * w), base2, interlinea: Math.round(1.13 * cap), ancho_max: Math.round(0.55 * w),
            grad: [[253, 236, 203], [253, 247, 229], [253, 227, 185]], sombra: [2, 3, 4, 0.5, [70, 12, 38]], relieve: false, brillo: false,
            renglones: 2, estricto: true, interlinea_escala: true,
        },
        valor: null,
        firma: {
            fuente: "playfair", peso: 400, cap: Math.round(0.019 * unit), cx: Math.round(0.5 * w), base: Math.round(Math.min(0.96 * h, base2 + 0.12 * unit)),
            ancho_max: Math.round(0.4 * w), grad: [[251, 241, 241]], sombra: [1, 1.5, 2, 0.45, [70, 12, 38]],
        },
        circulo: null,
    }
}

interface FillVariantEditorProps {
    template: ITemplate
    variant: ITemplateVariant
    /** La base que se acaba de subir con «Usar base» (la variante todavía va por capas) */
    fresh?: NewBase | null
    /** La base recién subida ya no hace falta: se guardó o se soltó */
    onFreshDone?: () => void
}

/**
 * La variante «con base» (motor «llenado»): el servidor llena la base con la foto de cada consultora, su nombre y el
 * de su Directora, con las medidas de aquí. Es el mismo medidor de las piezas de ganadora de los retos; «Ver cómo
 * sale» arma una pieza de verdad sin guardar y «Guardar medidas» las registra.
 */
const FillVariantEditor = ({ template, variant, fresh = null, onFreshDone }: FillVariantEditorProps) => {
    const queryClient = useQueryClient()
    const config = fillConfigOf(variant)
    const baseInput = useRef<HTMLInputElement>(null)
    const maskInput = useRef<HTMLInputElement>(null)
    const [uploaded, setUploaded] = useState<NewBase | null>(fresh)
    const [encima, setEncima] = useState<string | null>(config?.encima ?? null)
    const [personId, setPersonId] = useState("")
    const [busy, setBusy] = useState<"" | "preview" | "save" | "upload" | "mask">("")
    const [confirm, setConfirm] = useState<Acomodo | null>(null)
    const [savedFrom, setSavedFrom] = useState<ITemplateVariant | null>(null)
    const format = FORMAT_NAME[variant.kind] ?? kindLabel(variant.kind).toLowerCase()

    /* Tras guardar, la base subida se suelta cuando llega la variante ya guardada: así no se asoma la de antes */
    useEffect(() => {
        if (!savedFrom || variant === savedFrom) return
        setSavedFrom(null)
        setUploaded(null)
        onFreshDone?.()
    }, [variant, savedFrom, onFreshDone])

    const route = (path: string) => path.replace("{templateId}", template.id).replace("{variantId}", variant.id)

    const run = async <T,>(kind: typeof busy, action: () => Promise<T>): Promise<T | null> => {
        setBusy(kind)
        try {
            return await action()
        } catch (error) {
            toast.error(errorText(error))
            return null
        } finally {
            setBusy("")
        }
    }

    /* Qué se mide: la base que se acaba de subir o la de la variante (su archivo) */
    const working = useMemo(() => {
        if (uploaded) {
            return { key: uploaded.key, url: uploaded.url, label: "La base que subiste, sin guardar", initial: uploaded.sameSize && config ? config.acomodo : startingAcomodo(uploaded.w, uploaded.h) }
        }
        if (config && variant.template_file_url) {
            return { key: variant.template_file_uri ?? variant.template_file_url, url: variant.template_file_url, label: "La base de la variante", initial: config.acomodo }
        }
        return null
    }, [uploaded, config, variant.template_file_uri, variant.template_file_url])

    /* Con su ID, la consultora va primero: así «Probar con» ya la tiene elegida */
    const typed = personId.trim()
    const samples: Sample[] = [
        ...(typed ? [{ id: typed, label: "La consultora que escribiste", value: null, firma: null }] : []),
        { id: null, label: "Persona de prueba (sin foto y nombre largo)", value: null, firma: TEST_FIRMA },
    ]

    /* La base sólo va si es una nueva: si no, el servidor usa el archivo de la variante */
    const withBase = () => (uploaded ? { base: uploaded.key } : {})

    const preview = (acomodo: Acomodo, sample: Sample) => run("preview", async () => {
        const { data } = await HttpService.post<ApiResponse<PreviewResult>>(route(API_ROUTES.TEMPLATES.VARIANTS.FILL_PREVIEW), {
            ...withBase(), encima, acomodo, person_id: sample.id, ...(sample.firma ? { firma: sample.firma } : {}),
        })
        return data
    })

    const save = (acomodo: Acomodo) => run("save", async () => {
        await HttpService.put<ApiResponse<ITemplateVariant>>(route(API_ROUTES.TEMPLATES.VARIANTS.FILL), { ...withBase(), encima, acomodo })
        // La ficha trae las variantes: al refrescarla ya sale con su base (y en la lista, con su marca)
        await queryClient.invalidateQueries({ queryKey: queryKeys.detail("templates", template.id) })
        void queryClient.invalidateQueries({ queryKey: queryKeys.listBase("templates/posts") })
        if (uploaded) setSavedFrom(variant)
        toast.success(config ? "Medidas guardadas: las piezas nuevas salen así" : `Listo: la ${format} ya sale con su base`)
        return true
    })

    /* Pasar de capas a base cambia cómo salen las piezas desde ya: se confirma */
    const onSave = async (acomodo: Acomodo) => {
        if (!config) {
            setConfirm(acomodo)
            return
        }
        await save(acomodo)
    }

    const onPickBase = (file: File | undefined) => file && run("upload", async () => {
        const base = await uploadBase(file, template, variant)
        setUploaded(base)
        toast.success(!config || base.sameSize ? "Base subida: revisa las medidas y guarda" : "La base nueva mide distinto: empieza con medidas de partida")
    })

    const onPickMask = (file: File | undefined) => file && run("mask", async () => {
        setEncima(await uploadImageTo(file, folderOf(template, variant), "encima"))
        toast.success("Máscara subida: se usa al ver cómo sale y se guarda con las medidas")
    })

    /* Soltar la base que se subió: con base propia, se vuelve a ella; si no, a las capas */
    const discard = () => {
        setUploaded(null)
        if (!config) onFreshDone?.()
    }

    const maskChanged = encima !== (config?.encima ?? null)
    const inputs = <>
        <input ref={baseInput} type="file" accept="image/png,image/jpeg" className="hidden" onChange={event => { onPickBase(event.target.files?.[0]); event.target.value = "" }} />
        <input ref={maskInput} type="file" accept="image/png" className="hidden" onChange={event => { onPickMask(event.target.files?.[0]); event.target.value = "" }} />
    </>

    if (!working) {
        return (
            <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 text-center">
                <SparklesIcon className="size-7 text-primary" />
                <b className="text-[15px]">Falta la imagen de la base</b>
                <p className="max-w-[52ch] text-[12.5px] text-muted-foreground">Esta variante sale con base pero no tiene su archivo. Súbela para medirla.</p>
                <button type="button" className="rt-btn cta" disabled={!!busy} onClick={() => baseInput.current?.click()}>
                    <ImageUpIcon className="size-4" /> {busy === "upload" ? "Subiendo…" : "Subir la base"}
                </button>
                {inputs}
            </div>
        )
    }

    return (
        <div className="grid min-w-0 grid-cols-1 gap-3">
            <section className="grid min-w-0 grid-cols-1 gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                        <b className="flex flex-wrap items-center gap-2 text-[14.5px]">
                            Medir la base
                            <span className={cn("rt-tag", config ? "ok" : "warn")}>{config ? "Con base" : "Sin guardar"}</span>
                        </b>
                        <small className="block text-[11.5px] leading-snug text-muted-foreground">
                            {working.label}. El sistema la llena con la foto y el nombre de cada consultora y el de su Directora.
                        </small>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" className="rt-btn" disabled={!!busy} onClick={() => baseInput.current?.click()}>
                            <ImageUpIcon className="size-4" /> {busy === "upload" ? "Subiendo…" : "Cambiar la base"}
                        </button>
                        {uploaded && (
                            <button type="button" className="rt-btn" disabled={!!busy} onClick={discard}>
                                {config ? <><XIcon className="size-4" /> Quitar la que subí</> : <><LayersIcon className="size-4" /> Volver a las capas</>}
                            </button>
                        )}
                    </div>
                </div>

                {!config && (
                    <p className="rounded-[12px] bg-amber-100 px-3 py-2 text-[12px] font-medium leading-snug text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
                        Todavía no cambia nada: al guardar las medidas, la {format} deja sus capas y sale con esta base.
                    </p>
                )}

                <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-[14px] border border-border px-3 py-2.5">
                    <p className="min-w-0 flex-1 basis-60 text-[11.5px] leading-snug text-muted-foreground">
                        <b className="block text-[12.5px] text-foreground">Lo que va encima de la persona <span className="font-normal text-muted-foreground">(opcional)</span></b>
                        Una máscara PNG del tamaño de la base: lo blanco queda por encima de la foto (el titular, un listón).
                    </p>
                    <span className="flex flex-wrap items-center gap-2">
                        <span className={cn("rt-tag", encima ? "ok" : "plain")}>{encima ? "Con máscara" : "Sin máscara"}{maskChanged ? " · sin guardar" : ""}</span>
                        <button type="button" className="rt-btn !h-8 !px-3" disabled={!!busy} onClick={() => maskInput.current?.click()}>
                            {busy === "mask" ? "Subiendo…" : encima ? "Cambiar" : "Subir máscara"}
                        </button>
                        {encima && <button type="button" className="rt-btn !h-8 !px-3" disabled={!!busy} onClick={() => setEncima(null)}>Quitar</button>}
                    </span>
                </div>

                <BaseEditor
                    key={working.key}
                    imageUrl={working.url}
                    hasValue={false}
                    hasFirma
                    advanced
                    initial={working.initial}
                    samples={samples}
                    sampleSlot={(
                        <label className="rt-field">
                            Probar con una consultora (opcional)
                            <input type="text" value={personId} onChange={event => setPersonId(event.target.value)} placeholder="Su ID de consultora" autoComplete="off" spellCheck={false} />
                            <small className="text-[11px] font-normal leading-snug">Con su ID salen su foto, su nombre y el de su Directora. Sin él, una persona de prueba sin foto.</small>
                        </label>
                    )}
                    busy={busy}
                    saveLabel="Guardar medidas"
                    onPreview={preview}
                    onSave={onSave}
                />
            </section>

            {inputs}

            <AlertDialog open={!!confirm} onOpenChange={open => !open && setConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿La {format} sale con esta base?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Desde que guardes, las piezas de «{template.name}» en {format} salen de esta base con estas medidas: la foto y el nombre de cada una y el de su Directora. Sus capas de ahora dejan de usarse.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Todavía no</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { const acomodo = confirm; setConfirm(null); if (acomodo) void save(acomodo) }}>Sí, usar la base</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

/**
 * Para una variante que va por capas: subir su base abre el medidor en su lugar. Nada cambia hasta guardar las
 * medidas (y se confirma), así una plantilla en uso no sale a medias.
 */
export const UseBaseButton = ({ template, variant, onUploaded }: { template: ITemplate, variant: ITemplateVariant, onUploaded: (base: NewBase) => void }) => {
    const input = useRef<HTMLInputElement>(null)
    const [busy, setBusy] = useState(false)

    const onPick = async (file: File | undefined) => {
        if (!file) return
        setBusy(true)
        try {
            onUploaded(await uploadBase(file, template, variant))
            toast.success("Base subida: acomoda la cara y los nombres, y guarda")
        } catch (error) {
            toast.error(errorText(error, "No se pudo subir la base"))
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed bg-card px-4 py-3">
            <div className="min-w-0 flex-1 basis-64">
                <h4 className="text-sm font-semibold">¿Esta variante va con base?</h4>
                <p className="text-xs text-muted-foreground">
                    Sube el diseño sin persona ni nombres: el sistema lo llena con la foto y el nombre de cada consultora y el de su Directora. Nada cambia hasta que guardes sus medidas.
                </p>
            </div>
            <Button type="button" size="sm" variant="outline" className="gap-1.5" disabled={busy} onClick={() => input.current?.click()}>
                <ImageUpIcon className="w-4 h-4" />
                {busy ? "Subiendo…" : "Usar base (sistema nuevo)"}
            </Button>
            <input ref={input} type="file" accept="image/png,image/jpeg" className="hidden" onChange={event => { onPick(event.target.files?.[0]); event.target.value = "" }} />
        </div>
    )
}

export default FillVariantEditor
