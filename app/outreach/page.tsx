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
import { useContact, useContactsPage, useSenderIdentities, useTemplates } from "@/lib/hooks"
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

function formatMailboxStatus(status: string) {
  switch (status) {
    case "active":
      return {
        label: "Good",
        tone: "border-success/20 bg-success/10 text-success",
        issue: "SPF, DKIM, DMARC",
      }
    case "warmup":
      return {
        label: "Review",
        tone: "border-warning/20 bg-warning/10 text-warning",
        issue: "Tracking subdomain",
      }
    default:
      return {
        label: "Paused",
        tone: "border-border bg-muted text-muted-foreground",
        issue: "Mailbox paused",
      }
  }
}

function getMailboxDomain(label: string) {
  const match = label.match(/<([^>]+)>/)
  const email = match?.[1] ?? label.split("·").at(-1)?.trim() ?? label
  return email.split("@").at(-1) ?? email
}

function OutreachPageContent() {
  const searchParams = useSearchParams()
  const initialContactId = searchParams.get("contactId") ?? ""
  const { result: contactsResult } = useContactsPage({
    page: 1,
    pageSize: 100,
    sort: { field: "lastActivityAt", direction: "desc" },
  })
  const { contact: linkedContact } = useContact(initialContactId || null)
  const { senderIdentities } = useSenderIdentities()
  const { templates } = useTemplates()

  const contacts = useMemo(() => {
    const nextContacts = [...contactsResult.contacts]

    if (linkedContact && !nextContacts.some((contact) => contact.id === linkedContact.id)) {
      nextContacts.unshift(linkedContact)
    }

    return nextContacts
  }, [contactsResult.contacts, linkedContact])

  const mailboxOptions = useMemo(
    () =>
      senderIdentities.length > 0
        ? senderIdentities.map((sender) => ({
            id: sender.id,
            label: `${sender.fromName} <${sender.email}>`,
            status: sender.status,
            dailyLimit: sender.volumeBand,
          }))
        : [
            {
              id: "google-workspace-demo",
              label: "Google Workspace <events@etapahub.com>",
              status: "active",
              dailyLimit: "30-50/day",
            },
            {
              id: "m365-demo",
              label: "Microsoft 365 <sales@etapahub.com>",
              status: "warmup",
              dailyLimit: "20-40/day",
            },
          ],
    [senderIdentities]
  )

  const templateOptions = useMemo(
    () =>
      templates.length > 0
        ? templates.map((template) => ({
            id: template.id,
            label: template.name,
            subject: template.subject,
            body:
              template.textContent ??
              "Hi {{first_name}},\n\nI wanted to follow up regarding {{company}}.\n\nBest regards,\nEtapaHub",
            format: template.format,
          }))
        : [
            {
              id: "sequence-demo-template",
              label: "Conference outreach",
              subject: "Quick note for {{first_name}} at {{company}}",
              body:
                "Hi {{first_name}},\n\nI am reaching out because EtapaHub is opening a focused conversation with {{company}}.\n\nWould you be open to a short intro call next week?\n\nBest regards,\nEtapaHub",
              format: "plain_text",
            },
          ],
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
    domain: getMailboxDomain(mailbox.label),
    mailboxes: mailboxOptions.filter((item) => getMailboxDomain(item.label) === getMailboxDomain(mailbox.label)).length || index + 1,
    status: formatMailboxStatus(mailbox.status),
    dailyLimit: mailbox.dailyLimit,
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
          domain: selectedMailbox ? getMailboxDomain(selectedMailbox.label) : "etapahub.com",
          status: "Opened",
          tone: "border-success/20 bg-success/10 text-success",
          detail: `${selectedContact?.firstName ?? "Contact"} opened the first email`,
        },
        {
          id: "clicked",
          title: "Deliverability stats reviewed",
          domain: selectedMailbox ? getMailboxDomain(selectedMailbox.label) : "etapahub.com",
          status: "Clicked",
          tone: "border-info/20 bg-info/10 text-info",
          detail: "Mailbox domain health checked before follow-up",
        },
        {
          id: "replied",
          title: "Reply synced into CRM",
          domain: selectedMailbox ? getMailboxDomain(selectedMailbox.label) : "etapahub.com",
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
          event.domain.toLowerCase().includes(query) ||
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
          title: "Prepare follow-up email copy",
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
      description: "Early signal across connected inbox activity",
    },
    {
      title: "Reply rate",
      value: "18%",
      description: "Contacts moving into active conversation",
    },
    {
      title: "Mailbox health",
      value: mailboxRows.filter((mailbox) => mailbox.status.label === "Good").length.toString(),
      description: "Domains currently in a good sending state",
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
                Mailbox-connected workspace for direct emails, reply sync, follow-up tasks and sequence control.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/settings">Manage mailboxes</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/domains">Deliverability stats</Link>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="emails" className="space-y-5">
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
                    <SelectTrigger className="w-full lg:w-[280px]">
                      <SelectValue placeholder="All inboxes" />
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
                      placeholder="Search emails"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/templates">Templates</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/metrics">Analytics</Link>
                  </Button>
                </div>
              </div>

              {showEmailFilters && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">All inboxes</Badge>
                  <Badge variant="outline">Opened</Badge>
                  <Badge variant="outline">Clicked</Badge>
                  <Badge variant="outline">Replied</Badge>
                </div>
              )}

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Inbox className="size-5 text-muted-foreground" />
                      Email activity
                    </CardTitle>
                    <CardDescription>
                      Domain health and synced activity across connected mailboxes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-2xl border border-border">
                      <div className="grid grid-cols-[1.5fr_1.5fr_1fr_0.8fr] gap-3 border-b border-border px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        <span>Domain</span>
                        <span>At risk</span>
                        <span>Health</span>
                        <span>Mailboxes</span>
                      </div>
                      <div className="divide-y divide-border">
                        {mailboxRows.map((mailbox) => (
                          <div key={mailbox.id} className="grid grid-cols-[1.5fr_1.5fr_1fr_0.8fr] gap-3 px-4 py-3 text-sm">
                            <span className="font-medium text-foreground">{mailbox.domain}</span>
                            <span className="text-muted-foreground">{mailbox.status.issue}</span>
                            <span>
                              <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${mailbox.status.tone}`}>
                                {mailbox.status.label}
                              </span>
                            </span>
                            <span className="text-muted-foreground">{mailbox.mailboxes}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
                      <MailOpen className="size-9 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-lg font-medium">No synced emails yet</p>
                        <p className="max-w-xl text-sm text-muted-foreground">
                          Once mailbox sync is active, sent emails, opens, clicks and replies will appear here.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                          <Link href="/domains">View domains</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/settings">Open mailboxes</Link>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {emailEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.domain} · {event.detail}</p>
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
                        Direct send from the contact record with mailbox and template selection.
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
                          <SelectValue placeholder="Select template" />
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
                        <p className="mt-1 text-muted-foreground">Initial email sent from the selected mailbox.</p>
                      </div>
                      <div className="rounded-2xl border border-border p-3">
                        <p className="font-medium">{selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : "Contact"}</p>
                        <p className="mt-1 text-muted-foreground">Reply matched back into the CRM conversation thread.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="size-5 text-muted-foreground" />
                        Contact ownership
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
                    Email-first automation with stop rules on reply or interested status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-sm font-medium">Step 1</p>
                    <p className="mt-2 text-sm text-muted-foreground">Initial email from connected mailbox</p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-sm font-medium">Step 2</p>
                    <p className="mt-2 text-sm text-muted-foreground">Follow-up after +2 days with stop-on-reply</p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-sm font-medium">Step 3</p>
                    <p className="mt-2 text-sm text-muted-foreground">Manual call or task instead of another automatic send</p>
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
                    Manual work generated around replies, sequence stops and contact qualification.
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
                    Outreach templates
                  </CardTitle>
                  <CardDescription>
                    Reusable email blocks with merge tags and delivery-safe plain text fallback.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {templateOptions.map((template) => (
                    <div key={template.id} className="rounded-2xl border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{template.label}</p>
                        <Badge variant="outline">{template.format}</Badge>
                      </div>
                      <p className="mt-3 text-sm">{template.subject}</p>
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
                  <p><span className="font-medium text-foreground">Last reply</span>: proof that the conversation is active in the synced thread.</p>
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
