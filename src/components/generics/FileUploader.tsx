import { FileTextIcon, UploadIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

// import { Badge } from "@/uishadcn/ui/badge";
// import { Button } from "@/uishadcn/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/uishadcn/ui/card";
import { Input } from "@/uishadcn/ui/input";
import { Label } from "@/uishadcn/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/uishadcn/ui/button";
import Spinner from "../common/Spinner";
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events";

interface FileUploaderProps {
    title: string
    description?: string
    info?: string
    buttonText?: string
    fileAccepts?: string
    disableUpload?: boolean
    loading?: boolean
    onUploadFiles: (files: File[]) => void
}

const FileUploader = ({ title, description, info, loading, fileAccepts = '.pdf,.doc,.docx,.xls,.xlsx', disableUpload, onUploadFiles }: FileUploaderProps) => {
    const [files, setFiles] = useState<File[]>([])
    const inputFileRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files
        if (selectedFiles) {
            const files = Array.from(selectedFiles)
            setFiles(files)
            onUploadFiles(files)
        }
    }

    const inputId = `file-upload-${useId()}`

    useEffect(() => {
        const handleEvent = (event: BrowserEvent<boolean>) => {
            if (event.detail && inputFileRef.current) {
                setFiles([])
                inputFileRef.current.value = ''
            }
        };

        subscribeEvent('clear-file-uploader', handleEvent as EventListener)

        return () => {
            unsubscribeEvent('clear-file-uploader', handleEvent as EventListener)
        }
    }, [])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UploadIcon className="h-5 w-5 text-indigo-600" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className={cn("border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors", disableUpload && 'opacity-50 cursor-not-allowed')}>
                    {loading ? (
                        <Spinner className="mx-auto" />
                    ) : (
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="mt-4">
                        <Label htmlFor={inputId} className="cursor-pointer">
                            <span className="text-sm flex-1 mb-2 font-medium text-indigo-600 hover:text-indigo-500">
                                Seleccionar archivo
                            </span>
                            <Input
                                id={inputId}
                                type="file"
                                className="hidden"
                                accept={fileAccepts}
                                disabled={disableUpload}
                                ref={inputFileRef}
                                onChange={handleFileUpload}
                            />
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                            {info}
                            {/* PDF, DOC, XLS hasta 10MB */}
                        </p>
                    </div>
                </div>

                {files.map(file => (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg" key={file.name}>
                        <div className="flex items-center gap-2">
                            <FileTextIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">{file.name}</span>
                        </div>
                        {/* <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Listo
                        </Badge> */}
                        <Button
                            variant="link"
                            className="text-sm text-red-600 hover:underline"
                            onClick={() => {
                                setFiles(prevFiles => {
                                    const newFiles = Array.from(prevFiles || []).filter(f => f.name !== file.name);
                                    onUploadFiles(newFiles);
                                    inputFileRef.current!.value = ''; // Clear the input value to allow re-uploading the same file if needed
                                    return newFiles;
                                });
                            }}
                        >
                            Eliminar
                        </Button>
                    </div>
                ))}

                {/* <Button
                    className="w-full" disabled={!files || disableUpload}
                    variant={files ? "default" : "secondary"}
                    onClick={() => files && onUploadFiles(files)}
                >
                    <UploadIcon className="mr-2 h-4 w-4" />
                    {files ? buttonText : "Selecciona un archivo"}
                </Button> */}

                {/* <div className="text-xs text-muted-foreground">
                    <p>• Los archivos se procesan automáticamente</p>
                    <p>• Recibirás una notificación al completarse</p>
                </div> */}
            </CardContent>
        </Card>
    )
}

export default FileUploader