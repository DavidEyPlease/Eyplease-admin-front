import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events";
import { useEffect, useRef } from "react";

interface Props {
    fileUploaderComponent: React.ReactNode
    fileAccept?: string
    onSelectedFile: (file: File) => void;
}

const FileSelector = ({ fileUploaderComponent, fileAccept = 'image/*', onSelectedFile }: Props) => {
    const inputFileRef = useRef<HTMLInputElement>(null);

    const onChangeInputFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onSelectedFile(file);
        }
    }

    useEffect(() => {
        const handleEvent = (event: BrowserEvent<boolean>) => {
            if (event.detail && inputFileRef.current) {
                inputFileRef.current.value = ''
            }
        };

        subscribeEvent('clear-file-uploader', handleEvent as EventListener)

        return () => {
            unsubscribeEvent('clear-file-uploader', handleEvent as EventListener)
        }
    }, [])

    return (
        <>
            <div onClick={() => inputFileRef.current?.click()}>
                {fileUploaderComponent}
            </div>
            <input
                type="file"
                accept={fileAccept}
                className="hidden"
                ref={inputFileRef}
                onChange={onChangeInputFile}
            />
        </>
    )
}

export default FileSelector;