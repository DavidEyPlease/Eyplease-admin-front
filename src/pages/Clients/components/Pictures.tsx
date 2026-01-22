import AvatarUploadPhoto from "@/components/generics/AvatarUploadPhoto";
import useFiles from "@/hooks/useFiles";
import useRequest from "@/hooks/useRequest";
import { IClient, IClientUpdate, URI_CLIENT_LOGOTYPE, URI_MAIN_CLIENT_PHOTO } from "@/interfaces/clients";
import { EypleaseFile, FileTypes } from "@/interfaces/files";
import { ClientsService } from "@/services/clients.service";
import { getFileType, setVariablesInString } from "@/utils";
import { useState } from "react";
import { toast } from "sonner";
import { FormSteps } from "../Create/form";

interface ClientPicturesProps {
    clientId: string;
    photo: EypleaseFile | null;
    logotype: EypleaseFile | null;
    onUploadSuccess: (client: IClient, step: FormSteps) => void;
}

const Pictures = ({ clientId, photo, logotype, onUploadSuccess }: ClientPicturesProps) => {
    const { onUploadFile } = useFiles()
    const [loading, setLoading] = useState<FileTypes | null>(null)

    const onUpdate = async (data: IClientUpdate) => {
        const response = await ClientsService.update(clientId, data)
        if (response.success) {
            onUploadSuccess(response.data, 'network')
            console.log('Cliente actualizado con éxito')
        }
    }

    const onUpload = async (file: File, uri: string, fileType: FileTypes) => {
        try {
            setLoading(fileType)
            const updateProperties = {
                [FileTypes.USER_PROFILE_PHOTO]: 'photo',
                [FileTypes.USER_LOGOTYPE]: 'logo',
            }

            await onUploadFile({
                file,
                filename: uri,
                fileType,
                callback: fileUri => onUpdate({ [updateProperties[fileType as keyof typeof updateProperties]]: fileUri }),
            })
        } catch (error) {
            toast.error('Error al subir la portada de la plantilla')
        } finally {
            setLoading(null)
        }
    }

    const photoUri = setVariablesInString(URI_MAIN_CLIENT_PHOTO, { id: clientId });
    const logotypeUri = setVariablesInString(URI_CLIENT_LOGOTYPE, { id: clientId });

    return (
        <div className="grid md:grid-cols-3">
            <div>
                <p className="mb-2">Foto boletín</p>
                <AvatarUploadPhoto
                    src={photo?.url || ''}
                    uri={photo?.uri || null}
                    alt={'Foto del cliente'}
                    roundedClass="rounded-md"
                    size="lg"
                    onlyIcon
                    loading={loading === FileTypes.USER_PROFILE_PHOTO}
                    onUpload={file => onUpload(
                        file,
                        `${photoUri}/main-photo.${getFileType(file.type)}`,
                        FileTypes.USER_PROFILE_PHOTO
                    )}
                />
            </div>

            <div>
                <p className="mb-2">Foto PNG</p>
                <AvatarUploadPhoto
                    src={photo?.url || ''}
                    uri={photo?.uri || null}
                    alt={'Foto del cliente'}
                    roundedClass="rounded-md"
                    size="lg"
                    onlyIcon
                    loading={false}
                    onUpload={e => console.log(e)}
                />
            </div>

            <div>
                <p className="mb-2">Logotipo</p>
                <AvatarUploadPhoto
                    src={logotype?.url || ''}
                    uri={logotype?.uri || null}
                    alt={'Logotipo del cliente'}
                    roundedClass="rounded-md"
                    size="lg"
                    onlyIcon
                    loading={loading === FileTypes.USER_LOGOTYPE}
                    onUpload={file => onUpload(
                        file,
                        `${logotypeUri}/logo.${getFileType(file.type)}`,
                        FileTypes.USER_LOGOTYPE
                    )}
                />
            </div>
        </div>
    )
}

export default Pictures;