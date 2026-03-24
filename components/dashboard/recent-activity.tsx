"use client"

import { useRecentActivities } from "@/lib/hooks"
import { 
  Mail, 
  MousePointerClick, 
  UserPlus, 
  Calendar, 
  Tag,
  Filter,
  MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { ActivityType } from "@/lib/types"

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "email_sent":
    case "email_opened":
      return Mail
    case "email_clicked":
      return MousePointerClick
    case "email_replied":
      return MessageSquare
    case "contact_created":
    case "contact_updated":
      return UserPlus
    case "event_registered":
    case "event_attended":
      return Calendar
    case "tag_added":
    case "tag_removed":
      return Tag
    case "segment_added":
    case "segment_removed":
      return Filter
    default:
      return Mail
  }
}

function getActivityColor(type: ActivityType) {
  switch (type) {
    case "email_opened":
    case "email_clicked":
    case "email_replied":
      return "text-brand-pink bg-brand-pink/10"
    case "contact_created":
      return "text-success bg-success/10"
    case "event_registered":
    case "event_attended":
      return "text-info bg-info/10"
    case "segment_added":
    case "tag_added":
      return "text-accent bg-accent/10"
    default:
      return "text-muted-foreground bg-muted"
  }
}

export function RecentActivity() {
  const { activities, isLoading } = useRecentActivities()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent CRM Activity</CardTitle>
        <CardDescription>Replies, registrations, segment moves and manual commercial updates</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              const colorClass = getActivityColor(activity.type)
              
              return (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`rounded-full p-2 ${colorClass}`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    {activity.contact && (
                      <p className="text-xs text-muted-foreground">
                        {activity.contact.name} ({activity.contact.email})
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
