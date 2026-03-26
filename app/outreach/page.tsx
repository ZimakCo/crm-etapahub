"use client"

import Link from "next/link"
import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  ArrowUpDown,
  BarChart3,
  CheckCircle2,
  Clock3,
  Filter,
  Inbox,
  Mail,
  MailOpen,
  MessagesSquare,
  Search,
  Settings2,
  Shield,
  Workflow,
} from "lucide-react"
import { useContact, useContactsPage, useOutreachMailboxes, useOutreachTemplates } from "@/lib/hooks"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function renderMergeTags(value: string, contact: { firstName?: string; company?: string } | null) {
  return value
    .replaceAll("{{first_name}}", contact?.firstName ?? "there")
    .replaceAll("{{company}}", contact?.company ?? "your company")
}

function formatMailboxProvider(provider: string) {
  switch (provider) {
    case "google_workspace":
      return "Google Workspace"
    case "microsoft_365":
      return "Microsoft 365"
    default:
      return "Outlook"
  }
}

function formatConnectionStatus(status: string) {
  switch (status) {
    case "connected":
      return {
        label: "Connected",
        tone: "border-success/20 bg-success/10 text-success",
      }
    case "attention":
      return {
        label: "Attention",
        tone: "border-warning/20 bg-warning/10 text-warning",
      }
    default:
      return {
        label: "Paused",
        tone: "border-border bg-muted text-muted-foreground",
      }
  }
}

function formatSendingHealth(status: string) {
  switch (status) {
    case "healthy":
      return {
        label: "Healthy",
        tone: "border-success/20 bg-success/10 text-success",
      }
    case "warming":
      return {
        label: "Warming",
        tone: "border-info/20 bg-info/10 text-info",
      }
    case "at_risk":
      return {
        label: "At risk",
        tone: "border-warning/20 bg-warning/10 text-warning",
      }
    default:
      return {
        label: "Paused",
        tone: "border-border bg-muted text-muted-foreground",
      }
  }
}

function getMailboxEmail(label: string) {
  return label.match(/<([^>]+)>/)?.[1] ?? label
}

function OutreachPageContent() {
  const searchParams = useSearchParams()
  const initialContactId = searchParams.get("contactId") ?? ""
  const requestedView = searchParams.get("view")
  const defaultView = ["emails", "tasks", "templates", "analytics"].includes(requestedView ?? "")
    ? (requestedView as "emails" | "tasks" | "templates" | "analytics")
    : "emails"

  const { result: contactsResult } = useContactsPage({
    page: 1,
    pageSize: 100,
    sort: { field: "lastActivityAt", direction: "desc" },
  })
  const { contact: linkedContact } = useContact(initialContactId || null)
  const { mailboxes } = useOutreachMailboxes()
  const { templates } = useOutreachTemplates()

  const contacts = useMemo(() => {
    const nextContacts = [...contactsResult.contacts]

    if (linkedContact && !nextContacts.some((contact) => contact.id === linkedContact.id)) {
      nextContacts.unshift(linkedContact)
    }

    return nextContacts
  }, [contactsResult.contacts, linkedContact])

  const mailboxOptions = useMemo(
    () =>
      mailboxes.length > 0
        ? mailboxes.map((mailbox) => ({
            id: mailbox.id,
            label: `${mailbox.displayName} <${mailbox.email}>`,
            ownerName: mailbox.ownerName,
            provider: mailbox.provider,
            connectionStatus: mailbox.connectionStatus,
            sendingHealth: mailbox.sendingHealth,
            dailyLimit: mailbox.dailyLimit,
            lastSyncAt: mailbox.lastSyncAt,
          }))
        : [],
    [mailboxes]
  )

  const templateOptions = useMemo(
    () =>
      templates.length > 0
        ? templates.map((template) => ({
            id: template.id,
            label: template.name,
            subject: template.subject,
            body: template.plainTextBody,
            format: template.htmlBody ? "html" : "plain_text",
            category: template.category,
          }))
        : [],
    [templates]
  )

  const [selectedContactId, setSelectedContactId] = useState(initialContactId)
  const [selectedMailboxId, setSelectedMailboxId] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [emailSearch, setEmailSearch] = useState("")
  const [taskSearch, setTaskSearch] = useState("")
  const [showEmailFilters, setShowEmailFilters] = useState(false)
  const [showTaskFilters, setShowTaskFilters] = useState(false)

  const selectedContact =
    contacts.find((contact) => contact.id === (selectedContactId || initialContactId)) ??
    contacts[0] ??
    linkedContact ??
    null
  const selectedMailbox =
    mailboxOptions.find((mailbox) => mailbox.id === selectedMailboxId) ?? mailboxOptions[0] ?? null
  const selectedTemplate =
    templateOptions.find((template) => template.id === selectedTemplateId) ?? templateOptions[0] ?? null

  const mailboxRows = mailboxOptions.map((mailbox, index) => ({
    id: mailbox.id,
    seller: mailbox.ownerName,
    email: getMailboxEmail(mailbox.label),
    provider: formatMailboxProvider(mailbox.provider),
    connection: formatConnectionStatus(mailbox.connectionStatus),
    health: formatSendingHealth(mailbox.sendingHealth),
    dailyLimit: mailbox.dailyLimit,
    lastSyncAt: mailbox.lastSyncAt
      ? new Date(mailbox.lastSyncAt).toLocaleString()
      : `Mailbox ${index + 1}`,
  }))

  const renderedSubject = renderMergeTags(
    selectedTemplate?.subject ?? "Quick note for {{first_name}} at {{company}}",
    selectedContact
  )
  const renderedBody = renderMergeTags(
    selectedTemplate?.body ??
      "Hi {{first_name}},\n\nI wanted to reach out regarding {{company}}.\n\nBest regards,\nEtapaHub",
    selectedContact
  )

  const emailEvents = useMemo(
    () =>
      [
        {
          id: "opened",
          title: renderedSubject,
          mailbox: selectedMailbox ? getMailboxEmail(selectedMailbox.label) : "seller mailbox",
          status: "Opened",
          tone: "border-success/20 bg-success/10 text-success",
          detail: `${selectedContact?.firstName ?? "Contact"} opened the first email`,
        },
        {
          id: "clicked",
          title: "Follow-up link clicked",
          mailbox: selectedMailbox ? getMailboxEmail(selectedMailbox.label) : "seller mailbox",
          status: "Clicked",
          tone: "border-info/20 bg-info/10 text-info",
          detail: "Tracked click came from the seller-owned thread",
        },
        {
          id: "replied",
          title: "Reply synced into seller workspace",
          mailbox: selectedMailbox ? getMailboxEmail(selectedMailbox.label) : "seller mailbox",
          status: "Replied",
          tone: "border-warning/20 bg-warning/10 text-warning",
          detail: `${selectedContact?.firstName ?? "Contact"} replied in the connected thread`,
        },
      ].filter((event) => {
        const query = emailSearch.trim().toLowerCase()

        if (!query) {
          return true
        }

        return (
          event.title.toLowerCase().includes(query) ||
          event.mailbox.toLowerCase().includes(query) ||
          event.detail.toLowerCase().includes(query)
        )
      }),
    [emailSearch, renderedSubject, selectedContact?.firstName, selectedMailbox]
  )

  const taskRows = useMemo(
    () =>
      [
        {
          id: "task-call",
          title: `Call ${selectedContact?.firstName ?? "contact"} after reply`,
          type: "Call task",
          due: "Today",
          priority: "High",
        },
        {
          id: "task-followup",
          title: "Prepare personal follow-up email",
          type: "Email task",
          due: "+2 days",
          priority: "Medium",
        },
        {
          id: "task-linkedin",
          title: "Check LinkedIn context before manual step",
          type: "LinkedIn task",
          due: "+4 days",
          priority: "Low",
        },
      ].filter((task) => {
        const query = taskSearch.trim().toLowerCase()

        if (!query) {
          return true
        }

        return `${task.title} ${task.type} ${task.priority}`.toLowerCase().includes(query)
      }),
    [selectedContact?.firstName, taskSearch]
  )

  const analyticsCards = [
    {
      title: "Open rate",
      value: "67%",
      description: "Early signal across seller inbox activity",
    },
    {
      title: "Reply rate",
      value: "18%",
      description: "Contacts moving into active conversation",
    },
    {
      title: "Healthy inboxes",
      value: mailboxRows.filter((mailbox) => mailbox.health.label === "Healthy").length.toString(),
      description: "Personal mailboxes currently in a healthy state",
    },
    {
      title: "Manual steps",
      value: taskRows.length.toString(),
      description: "Tasks queued for seller follow-up",
    },
  ]

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/contacts">Contacts</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Outreach</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto p-6" data-testid="outreach-page">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight">Outreach</h1>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px]">
                  Beta
                </Badge>
              </div>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Seller workspace for personal mailbox outreach, synced replies, follow-up tasks and sequence control.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/outreach/settings">Manage personal mailboxes</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/outreach?view=analytics">Seller analytics</Link>
              </Button>
            </div>
          </div>

          <Card className="border-dashed">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Outreach is a seller-only workspace. Campaigns, broadcasts, sender identities and large batch delivery stay in Email Ops. The two areas can share the same contact database, but they must not share the same sending stack.
            </CardContent>
          </Card>

          <Tabs defaultValue={defaultView} className="space-y-5">
            <TabsList className="h-auto w-fit gap-2 rounded-full border bg-card/90 p-1">
              <TabsTrigger value="emails" className="rounded-full px-4">Emails</TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-full px-4">Tasks</TabsTrigger>
              <TabsTrigger value="templates" className="rounded-full px-4">Templates</TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-full px-4">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="emails" className="m-0 space-y-6">
              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <Select value={selectedMailbox?.id ?? mailboxOptions[0]?.id ?? ""} onValueChange={setSelectedMailboxId}>
                    <SelectTrigger className="w-full lg:w-[320px]">
                      <SelectValue placeholder="All personal inboxes" />
                    </SelectTrigger>
                    <SelectContent>
                      {mailboxOptions.map((mailbox) => (
                        <SelectItem key={mailbox.id} value={mailbox.id}>
                          {mailbox.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setShowEmailFilters((value) => !value)}>
                    <Filter className="size-4" />
                    Show filters
                  </Button>
                  <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={emailSearch}
                      onChange={(event) => setEmailSearch(event.target.value)}
                      placeholder="Search seller emails"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/outreach?view=templates">Seller templates</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/outreach?view=analytics">Analytics</Link>
                  </Button>
                </div>
              </div>

              {showEmailFilters && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Connected inboxes</Badge>
                  <Badge variant="outline">Needs attention</Badge>
                  <Badge variant="outline">Healthy senders</Badge>
                  <Badge variant="outline">Recent replies</Badge>
                </div>
              )}

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Inbox className="size-5 text-muted-foreground" />
                      Seller mailboxes
                    </CardTitle>
                    <CardDescription>
                      Personal inboxes connected by the sales team inside relationship CRM.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-2xl border border-border">
                      <div className="grid grid-cols-[1.5fr_1fr_1.2fr_0.8fr] gap-3 border-b border-border px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        <span>Seller</span>
                        <span>Provider</span>
                        <span>Sync</span>
                        <span>Limit</span>
                      </div>
                      <div className="divide-y divide-border">
                        {mailboxRows.map((mailbox) => (
                          <div key={mailbox.id} className="grid grid-cols-[1.5fr_1fr_1.2fr_0.8fr] gap-3 px-4 py-3 text-sm">
                            <div>
                              <p className="font-medium text-foreground">{mailbox.seller}</p>
                              <p className="text-xs text-muted-foreground">{mailbox.email}</p>
                            </div>
                            <span className="text-muted-foreground">{mailbox.provider}</span>
                            <div className="flex flex-wrap gap-2">
                              <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${mailbox.connection.tone}`}>
                                {mailbox.connection.label}
                              </span>
                              <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${mailbox.health.tone}`}>
                                {mailbox.health.label}
                              </span>
                            </div>
                            <span className="text-muted-foreground">{mailbox.dailyLimit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
                      <MailOpen className="size-9 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-lg font-medium">No synced seller conversations yet</p>
                        <p className="max-w-xl text-sm text-muted-foreground">
                          Once personal mailbox sync is active, direct emails, opens, clicks and replies will appear here without touching the campaign delivery stack.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                          <Link href="/outreach/settings">Manage inboxes</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/outreach?view=analytics">Open analytics</Link>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {emailEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.mailbox} · {event.detail}</p>
                          </div>
                          <Badge variant="outline" className={event.tone}>
                            {event.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="size-5 text-muted-foreground" />
                        1:1 email preview
                      </CardTitle>
                      <CardDescription>
                        Direct seller send from the contact record using a personal mailbox connection.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Select value={selectedContact?.id ?? contacts[0]?.id ?? ""} onValueChange={setSelectedContactId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact" />
                        </SelectTrigger>
                        <SelectContent>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.firstName} {contact.lastName} · {contact.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedTemplate?.id ?? templateOptions[0]?.id ?? ""} onValueChange={setSelectedTemplateId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select seller template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templateOptions.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="space-y-2 rounded-2xl border border-border bg-background p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">From</p>
                        <p className="text-sm">{selectedMailbox?.label ?? "No mailbox selected"}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">To</p>
                        <p className="text-sm">{selectedContact?.email ?? "No contact selected"}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subject</p>
                        <p className="text-sm font-medium">{renderedSubject}</p>
                        <div className="whitespace-pre-wrap rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">
                          {renderedBody}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{"{{first_name}}"}</Badge>
                          <Badge variant="secondary">{"{{company}}"}</Badge>
                          <Badge variant="secondary">{selectedTemplate?.category ?? "custom"}</Badge>
                          <Badge variant="outline">{selectedTemplate?.format === "html" ? "HTML + plain fallback" : "Plain text"}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessagesSquare className="size-5 text-muted-foreground" />
                        Conversation thread
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="rounded-2xl bg-muted/50 p-3">
                        <p className="font-medium">EtapaHub</p>
                        <p className="mt-1 text-muted-foreground">Initial seller email sent from the selected personal mailbox.</p>
                      </div>
                      <div className="rounded-2xl border border-border p-3">
                        <p className="font-medium">{selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : "Contact"}</p>
                        <p className="mt-1 text-muted-foreground">Reply matched back into the seller conversation thread.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="size-5 text-muted-foreground" />
                        Seller ownership
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <p>Owner: <span className="text-foreground">{selectedContact?.ownerName ?? "Unassigned"}</span></p>
                      <p>Status: <span className="text-foreground">{selectedContact?.outreachStatus?.replaceAll("_", " ") ?? "not contacted"}</span></p>
                      <p>Last reply: <span className="text-foreground">{selectedContact?.lastReplyAt ? new Date(selectedContact.lastReplyAt).toLocaleString() : "No reply tracked yet"}</span></p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="size-5 text-muted-foreground" />
                    Sequence steps
                  </CardTitle>
                  <CardDescription>
                    Seller sequence with stop rules on reply or interested status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-sm font-medium">Step 1</p>
                    <p className="mt-2 text-sm text-muted-foreground">Initial 1:1 email from the seller mailbox</p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-sm font-medium">Step 2</p>
                    <p className="mt-2 text-sm text-muted-foreground">Follow-up after +2 days with stop-on-reply</p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-sm font-medium">Step 3</p>
                    <p className="mt-2 text-sm text-muted-foreground">Manual task or call instead of another automatic send</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="m-0 space-y-6">
              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <Button variant="outline" size="sm" onClick={() => setShowTaskFilters((value) => !value)}>
                    <Filter className="size-4" />
                    Show filters
                  </Button>
                  <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={taskSearch}
                      onChange={(event) => setTaskSearch(event.target.value)}
                      placeholder="Search tasks"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="size-4" />
                    Sort
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings2 className="size-4" />
                    View options
                  </Button>
                </div>
              </div>

              {showTaskFilters && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">All tasks</Badge>
                  <Badge variant="outline">Call tasks</Badge>
                  <Badge variant="outline">Email tasks</Badge>
                  <Badge variant="outline">Overdue</Badge>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock3 className="size-5 text-muted-foreground" />
                    Follow-up tasks
                  </CardTitle>
                  <CardDescription>
                    Manual seller work generated around replies, sequence stops and contact qualification.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {taskRows.map((task) => (
                    <div key={task.id} className="grid gap-3 rounded-2xl border border-border px-4 py-3 md:grid-cols-[1.8fr_1fr_0.8fr_0.8fr] md:items-center">
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Owner: {selectedContact?.ownerName ?? "Sales desk"}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{task.type}</p>
                      <p className="text-sm text-muted-foreground">{task.due}</p>
                      <Badge variant="outline">{task.priority}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="size-5 text-muted-foreground" />
                    Seller templates
                  </CardTitle>
                  <CardDescription>
                    Reusable 1:1 templates and sequence steps kept separate from marketing broadcasts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {templateOptions.map((template) => (
                    <div key={template.id} className="rounded-2xl border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{template.label}</p>
                        <Badge variant="outline">{template.format}</Badge>
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">{template.category}</p>
                      <p className="mt-2 text-sm">{template.subject}</p>
                      <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                        {template.body}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="m-0 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {analyticsCards.map((card) => (
                  <Card key={card.title}>
                    <CardContent className="flex items-start justify-between gap-4 pt-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                        <p className="text-2xl font-semibold">{card.value}</p>
                        <p className="text-xs text-muted-foreground">{card.description}</p>
                      </div>
                      <div className="rounded-xl bg-muted p-3">
                        <BarChart3 className="size-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-muted-foreground" />
                    What moves a contact into active communication?
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                  <p><span className="font-medium text-foreground">Owner</span>: who from EtapaHub is following the account.</p>
                  <p><span className="font-medium text-foreground">Outreach status</span>: in communication, in sequence, replied, interested or not interested.</p>
                  <p><span className="font-medium text-foreground">Last reply</span>: proof that the seller conversation is active in the synced thread, independent from marketing broadcasts.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}

export default function OutreachPage() {
  return (
    <Suspense fallback={<main className="flex-1 p-6" />}>
      <OutreachPageContent />
    </Suspense>
  )
}
