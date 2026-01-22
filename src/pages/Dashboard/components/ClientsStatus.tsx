import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/uishadcn/ui/card";
import { PieChartIcon } from "lucide-react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Label,
} from "recharts"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/uishadcn/ui/chart'

const chartConfig = {
    actives: {
        label: "Activos",
    },
    inactives: {
        label: "Inactivos",
        color: "hsl(var(--chart-1))",
    },
}

interface ClientStatusProps {
    activePercentage: number;
    inactivePercentage: number;
    totalClients: number;
}

const ClientStatus = ({ activePercentage, inactivePercentage, totalClients }: ClientStatusProps) => {
    const clientStatusData = [
        { name: "Activos", value: activePercentage || 0, fill: "var(--chart-2)" },
        { name: "Inactivos", value: inactivePercentage || 0, fill: "var(--chart-1)" },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-emerald-600" />
                    Estado de Clientes
                </CardTitle>
                <CardDescription>Distribución actual de clientes</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[250px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={clientStatusData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {totalClients.toLocaleString()}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground"
                                                    >
                                                        Clientes
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                    {clientStatusData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                                <span className="text-sm">{item.name}</span>
                            </div>
                            <span className="text-sm font-medium">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default ClientStatus