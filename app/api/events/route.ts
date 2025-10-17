import { type NextRequest, NextResponse } from "next/server"

// 模拟数据存储 (实际应使用数据库)
// Mock data storage (should use database in production)
const visits: any[] = []
const stats: Map<string, any> = new Map()

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    console.log("[v0] Received event:", event)

    // 验证事件数据
    // Validate event data
    if (!event.event_type || !event.camera_id || !event.track_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 处理进入事件
    // Process entry event
    if (event.event_type === "entry") {
      const visit = {
        visit_id: visits.length + 1,
        track_id: event.track_id,
        camera_id: event.camera_id,
        entry_time: event.entry_time,
        exit_time: null,
        height_cm: event.height_cm,
        posture: event.posture,
        clothing_color_top: event.clothing_color_top,
        clothing_color_bottom: event.clothing_color_bottom,
        is_delivery_person: event.is_delivery_person,
        is_short_stay: false,
        is_duplicate: false,
        confidence_score: event.confidence,
        created_at: new Date().toISOString(),
      }

      visits.push(visit)

      // 更新统计
      // Update statistics
      updateStats(event.camera_id, "entry")

      return NextResponse.json({
        success: true,
        visit_id: visit.visit_id,
      })
    }

    // 处理离开事件
    // Process exit event
    if (event.event_type === "exit") {
      const visit = visits.find((v) => v.track_id === event.track_id && !v.exit_time)

      if (visit) {
        visit.exit_time = event.exit_time
        visit.is_short_stay = event.is_short_stay

        // 计算停留时间
        // Calculate duration
        const entryTime = new Date(visit.entry_time)
        const exitTime = new Date(visit.exit_time)
        visit.duration_seconds = Math.floor((exitTime.getTime() - entryTime.getTime()) / 1000)

        // 更新统计
        // Update statistics
        updateStats(event.camera_id, "exit", visit)
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error processing event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function updateStats(cameraId: string, eventType: "entry" | "exit", visit?: any) {
  const now = new Date()
  const minuteKey = `${cameraId}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`

  let stat = stats.get(minuteKey)

  if (!stat) {
    stat = {
      camera_id: cameraId,
      timestamp_minute: now.toISOString(),
      total_entries: 0,
      total_exits: 0,
      valid_visitors: 0,
      filtered_delivery: 0,
      filtered_short_stay: 0,
      filtered_duplicate: 0,
      heights: [],
      durations: [],
    }
    stats.set(minuteKey, stat)
  }

  if (eventType === "entry") {
    stat.total_entries++
  } else if (eventType === "exit" && visit) {
    stat.total_exits++

    // 统计有效访客
    // Count valid visitors
    if (!visit.is_delivery_person && !visit.is_short_stay && !visit.is_duplicate) {
      stat.valid_visitors++
    }

    if (visit.is_delivery_person) stat.filtered_delivery++
    if (visit.is_short_stay) stat.filtered_short_stay++
    if (visit.is_duplicate) stat.filtered_duplicate++

    if (visit.height_cm) stat.heights.push(visit.height_cm)
    if (visit.duration_seconds) stat.durations.push(visit.duration_seconds)
  }
}
