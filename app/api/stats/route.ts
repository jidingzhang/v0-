import { type NextRequest, NextResponse } from "next/server"

// 模拟统计数据
// Mock statistics data
function generateMockStats(hours = 24) {
  const stats = []
  const now = new Date()

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)

    // 模拟一天中的客流变化
    // Simulate traffic patterns throughout the day
    const hour = timestamp.getHours()
    let baseTraffic = 10

    if (hour >= 10 && hour <= 12)
      baseTraffic = 50 // 上午高峰
    else if (hour >= 14 && hour <= 16)
      baseTraffic = 45 // 下午高峰
    else if (hour >= 18 && hour <= 20)
      baseTraffic = 60 // 晚间高峰
    else if (hour >= 22 || hour <= 6) baseTraffic = 5 // 夜间低谷

    const entries = Math.floor(baseTraffic + Math.random() * 20)
    const exits = Math.floor(entries * (0.9 + Math.random() * 0.2))
    const delivery = Math.floor(entries * 0.1)
    const shortStay = Math.floor(entries * 0.15)
    const duplicate = Math.floor(entries * 0.05)

    stats.push({
      timestamp: timestamp.toISOString(),
      total_entries: entries,
      total_exits: exits,
      valid_visitors: entries - delivery - shortStay - duplicate,
      filtered_delivery: delivery,
      filtered_short_stay: shortStay,
      filtered_duplicate: duplicate,
      avg_height_cm: 165 + Math.random() * 15,
      avg_duration_seconds: 300 + Math.random() * 600,
    })
  }

  return stats
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cameraId = searchParams.get("camera_id") || "all"
    const timeRange = searchParams.get("time_range") || "24h"

    // 解析时间范围
    // Parse time range
    let hours = 24
    if (timeRange === "1h") hours = 1
    else if (timeRange === "6h") hours = 6
    else if (timeRange === "12h") hours = 12
    else if (timeRange === "24h") hours = 24
    else if (timeRange === "7d") hours = 24 * 7

    const stats = generateMockStats(hours)

    // 计算汇总数据
    // Calculate summary data
    const summary = {
      total_entries: stats.reduce((sum, s) => sum + s.total_entries, 0),
      total_exits: stats.reduce((sum, s) => sum + s.total_exits, 0),
      valid_visitors: stats.reduce((sum, s) => sum + s.valid_visitors, 0),
      filtered_delivery: stats.reduce((sum, s) => sum + s.filtered_delivery, 0),
      filtered_short_stay: stats.reduce((sum, s) => sum + s.filtered_short_stay, 0),
      filtered_duplicate: stats.reduce((sum, s) => sum + s.filtered_duplicate, 0),
      avg_height_cm: stats.reduce((sum, s) => sum + s.avg_height_cm, 0) / stats.length,
      avg_duration_seconds: stats.reduce((sum, s) => sum + s.avg_duration_seconds, 0) / stats.length,
    }

    return NextResponse.json({
      camera_id: cameraId,
      time_range: timeRange,
      summary,
      data: stats,
    })
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
