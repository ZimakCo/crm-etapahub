"use client"

import { use } from "react"
import Link from "next/link"
import { useSegment, useContacts } from "@/lib/hooks"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ArrowLeft,
  Users,
  Mail,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit,
  RefreshCw,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Segment, SegmentRule, SegmentRuleGroup } from "@/lib/types"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatNumber(num: number) {
  return num.toLocaleString()
}

function getOperatorLabel(operator: SegmentRule["operator"]) {
  const labels: Record<string, string> = {
    equals: "is",
    not_equals: "is not",
    contains: "contains",
    not_contains: "does not contain",
    starts_with: "starts with",
    ends_with: "ends with",
    is_empty: "is empty",
    is_not_empty: "is not empty",
    greater_than: "is greater than",
    less_than: "is less than",
    between: "is between",
    in_list: "is one of",
    not_in_list: "is not one of",
  }
  return labels[operator] || operator
}

function getFieldLabel(field: string) {
  const labels: Record<string, string> = {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    company: "Company",
    jobTitle: "Job Title",
    industry: "Industry",
    companySize: "Company Size",
    country: "Country",
    city: "City",
    leadSource: "Lead Source",
    subscriptionStatus: "Subscription Status",
    emailStatus: "Email Status",
    eventAttended: "Event Attended",
    emailOpensLast30Days: "Email Opens (Last 30 Days)",
  }
  return labels[field] || field
}

function RuleDisplay({ rule }: { rule: SegmentRule }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Badge variant="secondary" className="font-medium">
        {getFieldLabel(rule.field)}
      </Badge>
      <span className="text-muted-foreground">{getOperatorLabel(rule.operator)}</span>
      <Badge variant="outline">
        {Array.isArray(rule.value) ? rule.value.join(", ") : String(rule.value)}
      </Badge>
    </div>
  )
}

function RuleGroupDisplay({ group, index }: { group: SegmentRuleGroup; index: number }) {
  return (
    <div className="space-y-2">
      {index > 0 && (
        <div className="flex items-center gap-2 my-3">
          <Separator className="flex-1" />
          <Badge variant="outline" className="bg-accent text-accent-foreground">AND</Badge>
          <Separator className="flex-1" />
        </div>
      )}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Match {group.logic === "AND" ? "all" : "any"} of the following
        </div>
        <div className="space-y-2">
          {group.rules.map((rule, ruleIndex) => (
            <div key={rule.id}>
              {ruleIndex > 0 && (
                <div className="text-xs text-muted-foreground my-2 pl-2">
                  {group.logic}
                </div>
              )}
              <RuleDisplay rule={rule} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SegmentDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)
  const { segment, isLoading: segmentLoading } = useSegment(id)
  const { contacts, isLoading: contactsLoading } = useContacts()

  if (segmentLoading) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Skeleton className="h-4 w-48" />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-64" />
          </div>
        </main>
      </>
    )
  }

  if (!segment) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Segment not found</p>
        </main>
      </>
    )
  }

  // Get a preview of matching contacts (in real app, this would be filtered by rules)
  const previewContacts = contacts.slice(0, 10)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/segments">Segments</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{segment.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="flex flex-col gap-6 p-6">
          {/* Back Link */}
          <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
            <Link href="/segments">
              <ArrowLeft className="size-4" />
              Back to Segments
            </Link>
          </Button>

          {/* Segment Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">{segment.name}</h1>
                {segment.isActive ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
              <p className="text-muted-foreground">{segment.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Users className="size-4" />
                  <span>{formatNumber(segment.contactCount)} contacts</span>
                </div>
                <span>·</span>
                <span>Last calculated {formatDate(segment.lastCalculatedAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Mail className="size-4" />
                Create Campaign
              </Button>
              <Button variant="outline">
                <Edit className="size-4" />
                Edit Rules
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <RefreshCw className="size-4" />
                    Recalculate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="size-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Segment Rules</CardTitle>
                <CardDescription>
                  Contacts matching these criteria are included in this segment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {segment.ruleGroups.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      This segment includes all contacts (no filters applied)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {segment.ruleGroups.map((group, index) => (
                      <RuleGroupDisplay key={group.id} group={group} index={index} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Preview</CardTitle>
                <CardDescription>
                  Sample of contacts in this segment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {previewContacts.map((contact) => {
                        const initials = `${contact.firstName[0]}${contact.lastName[0]}`
                        return (
                          <Link
                            key={contact.id}
                            href={`/contacts`}
                            className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                          >
                            <Avatar className="size-9">
                              <AvatarFallback className="bg-gradient-to-br from-brand-pink to-brand-purple text-xs text-primary-foreground">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {contact.firstName} {contact.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {contact.email}
                              </p>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <p>{contact.company}</p>
                              <p>{contact.jobTitle}</p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
