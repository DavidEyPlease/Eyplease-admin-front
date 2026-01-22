import { forwardRef } from "react";

import { Label } from "@/uishadcn/ui/label";
import { Switch } from "@/uishadcn/ui/switch";
import { SwitchInputProps } from "./types";
import { Badge } from "@/uishadcn/ui/badge";
import Spinner from "../Spinner";
import { cn } from "@/lib/utils";

const SwitchInput = forwardRef<HTMLButtonElement, SwitchInputProps>(({
    id,
    label,
    badge,
    loading,
    className,
    ...props
}, ref) => {
    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <Switch id={id} ref={ref} {...props} disabled={loading || props.disabled} />
            {label && <Label htmlFor="airplane-mode">{label}</Label>}
            {badge && <Badge variant={props.checked ? "default" : "secondary"} className="gap-x-2">
                {props.checked ? "Activo" : "Inactivo"}
                {loading && <Spinner size="xs" color="primary" />}
            </Badge>}
        </div>
    )
});

export default SwitchInput;