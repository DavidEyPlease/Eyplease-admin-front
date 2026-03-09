import {
    Avatar as UIAvatar,
    AvatarFallback,
    AvatarImage,
} from "@/uishadcn/ui/avatar"
import Spinner from "../common/Spinner"
import { getInitialLetters } from "@/utils"
import { cn } from "@/lib/utils"
import FileSelector from "./FileSelector"
import { PencilLineIcon } from "lucide-react"

interface Props {
    src: string
    alt: string
    sizeClasses?: string
    className?: string
    loading?: boolean
}

interface EditableProps extends Props {
    canEdit: true
    onSelectedFile: (file: File) => void
}

interface ReadOnlyProps extends Props {
    canEdit?: false
    onSelectedFile?: never
}

type AvatarProps = EditableProps | ReadOnlyProps

const Avatar = ({ src, alt, sizeClasses, className, loading = false, canEdit = false, onSelectedFile }: AvatarProps) => {
    return (
        <UIAvatar className={cn("rounded-lg group/avatar relative", sizeClasses, className)}>
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
            {canEdit && (
                <FileSelector
                    fileUploaderComponent={
                        <button className={cn("hidden absolute inset-0 z-20 group-hover/avatar:grid group-hover/avatar:bg-primary/50 place-items-center rounded-lg group-hover/avatar:transition-all duration-300 cursor-pointer")}>
                            <PencilLineIcon className="h-4 w-4 text-white" />
                        </button>
                    }
                    onSelectedFile={onSelectedFile!}
                />
            )}
            <AvatarFallback className="grid text-sm text-center rounded-full">{getInitialLetters(alt)}</AvatarFallback>
        </UIAvatar>
    )
}

export default Avatar;