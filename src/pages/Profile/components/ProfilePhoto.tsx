import { useState } from "react";

import Button from "@/components/common/Button";
import FileSelector from "@/components/generics/FileSelector";
import LoggedUserAvatar from "@/components/generics/LoggedUserAvatar";
import { IconEdit } from "@/components/Svg/IconEdit";
import useAuth from "@/hooks/useAuth";
import { IAuthUser } from "@/interfaces/auth";
import { FileTypes } from "@/interfaces/files";
import { getFileType } from "@/utils";
import { publishEvent } from "@/utils/events";

interface Props {
    user: IAuthUser
}

const ProfilePhoto = ({ user }: Props) => {
    const { uploadUserPhoto } = useAuth()
    const [loading, setLoading] = useState(false)

    const onSubmitPhoto = async (file: File) => {
        try {
            setLoading(true)
            await uploadUserPhoto(
                file,
                FileTypes.USER_PROFILE_PHOTO,
                `${new Date().getTime()}.${getFileType(file.type)}`,
                'profilePicture'
            )
            publishEvent('clear-file-uploader', true)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative">
            {user &&
                <>
                    <LoggedUserAvatar
                        user={user}
                        sizeClasses="w-32 h-32"
                        className="mt-[-35px] border-4 border-white"
                        loading={loading}
                    />
                    <FileSelector
                        fileUploaderComponent={
                            <Button
                                color="primary"
                                className="absolute top-[-50px] right-[-15px]"
                                text={<IconEdit />}
                                rounded
                                size="icon"
                            />
                        }
                        onSelectedFile={onSubmitPhoto}
                    />
                </>
            }
        </div>
    )
}

export default ProfilePhoto;