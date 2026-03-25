"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  deleteSegment,
  duplicateSegment,
  recalculateSegment,
  updateSegment,
} from "@/lib/crm-repository"
import { useContacts, useSegment } from "@/lib/hooks"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  ArrowLeft,
  Copy,
  Edit,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type {
  Segment,
  SegmentFieldType,
  SegmentOperator,
  SegmentRule,
  SegmentRuleGroup,
} from "@/lib/types"

const FIELD_OPTIONS: Array<{
  value: string
  label: string
  fieldType: SegmentFieldType
  options?: Array<{ value: string; label: string }>
}> = [
  { value: "firstName", label: "First Name", fieldType: "text" },
  { value: "lastName", label: "Last Name", fieldType: "text" },
  { value: "email", label: "Email", fieldType: "text" },
  { value: "company", label: "Company", fieldType: "text" },
  { value: "jobTitle", label: "Job Title", fieldType: "text" },
  { value: "industry", label: "Industry", fieldType: "text" },
  { value: "companySize", label: "Company Size", fieldType: "select" },
  { value: "country", label: "Country", fieldType: "text" },
  { value: "city", label: "City", fieldType: "text" },
  { value: "leadSource", label: "Lead Source", fieldType: "text" },
  {
    value: "subscriptionStatus",
    label: "Subscription Status",
    fieldType: "select",
    options: [
      { value: "subscribed", label: "Subscribed" },
      { value: "unsubscribed", label: "Unsubscribed" },
      { value: "bounced", label: "Bounced" },
      { value: "complained", label: "Complained" },
    ],
  },
  {
    value: "emailStatus",
    label: "Email Status",
    fieldType: "select",
    options: [
      { value: "valid", label: "Valid" },
      { value: "unknown", label: "Unknown" },
      { value: "catch-all", label: "Catch-all" },
      { value: "invalid", label: "Invalid" },
      { value: "spam", label: "Spam" },
    ],
  },
  { value: "eventAttended", label: "Event Attended", fieldType: "text" },
  { value: "emailOpensLast30Days", label: "Email Opens (Last 30 Days)", fieldType: "number" },
]

const TEXT_OPERATORS: Array<{ value: SegmentOperator; label: string }> = [
  { value: "equals", label: "is" },
  { value: "not_equals", label: "is not" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
  { value: "starts_with", label: "starts with" },
  { value: "ends_with", label: "ends with" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
  { value: "in_list", label: "is one of" },
  { value: "not_in_list", label: "is not one of" },
]

const NUMBER_OPERATORS: Array<{ value: SegmentOperator; label: string }> = [
  { value: "equals", label: "is" },
  { value: "greater_than", label: "is greater than" },
  { value: "less_than", label: "is less than" },
  { value: "between", label: "is between" },
]

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

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
  return [...TEXT_OPERATORS, ...NUMBER_OPERATORS].find((item) => item.value === operator)?.label ?? operator
}

function getFieldLabel(field: string) {
  return FIELD_OPTIONS.find((item) => item.value === field)?.label ?? field
}

function getOperators(fieldType: SegmentFieldType) {
  return fieldType === "number" ? NUMBER_OPERATORS : TEXT_OPERATORS
}

function getDefaultOperator(fieldType: SegmentFieldType): SegmentOperator {
  return fieldType === "number" ? "greater_than" : "contains"
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
        <div className="my-3 flex items-center gap-2">
          <Separator className="flex-1" />
          <Badge variant="outline" className="bg-accent text-accent-foreground">
            AND
          </Badge>
          <Separator className="flex-1" />
        </div>
      )}
      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Match {group.logic === "AND" ? "all" : "any"} of the following
        </div>
        <div className="space-y-2">
          {group.rules.map((rule, ruleIndex) => (
            <div key={rule.id}>
              {ruleIndex > 0 && (
                <div className="my-2 pl-2 text-xs text-muted-foreground">{group.logic}</div>
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
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { segment, isLoading: segmentLoading, mutate: mutateSegment } = useSegment(id)
  const { contacts, isLoading: contactsLoading, mutate: mutateContacts } = useContacts()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    groupLogic: "AND",
    segmentKind: "manual",
    isActive: true,
    ruleGroups: [] as SegmentRuleGroup[],
  })

  useEffect(() => {
    if (!segment) {
      return
    }

    setFormData({
      name: segment.name,
      description: segment.description,
      groupLogic: segment.groupLogic,
      segmentKind: segment.segmentKind ?? "manual",
      isActive: segment.isActive,
      ruleGroups: segment.ruleGroups.map((group) => ({
        ...group,
        rules: group.rules.map((rule) => ({ ...rule })),
      })),
    })
  }, [segment])

  const previewContacts = useMemo(() => {
    if (!segment) {
      return []
    }

    return contacts
      .filter((contact) => segment.name.toLowerCase() === "all contacts" || contact.segments.includes(segment.name))
      .slice(0, 10)
  }, [contacts, segment])

  const addRuleGroup = () => {
    setFormData((current) => ({
      ...current,
      ruleGroups: [
        ...current.ruleGroups,
        {
          id: makeId("group"),
          logic: "AND",
          rules: [
            {
              id: makeId("rule"),
              field: "jobTitle",
              fieldType: "text",
              operator: "contains",
              value: "",
            },
          ],
        },
      ],
    }))
  }

  const addRuleToGroup = (groupId: string) => {
    setFormData((current) => ({
      ...current,
      ruleGroups: current.ruleGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: [
                ...group.rules,
                {
                  id: makeId("rule"),
                  field: "jobTitle",
                  fieldType: "text",
                  operator: "contains",
                  value: "",
                },
              ],
            }
          : group
      ),
    }))
  }

  const removeRuleGroup = (groupId: string) => {
    setFormData((current) => ({
      ...current,
      ruleGroups: current.ruleGroups.filter((group) => group.id !== groupId),
    }))
  }

  const updateGroupLogic = (groupId: string, logic: "AND" | "OR") => {
    setFormData((current) => ({
      ...current,
      ruleGroups: current.ruleGroups.map((group) =>
        group.id === groupId ? { ...group, logic } : group
      ),
    }))
  }

  const removeRule = (groupId: string, ruleId: string) => {
    setFormData((current) => ({
      ...current,
      ruleGroups: current.ruleGroups.map((group) =>
        group.id === groupId
          ? { ...group, rules: group.rules.filter((rule) => rule.id !== ruleId) }
          : group
      ),
    }))
  }

  const updateRuleField = (groupId: string, ruleId: string, field: string) => {
    const fieldOption = FIELD_OPTIONS.find((item) => item.value === field)

    if (!fieldOption) {
      return
    }

    setFormData((current) => ({
      ...current,
      ruleGroups: current.ruleGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: group.rules.map((rule) =>
                rule.id === ruleId
                  ? {
                      ...rule,
                      field,
                      fieldType: fieldOption.fieldType,
                      operator: getDefaultOperator(fieldOption.fieldType),
                      value: "",
                    }
                  : rule
              ),
            }
          : group
      ),
    }))
  }

  const updateRule = (
    groupId: string,
    ruleId: string,
    patch: Partial<SegmentRule>
  ) => {
    setFormData((current) => ({
      ...current,
      ruleGroups: current.ruleGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: group.rules.map((rule) =>
                rule.id === ruleId ? { ...rule, ...patch } : rule
              ),
            }
          : group
      ),
    }))
  }

  const handleSaveSegment = async () => {
    if (!segment) {
      return
    }

    setIsSaving(true)
    try {
      await updateSegment(segment.id, {
        name: formData.name,
        description: formData.description,
        groupLogic: formData.groupLogic as Segment["groupLogic"],
        segmentKind: formData.segmentKind as Segment["segmentKind"],
        isActive: formData.isActive,
        ruleGroups: formData.ruleGroups,
      })
      const recalculated = await recalculateSegment(segment.id)
      await Promise.all([mutateSegment(recalculated, false), mutateContacts()])
      setEditOpen(false)
      toast.success("Segment updated")
    } catch (error) {
      console.error(error)
      toast.error("Could not update the segment")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRecalculate = async () => {
    if (!segment) {
      return
    }

    setIsRecalculating(true)
    try {
      const recalculated = await recalculateSegment(segment.id)
      await Promise.all([mutateSegment(recalculated, false), mutateContacts()])
      toast.success("Segment recalculated")
    } catch (error) {
      console.error(error)
      toast.error("Could not recalculate the segment")
    } finally {
      setIsRecalculating(false)
    }
  }

  const handleDuplicate = async () => {
    if (!segment) {
      return
    }

    try {
      const duplicated = await duplicateSegment(segment.id)
      toast.success("Segment duplicated")
      router.push(`/segments/${duplicated.id}`)
    } catch (error) {
      console.error(error)
      toast.error("Could not duplicate the segment")
    }
  }

  const handleDelete = async () => {
    if (!segment) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteSegment(segment.id)
      toast.success("Segment deleted")
      router.push("/segments")
    } catch (error) {
      console.error(error)
      toast.error("Could not delete the segment")
    } finally {
      setIsDeleting(false)
    }
  }

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
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Segment not found</p>
        </main>
      </>
    )
  }

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
          <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
            <Link href="/segments">
              <ArrowLeft className="size-4" />
              Back to Segments
            </Link>
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">{segment.name}</h1>
                {segment.isActive ? (
                  <Badge variant="outline" className="border-success/20 bg-success/10 text-success">
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
              <Button variant="outline" asChild>
                <Link href={`/broadcasts/new?segmentId=${segment.id}`}>
                  <Mail className="size-4" />
                  Create Broadcast
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setEditOpen(true)}>
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
                  <DropdownMenuItem onSelect={handleRecalculate} disabled={isRecalculating}>
                    <RefreshCw className="size-4" />
                    Recalculate
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleDuplicate}>
                    <Copy className="size-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onSelect={() => setDeleteOpen(true)}>
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Segment Rules</CardTitle>
                <CardDescription>
                  Contacts matching these criteria are included in this segment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {segment.ruleGroups.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      {segment.name.toLowerCase() === "all contacts"
                        ? "This segment includes all contacts in the workspace."
                        : "This segment is managed manually with explicit contact assignments."}
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

            <Card>
              <CardHeader>
                <CardTitle>Contact Preview</CardTitle>
                <CardDescription>Sample of contacts currently in this segment.</CardDescription>
              </CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} className="h-12" />
                    ))}
                  </div>
                ) : previewContacts.length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {previewContacts.map((contact) => (
                        <Link
                          key={contact.id}
                          href="/contacts"
                          className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                        >
                          <Avatar className="size-9">
                            <AvatarFallback className="bg-gradient-to-br from-brand-pink to-brand-purple text-xs text-primary-foreground">
                              {contact.firstName[0]}
                              {contact.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {contact.firstName} {contact.lastName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{contact.email}</p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>{contact.company}</p>
                            <p>{contact.jobTitle}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No contacts match this segment yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Edit Segment</DialogTitle>
            <DialogDescription>
              Update the segment metadata and the rule groups used during recalculation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="segmentName">Segment name</Label>
                <Input
                  id="segmentName"
                  value={formData.name}
                  onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Segment type</Label>
                <Select
                  value={formData.segmentKind}
                  onValueChange={(value) => setFormData((current) => ({ ...current, segmentKind: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual batch</SelectItem>
                    <SelectItem value="dynamic">Dynamic audience</SelectItem>
                    <SelectItem value="campaign">Campaign-driven</SelectItem>
                    <SelectItem value="event">Event-driven</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="segmentDescription">Description</Label>
              <Textarea
                id="segmentDescription"
                rows={3}
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Segment active</p>
                <p className="text-xs text-muted-foreground">Inactive segments stay visible but are excluded from working use.</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((current) => ({ ...current, isActive: checked }))}
              />
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Rule groups</p>
                  <p className="text-xs text-muted-foreground">
                    Group logic decides how the blocks are combined during recalculation.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={formData.groupLogic}
                    onValueChange={(value) => setFormData((current) => ({ ...current, groupLogic: value }))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={addRuleGroup}>
                    <Plus className="size-4" />
                    Add Group
                  </Button>
                </div>
              </div>

              {formData.ruleGroups.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No rule groups configured. Manual segments keep explicit memberships; the &quot;All Contacts&quot; segment includes every contact.
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.ruleGroups.map((group, groupIndex) => (
                    <div key={group.id} className="space-y-3 rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Group {groupIndex + 1}</p>
                          <p className="text-xs text-muted-foreground">Match contacts using the selected logic inside this block.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select value={group.logic} onValueChange={(value) => updateGroupLogic(group.id, value as "AND" | "OR")}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">AND</SelectItem>
                              <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeRuleGroup(group.id)}>
                            <Trash2 className="size-4" />
                            Remove Group
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {group.rules.map((rule) => {
                          const fieldDefinition = FIELD_OPTIONS.find((item) => item.value === rule.field) ?? FIELD_OPTIONS[0]
                          const operatorOptions = getOperators(rule.fieldType)
                          const usesValue = rule.operator !== "is_empty" && rule.operator !== "is_not_empty"

                          return (
                            <div key={rule.id} className="grid gap-3 rounded-md border border-border/70 p-3 md:grid-cols-[1.2fr_1fr_1.2fr_auto]">
                              <div className="space-y-2">
                                <Label>Field</Label>
                                <Select value={rule.field} onValueChange={(value) => updateRuleField(group.id, rule.id, value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {FIELD_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Operator</Label>
                                <Select
                                  value={rule.operator}
                                  onValueChange={(value) => updateRule(group.id, rule.id, { operator: value as SegmentOperator })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {operatorOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Value</Label>
                                {usesValue ? (
                                  fieldDefinition.options ? (
                                    <Select
                                      value={String(rule.value)}
                                      onValueChange={(value) => updateRule(group.id, rule.id, { value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {fieldDefinition.options.map((option) => (
                                          <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input
                                      value={String(rule.value ?? "")}
                                      onChange={(event) => updateRule(group.id, rule.id, { value: event.target.value })}
                                      placeholder={rule.operator === "between" ? "10, 20" : "Value"}
                                    />
                                  )
                                ) : (
                                  <div className="flex h-9 items-center rounded-md border border-dashed border-border px-3 text-sm text-muted-foreground">
                                    No value needed
                                  </div>
                                )}
                              </div>

                              <div className="flex items-end">
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeRule(group.id, rule.id)}>
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <Button type="button" variant="outline" size="sm" onClick={() => addRuleToGroup(group.id)}>
                        <Plus className="size-4" />
                        Add Rule
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSegment} disabled={isSaving}>
              Save Segment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Segment</DialogTitle>
            <DialogDescription>
              Remove {segment.name} and detach it from every contact membership.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Broadcasts that already used this segment keep their historical stats, but the segment itself is removed from active CRM workflows.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              Delete Segment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
