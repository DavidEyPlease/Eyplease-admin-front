import { Button } from "@/uishadcn/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router";

interface Props {
    to?: string;
}

const ButtonBack = ({ to }: Props) => {
    const navigate = useNavigate()

    if (!to && !window.history.length) {
        return null; // No back navigation available
    }

    return (
        <Button variant='ghost' size='icon' onClick={() => to ? navigate(to) : window.history.back()}>
            <ArrowLeftIcon />
        </Button>
    )
}

export default ButtonBack;