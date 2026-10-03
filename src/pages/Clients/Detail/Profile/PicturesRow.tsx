import { useRef, useState } from "react";
import { ImageUpIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import useFiles from "@/hooks/useFiles";
import { IClient } from "@/interfaces/clients";
import { FileTypes } from "@/interfaces/files";
import { cn } from "@/lib/utils";
import { ClientsService } from "@/services/clients.service";
import { getFileType } from "@/utils";
import { publishEvent } from "@/utils/events";
import { initials } from "../../List/names";

type Kind = 'photo' | 'logo'

/**
 * Su foto y su logotipo, cada uno con «Cambiar». Sube igual que el formulario de antes (`useFiles` →
 * `PUT clients/{id}` con `photo` / `logo`), pero con un nombre NUEVO cada vez: con el mismo nombre la
 * CDN seguía sirviendo la imagen vieja hasta un día (regla del CDN); la API borra la anterior al guardar.
 */
const PicturesRow = ({ client }: { client: IClient }) => {
    const { onUploadFile } = useFiles()
    const [busy, setBusy] = useState<Kind | null>(null)
    const inputs = { photo: useRef<HTMLInputElement>(null), logo: useRef<HTMLInputElement>(null) }

    const upload = async (kind: Kind, file?: File) => {
        if (!file) return
        if (!file.type.startsWith('image/')) {
            toast.error('Tiene que ser una imagen (JPG o PNG)')
            return
        }
        setBusy(kind)
        const filename = `${kind === 'photo' ? 'main-photo' : 'logo'}-${Date.now()}.${getFileType(file.type)}`
        try {
            await onUploadFile({
                file,
                filename,
                fileType: kind === 'photo' ? FileTypes.SPONSOR_PHOTO : FileTypes.USER_LOGOTYPE,
                clientId: client.id,
                callback: async () => {
                    const response = await ClientsService.update(client.id, { [kind]: filename })
                    if (response.success) {
                        publishEvent('client-updated', response.data)
                        toast.success(kind === 'photo' ? 'Foto actualizada' : 'Logotipo actualizado')
                    }
                },
            })
        } finally {
            setBusy(null)
            const input = inputs[kind].current
            if (input) input.value = ''
        }
    }

    const tile = (kind: Kind, label: string, url: string | null | undefined) => (
        <div className="min-w-0">
            <p className="text-[10.5px] font-extrabold tracking-[.1em] text-muted-foreground uppercase">{label}</p>
            <button
                type="button"
                onClick={() => inputs[kind].current?.click()}
                disabled={!!busy}
                aria-label={`Cambiar ${label.toLowerCase()}`}
                className={cn(
                    'group relative mt-1.5 grid aspect-square w-full cursor-pointer place-items-center overflow-hidden rounded-2xl border border-border transition-colors hover:border-[#6C47FF]/50 disabled:cursor-default',
                    kind === 'logo' ? 'bg-white p-3 dark:bg-white/90' : 'bg-foreground/[.04]'
                )}
            >
                {url
                    ? <img src={url} alt="" className={cn('size-full', kind === 'photo' ? 'object-cover' : 'object-contain')} />
                    : kind === 'photo'
                        ? <span className="text-[22px] font-extrabold text-muted-foreground">{initials(client.name)}</span>
                        : <span className="px-2 text-center text-[11.5px] font-semibold text-slate-400">Sin logotipo</span>}
                <span className={cn('absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black/55 py-1.5 text-[11.5px] font-bold text-white transition-opacity', busy === kind ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100')}>
                    {busy === kind ? <><Loader2Icon className="size-3.5 animate-spin" /> Subiendo…</> : <><ImageUpIcon className="size-3.5" /> Cambiar</>}
                </span>
            </button>
            <input ref={inputs[kind]} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={event => upload(kind, event.target.files?.[0])} />
        </div>
    )

    /* El accesor de la API manda un avatar por defecto cuando no hay foto: `has_photo` dice si es suya */
    const photo = client.photo as (IClient['photo'] & { has_photo?: boolean }) | null
    const photoUrl = photo && photo.has_photo !== false ? photo.url : null

    return (
        <div className="grid grid-cols-2 gap-3">
            {tile('photo', 'Foto', photoUrl)}
            {tile('logo', 'Logotipo', client.logotype?.url)}
        </div>
    )
}

export default PicturesRow;
