import FileSelector from "@/components/generics/FileSelector"
import Button from "@/components/common/Button";
import { UploadIcon } from "lucide-react";
import useReportUpload from "@/hooks/useReportUpload";
import UploadErrorFeedback from "@/pages/NewsletterReports/components/UploadErrorFeedback";
import { NetworkRankGroupType } from "@/interfaces/vendors";

interface Props {
    buttonLabel?: string;
    clientId: string;
    rolSelected: NetworkRankGroupType;
}

const UpdateNetwork = ({ clientId, rolSelected, buttonLabel = 'Actualizar red' }: Props) => {
    const { loading, uploadError, setUploadError, onUpdateNetwork } = useReportUpload()

    return (
        <>
            <FileSelector
                fileUploaderComponent={
                    <Button
                        color="primary"
                        text={
                            <div className="flex items-center space-x-2 gap-x-2">
                                <UploadIcon />
                                {buttonLabel}
                            </div>
                        }
                        rounded
                        loading={loading}
                    />
                }
                fileAccept=".xlsx, .xls"
                onSelectedFile={file => onUpdateNetwork(clientId, rolSelected, file)}
            />
            {uploadError &&
                <UploadErrorFeedback open={!!uploadError} onClose={() => setUploadError(null)} uploadError={uploadError} />
            }
        </>
    )
}

export default UpdateNetwork;