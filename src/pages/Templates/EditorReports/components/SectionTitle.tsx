import type { ReactNode } from "react";

/** Small uppercase heading used to group controls in the side panels. */
export default function SectionTitle({ children }: { children: ReactNode }) {
    return <h4 className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:mt-0">{children}</h4>;
}
