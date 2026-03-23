"use client"

import Link from "next/link"
import { useSegments } from "@/lib/hooks"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Users, Filter, ArrowRight, Calendar } from "lucide-react"
import type { Segment } from "@/lib/types"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatNumber(num: number) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function getRuleCount(segment: Segment): number {
  return segment.ruleGroups.reduce((acc, group) => acc + group.rules.length, 0)
}

export default function SegmentsPage() {
  const { segments, isLoading } = useSegments()

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Segments</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="flex flex-col gap-6 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">Segments</h1>
              <p className="text-sm text-muted-foreground">
                Group contacts by criteria for targeted campaigns
              </p>
            </div>
            <Button asChild>
              <Link href="/segments/new">
                <Plus className="size-4" />
                Create Segment
              </Link>
            </Button>
          </div>

          {/* Segments Grid */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {segments.map((segment) => (
                <SegmentCard key={segment.id} segment={segment} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function SegmentCard({ segment }: { segment: Segment }) {
  const ruleCount = getRuleCount(segment)

  return (
    <Link href={`/segments/${segment.id}`}>
      <Card className="group h-full transition-colors hover:bg-muted/50 cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{segment.name}</h3>
                  {segment.isActive ? (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {segment.description}
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                <span>{formatNumber(segment.contactCount)} contacts</span>
              </div>
              {ruleCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Filter className="size-3.5" />
                  <span>{ruleCount} rule{ruleCount !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              <span>Updated {formatDate(segment.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
