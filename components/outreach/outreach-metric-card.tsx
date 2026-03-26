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
    <Card className={cn("overflow-hidden border", toneClassName)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-2xl border border-foreground/10 bg-white/80 shadow-sm">
            <Icon className="size-5 text-foreground" />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
