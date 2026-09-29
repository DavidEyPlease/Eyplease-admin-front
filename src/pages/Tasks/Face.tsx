import { useState } from 'react'

import { cn } from '@/lib/utils'
import { initials, photoOf } from './lib'

type Person = { name: string, photo?: string | null, profile_picture?: { url?: string | null } | null }

/**
 * La carita de quien lo hace: su foto o, si no tiene (o no carga), sus iniciales sobre el degradado de la
 * marca. Nunca el ícono de imagen rota. Sin persona, un círculo punteado: «nadie lo ha tomado».
 */
const Face = ({ user, size = 24, className }: { user: Person | null | undefined, size?: number, className?: string }) => {
    const [broken, setBroken] = useState(false)
    const style = { width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.38)) }

    if (!user) return <span style={style} title="Sin asignar" className={cn('grid shrink-0 place-items-center rounded-full border-[1.5px] border-dashed border-foreground/30 font-extrabold text-muted-foreground', className)}>?</span>

    const photo = photoOf(user)
    if (photo && !broken) return <img src={photo} alt="" title={user.name} onError={() => setBroken(true)} style={style} className={cn('shrink-0 rounded-full object-cover', className)} />

    return <span style={style} title={user.name} className={cn('grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#4E31C0] via-[#6C47FF] to-[#2CD4D9] font-extrabold text-white', className)}>{initials(user.name)}</span>
}

export default Face
