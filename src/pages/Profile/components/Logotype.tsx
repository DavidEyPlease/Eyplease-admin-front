import Button from "@/components/common/Button";
import Avatar from "@/components/generics/Avatar";
import FileSelector from "@/components/generics/FileSelector";
import { IconEdit } from "@/components/Svg/IconEdit";
import useAuth from "@/hooks/useAuth";
import { IClient } from "@/interfaces/clients";
import { FileTypes } from "@/interfaces/files";
import { IUser } from "@/interfaces/users";
import { getFileType } from "@/utils";
import { useState } from "react";

interface Props {
    user: IClient
}

const Logotype = ({ user }: Props) => {
    const { uploadUserPhoto } = useAuth()
    const [loading, setLoading] = useState(false)

    const onSubmitPhoto = async (file: File) => {
        try {
            setLoading(true)
            await uploadUserPhoto(
                file,
                FileTypes.USER_LOGOTYPE,
                `users/${user?.id}/logo.${getFileType(file.name)}`,
                'logotype'
            )
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative">
            <Avatar
                src={user?.logotype?.url || ''}
                alt="Logo"
                sizeClasses="w-12 h-12"
                className="border border-primary"
                loading={loading}
            />
            <FileSelector
                fileUploaderComponent={
                    <Button
                        color="primary"
                        className="absolute bottom-[-15px] left-10"
                        text={<IconEdit />}
                        rounded
                        size="icon"
                        disabled={loading}
                    />
                }
                onSelectedFile={onSubmitPhoto}
            />

        </div>
    )
}

export default Logotype;