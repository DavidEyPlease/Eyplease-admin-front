import type { ReactNode } from "react";

import { Label } from "@/uishadcn/ui/label";

/** Labeled form row wrapper used throughout the property panel. */
export default function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">{label}</Label>
            {children}
        </div>
    );
}
