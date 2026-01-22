import { Edit3Icon } from "lucide-react";
import IconUploadPhoto from "../Svg/IconUploadPhoto";
import Avatar from "./Avatar";
import FileSelector from "./FileSelector";
import Spinner from "../common/Spinner";

interface Props {
    uri: string | null;
    src: string;
    alt?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    roundedClass?: string;
    onlyIcon?: boolean;
    loading?: boolean;
    onUpload: (file: File) => void;
}

const AvatarUploadPhoto = ({ uri, src, alt, loading, size = 'lg', roundedClass = 'rounded-full', onlyIcon = false, onUpload }: Props) => {

    const AVATAR_SIZES_CLASSES = {
        xs: 'size-16',
        sm: 'w-20 h-20',
        md: 'w-24 h-24',
        lg: 'w-28 h-28',
    }

    const CONTAINER_SIZES_CLASSES = {
        xs: 'size-16',
        sm: 'w-20 h-20',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
    }

    const ICON_SIZES_CLASSES = {
        xs: 'size-6',
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    }

    return (
        <div className='relative w-max'>
            {loading &&
                <div className="absolute grid w-full h-full bg-black/60 rounded-lg place-items-center">
                    <Spinner />
                </div>
            }
            {uri &&
                <Avatar
                    src={src}
                    alt={alt || 'Avatar'}
                    sizeClasses={`${AVATAR_SIZES_CLASSES[size]} ${roundedClass}`}
                    className={`${roundedClass}`} //absolute top-[-40px] left-0 
                    loading={loading}
                />
            }
            <FileSelector
                fileUploaderComponent={
                    uri ? (
                        <button className="grid cursor-pointer place-content-center absolute top-0 right-[-15px] bg-primary text-white rounded-full size-7">
                            <Edit3Icon className="size-4" />
                        </button>
                    ) : (
                        <button className={`flex flex-col items-center gap-1 justify-center ${CONTAINER_SIZES_CLASSES[size]} border border-dashed ${roundedClass} text-muted-foreground bg-[#F7F5FF] border-primary-light`}>
                            <IconUploadPhoto className={ICON_SIZES_CLASSES[size]} />
                            {!onlyIcon && <small>Cargar foto</small>}
                        </button>
                    )
                }
                onSelectedFile={onUpload}
            />
        </div>
    )
}

export default AvatarUploadPhoto;