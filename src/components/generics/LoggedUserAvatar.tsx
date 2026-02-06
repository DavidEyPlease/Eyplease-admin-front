import Avatar from "./Avatar";
import { IAuthUser } from "@/interfaces/auth";

interface Props {
    user: IAuthUser
    className?: string
    sizeClasses?: string
    loading?: boolean
}

const LoggedUserAvatar = ({ user, className, sizeClasses = 'w-8 h-8', loading = false }: Props) => {
    return (
        <Avatar
            sizeClasses={sizeClasses}
            className={className}
            src={user?.profile_picture?.url || ''}
            alt={user?.name}
            loading={loading}
        />
    )
}

export default LoggedUserAvatar;