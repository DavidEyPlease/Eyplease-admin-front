import { IPlan } from "@/interfaces/plans";
import { cn } from "@/lib/utils";
import { Badge } from "@/uishadcn/ui/badge";

interface PlanBadgeProps {
    plan: IPlan | null;
}

const PlanBadge = ({ plan }: PlanBadgeProps) => {
    return (
        <Badge
            variant={plan ? "default" : "secondary"}
            className={cn(plan ? 'text-white' : '', 'hover:not-hover:')}
            style={{
                backgroundColor: plan?.color
            }}
        >
            {plan?.name ?? 'Sin plan'}
        </Badge>
    )
}

export default PlanBadge;