"use client"

import { Users, Mail, MousePointerClick, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardStats } from "@/lib/types"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Contacts",
      value: stats.totalContacts.toLocaleString(),
      change: stats.contactsGrowth,
      changeLabel: "from last month",
      icon: Users,
    },
    {
      title: "Campaigns Sent",
      value: stats.totalCampaigns.toString(),
      subValue: `${stats.campaignsThisMonth} this month`,
      icon: Mail,
    },
    {
      title: "Avg. Open Rate",
      value: `${stats.avgOpenRate}%`,
      change: stats.openRateChange,
      changeLabel: "from last month",
      icon: Mail,
    },
    {
      title: "Avg. Click Rate",
      value: `${stats.avgClickRate}%`,
      change: stats.clickRateChange,
      changeLabel: "from last month",
      icon: MousePointerClick,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.change !== undefined ? (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                {card.change >= 0 ? (
                  <TrendingUp className="size-3 text-success" />
                ) : (
                  <TrendingDown className="size-3 text-destructive" />
                )}
                <span className={card.change >= 0 ? "text-success" : "text-destructive"}>
                  {card.change >= 0 ? "+" : ""}{card.change}%
                </span>
                {card.changeLabel}
              </p>
            ) : card.subValue ? (
              <p className="text-xs text-muted-foreground">{card.subValue}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
