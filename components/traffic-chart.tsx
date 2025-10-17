"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { Stats } from "@/lib/api-client"

interface TrafficChartProps {
  data: Stats[]
}

export function TrafficChart({ data }: TrafficChartProps) {
  // 格式化数据用于图表
  const chartData = data.map((stat) => ({
    time: new Date(stat.timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    进店: stat.total_entries,
    离店: stat.total_exits,
    有效访客: stat.valid_visitors,
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 客流趋势图 */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">客流趋势</CardTitle>
          <CardDescription className="text-muted-foreground">Traffic Trends Over Time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="进店"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="离店"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 有效访客趋势 */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">有效访客趋势</CardTitle>
          <CardDescription className="text-muted-foreground">Valid Visitors After Filtering</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="有效访客" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
