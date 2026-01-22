import { MAP_TASK_STATUS_COLORS, MAP_USER_REQUEST_STATUS } from "@/constants/app";
import { UserRequestServicesGraph } from "@/interfaces/dashboard";
import { UserRequestStatusTypes } from "@/interfaces/requestService";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/uishadcn/ui/card";
import { ClockIcon } from "lucide-react";
import { useMemo } from "react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts"

const RequestServicesChart = ({ data }: { data: UserRequestServicesGraph }) => {

    const serviceStatusData = useMemo(() => {
        return data.map(item => ({
            status: item.status,
            total: item.total,
        }));
    }, [data]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-orange-600" />
                    Servicios en Proceso y Corrección
                </CardTitle>
                <CardDescription>Estado actual de los servicios</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={serviceStatusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-3 gap-4">
                    {data.map(metric => {
                        const STYLES = MAP_TASK_STATUS_COLORS[metric.slug];
                        return (
                            <div className={cn(
                                'text-center p-3 bg-orange-50 rounded-lg',
                                STYLES
                            )}>
                                <div className="text-2xl font-bold text-white">
                                    {metric.total}
                                </div>
                                <div className="text-sm text-white">
                                    {metric.status}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

export default RequestServicesChart;