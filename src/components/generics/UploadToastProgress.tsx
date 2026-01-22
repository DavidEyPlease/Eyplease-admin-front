import { cn } from "@/lib/utils";
import useUploadStore from "@/store/uploadStore";
import { Button } from "@/uishadcn/ui/button";
import { XIcon } from "lucide-react";
import { TypographySmall } from "../common/Typography";

const UploadToastProgress = () => {
    const { uploads, cleanUploads } = useUploadStore(state => state)

    if (uploads.length === 0) return null

    return (
        <div className={cn("fixed min-w-xs z-[9999] space-y-3 bottom-5 right-5 px-4 pb-4 pt-2 rounded-md bg-primary shadow-lg animate-fade-right")}>
            <div className="flex justify-between items-center">
                <TypographySmall text="Cargando archivos..." className="text-white font-semibold" />
                <Button variant='ghost' size='icon' className="text-white" onClick={() => cleanUploads()}>
                    <XIcon className="text-xs" />
                </Button>
            </div>
            {uploads.map(file => (
                <div key={file.id}>
                    <span className="font-medium text-sm truncate text-white">{file.name}</span>
                    <div className="w-full h-2 bg-gray-200 rounded mt-2">
                        <div
                            className={`h-2 rounded transition-all duration-200 ${file.status === 'error' ? 'bg-red-500' : file.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                            style={{ width: `${file.progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-white mt-1">
                        {file.status === 'uploading'
                            ? `${file.progress}%`
                            : file.status === 'success'
                                ? 'Subida completada'
                                : 'Error en la subida'}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default UploadToastProgress;
