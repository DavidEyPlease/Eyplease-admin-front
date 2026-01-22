import { UsersLoggedInWeek } from "@/interfaces/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/uishadcn/ui/card";
import { TrendingUpIcon } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const UsersLoggingChart = ({ data }: { data: UsersLoggedInWeek }) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="h-5 w-5 text-blue-600" />
          Usuarios Ingresando por Día
        </CardTitle>
        <CardDescription>Tendencia de usuarios activos en los últimos 7 días</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#4E31C0"
              strokeWidth={3}
              dot={{ fill: "#4E31C0", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default UsersLoggingChart;