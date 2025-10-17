import { type NextRequest, NextResponse } from "next/server"

// 模拟访客数据
// Mock visit data
function generateMockVisits(limit = 50) {
  const visits = []
  const now = new Date()

  const postures = ["standing", "bending", "sitting", "unknown"]
  const colors = ["black", "white", "blue", "red", "gray", "green", "yellow"]
  const cameras = ["CAM001", "CAM002", "CAM003"]

  for (let i = 0; i < limit; i++) {
    const entryTime = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000)
    const duration = 120 + Math.random() * 1800 // 2-32分钟
    const exitTime = new Date(entryTime.getTime() + duration * 1000)

    const isDelivery = Math.random() < 0.1
    const isShortStay = duration < 120
    const isDuplicate = Math.random() < 0.05

    visits.push({
      visit_id: i + 1,
      track_id: `T${String(i + 1).padStart(6, "0")}`,
      camera_id: cameras[Math.floor(Math.random() * cameras.length)],
      entry_time: entryTime.toISOString(),
      exit_time: exitTime.toISOString(),
      duration_seconds: Math.floor(duration),
      height_cm: Math.floor(150 + Math.random() * 40),
      posture: postures[Math.floor(Math.random() * postures.length)],
      clothing_color_top: colors[Math.floor(Math.random() * colors.length)],
      clothing_color_bottom: colors[Math.floor(Math.random() * colors.length)],
      is_delivery_person: isDelivery,
      is_short_stay: isShortStay,
      is_duplicate: isDuplicate,
      confidence_score: 0.7 + Math.random() * 0.3,
      created_at: entryTime.toISOString(),
    })
  }

  return visits.sort((a, b) => new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime())
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const cameraId = searchParams.get("camera_id")
    const includeFiltered = searchParams.get("include_filtered") === "true"

    let visits = generateMockVisits(limit)

    // 过滤摄像头
    // Filter by camera
    if (cameraId && cameraId !== "all") {
      visits = visits.filter((v) => v.camera_id === cameraId)
    }

    // 过滤已过滤的访客
    // Filter out filtered visits
    if (!includeFiltered) {
      visits = visits.filter((v) => !v.is_delivery_person && !v.is_short_stay && !v.is_duplicate)
    }

    return NextResponse.json({
      total: visits.length,
      visits,
    })
  } catch (error) {
    console.error("[v0] Error fetching visits:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
