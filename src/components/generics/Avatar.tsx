import clsx from "clsx"

import {
    Avatar as UIAvatar,
    AvatarFallback,
    AvatarImage,
} from "@/uishadcn/ui/avatar"
import Spinner from "../common/Spinner"
import { getInitialLetters } from "@/utils"
import { cn } from "@/lib/utils"

interface Props {
    src: string
    alt: string
    sizeClasses?: string
    className?: string
    loading?: boolean
}

const Avatar = ({ src, alt, sizeClasses, className, loading = false }: Props) => {
    return (
        <UIAvatar className={cn("rounded-lg", 'relative', sizeClasses, className)}>
            <AvatarImage
                src={src}
                alt={alt}
                className={cn(sizeClasses, "object-cover")}
            />
            {loading &&
                <div className="absolute grid w-full h-full bg-black/60 rounded-lg place-items-center">
                    <Spinner />
                </div>
            }
            <AvatarFallback className="grid text-sm text-center rounded-full">{getInitialLetters(alt)}</AvatarFallback>
        </UIAvatar>
    )
}

export default Avatar;