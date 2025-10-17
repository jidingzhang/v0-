/**
 * API客户端
 * API Client for traffic system
 */

export interface Visit {
  visit_id: number
  track_id: string
  camera_id: string
  entry_time: string
  exit_time: string | null
  duration_seconds: number
  height_cm: number
  posture: string
  clothing_color_top: string
  clothing_color_bottom: string
  is_delivery_person: boolean
  is_short_stay: boolean
  is_duplicate: boolean
  confidence_score: number
  created_at: string
}

export interface Stats {
  timestamp: string
  total_entries: number
  total_exits: number
  valid_visitors: number
  filtered_delivery: number
  filtered_short_stay: number
  filtered_duplicate: number
  avg_height_cm: number
  avg_duration_seconds: number
}

export interface StatsSummary {
  total_entries: number
  total_exits: number
  valid_visitors: number
  filtered_delivery: number
  filtered_short_stay: number
  filtered_duplicate: number
  avg_height_cm: number
  avg_duration_seconds: number
}

export interface StatsResponse {
  camera_id: string
  time_range: string
  summary: StatsSummary
  data: Stats[]
}

export class TrafficAPI {
  private baseUrl: string

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
  }

  async getStats(cameraId = "all", timeRange = "24h"): Promise<StatsResponse> {
    const response = await fetch(`${this.baseUrl}/stats?camera_id=${cameraId}&time_range=${timeRange}`)

    if (!response.ok) {
      throw new Error("Failed to fetch stats")
    }

    return response.json()
  }

  async getVisits(limit = 50, cameraId?: string, includeFiltered = false): Promise<{ total: number; visits: Visit[] }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      include_filtered: includeFiltered.toString(),
    })

    if (cameraId && cameraId !== "all") {
      params.append("camera_id", cameraId)
    }

    const response = await fetch(`${this.baseUrl}/visits?${params}`)

    if (!response.ok) {
      throw new Error("Failed to fetch visits")
    }

    return response.json()
  }

  async sendEvent(event: any): Promise<{ success: boolean; visit_id?: number }> {
    const response = await fetch(`${this.baseUrl}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      throw new Error("Failed to send event")
    }

    return response.json()
  }
}

export const trafficAPI = new TrafficAPI()
