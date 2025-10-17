import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Package, Clock, Copy } from "lucide-react"
import type { StatsSummary } from "@/lib/api-client"

interface FilterStatsProps {
  summary: StatsSummary
}

export function FilterStats({ summary }: FilterStatsProps) {
  const totalFiltered = summary.filtered_delivery + summary.filtered_short_stay + summary.filtered_duplicate

  const filters = [
    {
      title: "外卖/快递人员",
      value: summary.filtered_delivery,
      icon: Package,
      color: "bg-chart-3",
      description: "Delivery Personnel Filtered",
    },
    {
      title: "短暂停留 (<2分钟)",
      value: summary.filtered_short_stay,
      icon: Clock,
      color: "bg-chart-4",
      description: "Short Stay Filtered",
    },
    {
      title: "重复访客",
      value: summary.filtered_duplicate,
      icon: Copy,
      color: "bg-chart-5",
      description: "Duplicate Visitors",
    },
  ]

  return (
    <div className="space-y-6">
      {/* 过滤概览 */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">过滤统计概览</CardTitle>
          <CardDescription className="text-muted-foreground">Filtering Statistics Overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">总进店人次</span>
              <span className="text-2xl font-bold text-foreground">{summary.total_entries}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">过滤人次</span>
              <span className="text-2xl font-bold text-destructive">{totalFiltered}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">有效访客</span>
              <span className="text-2xl font-bold text-accent">{summary.valid_visitors}</span>
            </div>
            <Progress value={(summary.valid_visitors / summary.total_entries) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              有效访客占比: {((summary.valid_visitors / summary.total_entries) * 100).toFixed(1)}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 过滤详情 */}
      <div className="grid gap-6 md:grid-cols-3">
        {filters.map((filter) => (
          <Card key={filter.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{filter.title}</CardTitle>
              <filter.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{filter.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{filter.description}</p>
              <div className="mt-4">
                <div
                  className={`h-2 rounded-full ${filter.color}`}
                  style={{ width: `${(filter.value / totalFiltered) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                占过滤总数: {totalFiltered > 0 ? ((filter.value / totalFiltered) * 100).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
