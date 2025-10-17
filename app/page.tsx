"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { trafficAPI, type StatsResponse, type Visit } from "@/lib/api-client"
import { StatsCards } from "@/components/stats-cards"
import { TrafficChart } from "@/components/traffic-chart"
import { VisitsTable } from "@/components/visits-table"
import { FilterStats } from "@/components/filter-stats"
import { Activity, Users, Filter } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("24h")
  const [cameraId, setCameraId] = useState("all")

  useEffect(() => {
    loadData()
  }, [timeRange, cameraId])

  async function loadData() {
    setLoading(true)
    try {
      const [statsData, visitsData] = await Promise.all([
        trafficAPI.getStats(cameraId, timeRange),
        trafficAPI.getVisits(50, cameraId, false),
      ])

      setStats(statsData)
      setVisits(visitsData.visits)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">客流统计系统</h1>
              <p className="text-sm text-muted-foreground">Store Traffic Analytics Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={cameraId} onValueChange={setCameraId}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有摄像头</SelectItem>
                  <SelectItem value="CAM001">主入口</SelectItem>
                  <SelectItem value="CAM002">侧门</SelectItem>
                  <SelectItem value="CAM003">后门</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1小时</SelectItem>
                  <SelectItem value="6h">6小时</SelectItem>
                  <SelectItem value="12h">12小时</SelectItem>
                  <SelectItem value="24h">24小时</SelectItem>
                  <SelectItem value="7d">7天</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            {stats && <StatsCards summary={stats.summary} />}

            {/* Charts and Tables */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-card">
                <TabsTrigger value="overview">
                  <Activity className="w-4 h-4 mr-2" />
                  概览
                </TabsTrigger>
                <TabsTrigger value="visitors">
                  <Users className="w-4 h-4 mr-2" />
                  访客记录
                </TabsTrigger>
                <TabsTrigger value="filters">
                  <Filter className="w-4 h-4 mr-2" />
                  过滤统计
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <TrafficChart data={stats?.data || []} />
              </TabsContent>

              <TabsContent value="visitors" className="space-y-6">
                <VisitsTable visits={visits} />
              </TabsContent>

              <TabsContent value="filters" className="space-y-6">
                {stats && <FilterStats summary={stats.summary} />}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}
