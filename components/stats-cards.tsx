import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, TrendingUp, Clock } from "lucide-react"
import type { StatsSummary } from "@/lib/api-client"

interface StatsCardsProps {
  summary: StatsSummary
}

export function StatsCards({ summary }: StatsCardsProps) {
  const cards = [
    {
      title: "总进店人次",
      value: summary.total_entries,
      icon: Users,
      description: "Total Entries",
      color: "text-primary",
    },
    {
      title: "有效访客",
      value: summary.valid_visitors,
      icon: UserCheck,
      description: "Valid Visitors",
      color: "text-accent",
    },
    {
      title: "平均身高",
      value: `${Math.round(summary.avg_height_cm)} cm`,
      icon: TrendingUp,
      description: "Average Height",
      color: "text-chart-3",
    },
    {
      title: "平均停留时间",
      value: `${Math.round(summary.avg_duration_seconds / 60)} 分钟`,
      icon: Clock,
      description: "Average Duration",
      color: "text-chart-4",
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
