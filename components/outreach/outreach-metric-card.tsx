import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface OutreachMetricCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  toneClassName: string
}

export function OutreachMetricCard({ title, value, description, icon: Icon, toneClassName }: OutreachMetricCardProps) {
  return (
    <Card className="overflow-hidden border bg-background shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
          </div>
          <div className={cn("flex size-10 items-center justify-center rounded-2xl border", toneClassName)}>
            <Icon className="size-5" />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
