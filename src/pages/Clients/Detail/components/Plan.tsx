import Chip from "@/components/generics/Chip";
import { IPlan } from "@/interfaces/plans";
import { Card, CardContent } from "@/uishadcn/ui/card";
import { Progress } from "@/uishadcn/ui/progress";
import { formatCurrency } from "@/utils";

interface Props {
    plan: IPlan
}

const Plan = ({ plan }: Props) => {
    return (
        <Card>
            <CardContent className="space-y-5">
                <div className="flex justify-between">
                    <Chip label={plan.name} colorClass="bg-primary" />
                    <p className="text-2xl font-semibold text-primary-dark">{formatCurrency(plan.price)}</p>
                </div>

                <Progress value={10} />
            </CardContent>
        </Card>
    )
}

export default Plan;