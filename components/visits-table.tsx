import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Visit } from "@/lib/api-client"

interface VisitsTableProps {
  visits: Visit[]
}

export function VisitsTable({ visits }: VisitsTableProps) {
  function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  function getPostureBadge(posture: string) {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      standing: "default",
      bending: "secondary",
      sitting: "outline",
      unknown: "outline",
    }
    return variants[posture] || "outline"
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">访客记录</CardTitle>
        <CardDescription className="text-muted-foreground">Recent Visitor Records (Valid Only)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="text-muted-foreground">跟踪ID</TableHead>
                <TableHead className="text-muted-foreground">摄像头</TableHead>
                <TableHead className="text-muted-foreground">进店时间</TableHead>
                <TableHead className="text-muted-foreground">停留时间</TableHead>
                <TableHead className="text-muted-foreground">身高</TableHead>
                <TableHead className="text-muted-foreground">姿态</TableHead>
                <TableHead className="text-muted-foreground">上装颜色</TableHead>
                <TableHead className="text-muted-foreground">下装颜色</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.map((visit) => (
                <TableRow key={visit.visit_id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-mono text-sm text-foreground">{visit.track_id}</TableCell>
                  <TableCell className="text-foreground">{visit.camera_id}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(visit.entry_time).toLocaleTimeString("zh-CN")}
                  </TableCell>
                  <TableCell className="text-foreground">{formatDuration(visit.duration_seconds)}</TableCell>
                  <TableCell className="text-foreground">{visit.height_cm} cm</TableCell>
                  <TableCell>
                    <Badge variant={getPostureBadge(visit.posture)}>{visit.posture}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{visit.clothing_color_top}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{visit.clothing_color_bottom}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
