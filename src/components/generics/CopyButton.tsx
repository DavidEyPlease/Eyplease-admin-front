import { Button } from "@/uishadcn/ui/button"
import { CopyCheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success('Url copiada al portapapeles')
        setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    }

    return (
        <Button size='icon' variant='ghost' onClick={handleCopy}>
            {copied ? <CopyCheckIcon /> : <CopyIcon />}
        </Button>
    )
}

export default CopyButton