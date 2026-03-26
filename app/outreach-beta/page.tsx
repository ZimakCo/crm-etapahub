"use client"

import Link from "next/link"
import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  Activity,
  BadgeCheck,
  Clock3,
  Inbox,
  Link2,
  Mail,
  MailCheck,
  MessagesSquare,
  Shield,
  Sparkles,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function renderMergeTags(value: string, contact: { firstName?: string; company?: string } | null) {
  return value
    .replaceAll("{{first_name}}", contact?.firstName ?? "there")
    .replaceAll("{{company}}", contact?.company ?? "your company")
}

function OutreachBetaPageContent() {
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
            provider: sender.provider === "manual" ? "workspace" : sender.provider,
            status: sender.status,
            dailyLimit: sender.volumeBand,
          }))
        : [
            {
              id: "google-workspace-demo",
              label: "Google Workspace · events@etapahub.com",
              provider: "google",
              status: "active",
              dailyLimit: "30-50/day",
            },
            {
              id: "m365-demo",
              label: "Microsoft 365 · sales@etapahub.com",
              provider: "microsoft",
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
              "Hi {{first_name}},\n\nI wanted to follow up regarding {{company}} and the EtapaHub opportunity.\n\nBest regards,\nEtapaHub",
            format: template.format,
          }))
        : [
            {
              id: "sequence-demo-template",
              label: "Conference outreach demo",
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

  const selectedContact =
    contacts.find((contact) => contact.id === (selectedContactId || initialContactId)) ??
    contacts[0] ??
    linkedContact ??
    null
  const selectedMailbox =
    mailboxOptions.find((mailbox) => mailbox.id === selectedMailboxId) ?? mailboxOptions[0] ?? null
  const selectedTemplate =
    templateOptions.find((template) => template.id === selectedTemplateId) ?? templateOptions[0] ?? null

  const renderedSubject = renderMergeTags(
    selectedTemplate?.subject ?? "Quick note for {{first_name}} at {{company}}",
    selectedContact
  )
  const renderedBody = renderMergeTags(
    selectedTemplate?.body ??
      "Hi {{first_name}},\n\nI wanted to reach out regarding {{company}}.\n\nBest regards,\nEtapaHub",
    selectedContact
  )

  const workflowStates = [
    { label: "Not contacted", tone: "bg-muted text-muted-foreground border-border" },
    { label: "In sequence", tone: "bg-brand-pink/10 text-brand-pink border-brand-pink/20" },
    { label: "Replied", tone: "bg-info/10 text-info border-info/20" },
    { label: "Interested", tone: "bg-success/10 text-success border-success/20" },
    { label: "Not interested", tone: "bg-destructive/10 text-destructive border-destructive/20" },
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
              <BreadcrumbPage>Outreach Beta</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto p-6" data-testid="outreach-beta-page">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Card className="border-brand-pink/20 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_38%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_34%)]">
            <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full bg-brand-pink px-3 py-1 text-white hover:bg-brand-pink">Beta</Badge>
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    Client demo mockup
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight">Apollo-style Outreach Workspace</h1>
                  <p className="max-w-3xl text-sm text-muted-foreground">
                    Dedicated mockup for mailbox-connected 1:1 outreach, reply sync, thread visibility, deliverability controls and automatic sequences. This page is intentionally presentational so the client sees the product direction without mistaking it for a live integration.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border bg-background px-3 py-1">Google Workspace OAuth</span>
                  <span className="rounded-full border border-border bg-background px-3 py-1">Microsoft 365 OAuth</span>
                  <span className="rounded-full border border-border bg-background px-3 py-1">Thread sync</span>
                  <span className="rounded-full border border-border bg-background px-3 py-1">Sequences</span>
                  <span className="rounded-full border border-border bg-background px-3 py-1">Tracking + analytics</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedContact && (
                  <Button asChild>
                    <Link href="/contacts">Open Contacts</Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href="/templates">Open Templates</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/settings">Open Sender Identities</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-4">
            <Card>
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="rounded-xl bg-muted p-3">
                  <Inbox className="size-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Connected inboxes</p>
                  <p className="text-2xl font-semibold">{mailboxOptions.length}</p>
                  <p className="text-xs text-muted-foreground">Multi-account ready per CRM user with account-level send caps.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="rounded-xl bg-muted p-3">
                  <MessagesSquare className="size-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Thread visibility</p>
                  <p className="text-2xl font-semibold">2-way</p>
                  <p className="text-xs text-muted-foreground">Sent emails and replies shown in one contact timeline, Gmail-style.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="rounded-xl bg-muted p-3">
                  <Workflow className="size-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Sequence logic</p>
                  <p className="text-2xl font-semibold">Auto-stop</p>
                  <p className="text-xs text-muted-foreground">Stop on reply or when the contact becomes interested.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="rounded-xl bg-muted p-3">
                  <Shield className="size-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Compliance guardrails</p>
                  <p className="text-2xl font-semibold">Unsubscribe-safe</p>
                  <p className="text-xs text-muted-foreground">Automatic sequence stop when unsubscribed or manually blocked.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="size-5 text-brand-pink" />
                  1:1 Email Composer
                </CardTitle>
                <CardDescription>
                  Direct outreach from the contact record with connected mailbox, saved template and dynamic variables.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Contact</p>
                    <Select value={selectedContact?.id ?? ""} onValueChange={setSelectedContactId}>
                      <SelectTrigger className="w-full">
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
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">From</p>
                    <Select value={selectedMailbox?.id ?? ""} onValueChange={setSelectedMailboxId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select mailbox" />
                      </SelectTrigger>
                      <SelectContent>
                        {mailboxOptions.map((mailbox) => (
                          <SelectItem key={mailbox.id} value={mailbox.id}>
                            {mailbox.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Template</p>
                    <Select value={selectedTemplate?.id ?? ""} onValueChange={setSelectedTemplateId}>
                      <SelectTrigger className="w-full">
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
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">To</p>
                    <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm">
                      {selectedContact ? selectedContact.email : "No contact selected"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subject</p>
                  <div className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium">
                    {renderedSubject}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Body</p>
                  <div className="min-h-56 whitespace-pre-wrap rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground/90">
                    {renderedBody}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{"{{first_name}}"}</Badge>
                  <Badge variant="secondary">{"{{company}}"}</Badge>
                  <Badge variant="outline">{selectedTemplate?.format === "html" ? "HTML + plain fallback" : "Plain text"}</Badge>
                  <Badge variant="outline">Mailbox token vault</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessagesSquare className="size-5 text-brand-pink" />
                    Contact Communication Logic
                  </CardTitle>
                  <CardDescription>
                    This closes the main CRM gap: communication is now explicit, not inferred from scattered fields.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="font-medium">How EtapaHub marks an active conversation</p>
                    <div className="mt-3 space-y-2 text-muted-foreground">
                      <p><span className="font-medium text-foreground">Owner</span>: who from EtapaHub owns the relationship.</p>
                      <p><span className="font-medium text-foreground">Outreach status</span>: commercial state such as in communication, in sequence, replied or interested.</p>
                      <p><span className="font-medium text-foreground">Last reply</span>: concrete proof that the contact answered inside the thread.</p>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">Selected contact snapshot</p>
                      <Badge className="border-warning/20 bg-warning/10 text-warning hover:bg-warning/10">
                        {selectedContact?.outreachStatus?.replaceAll("_", " ") ?? "not contacted"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {selectedContact
                        ? `${selectedContact.firstName} ${selectedContact.lastName} at ${selectedContact.company}`
                        : "Pick a contact to preview the workflow state."}
                    </p>
                    <div className="grid gap-2 text-xs text-muted-foreground">
                      <p>Owner: {selectedContact?.ownerName ?? "Unassigned"}</p>
                      <p>Last reply: {selectedContact?.lastReplyAt ? new Date(selectedContact.lastReplyAt).toLocaleString() : "No reply tracked yet"}</p>
                      <p>Subscription: {selectedContact?.subscriptionStatus ?? "n/a"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MailCheck className="size-5 text-brand-pink" />
                    Thread Preview
                  </CardTitle>
                  <CardDescription>
                    Unified outbound and inbound conversation panel inside the contact record.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-2xl bg-brand-pink/10 p-3">
                    <p className="font-medium">EtapaHub</p>
                    <p className="mt-1 text-muted-foreground">Initial email sent from {selectedMailbox?.label ?? "connected mailbox"}.</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">sent</Badge>
                      <Badge variant="outline">opened</Badge>
                      <Badge variant="outline">clicked</Badge>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-3">
                    <p className="font-medium">{selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : "Contact"}</p>
                    <p className="mt-1 text-muted-foreground">Reply synced from Gmail / Outlook API and matched back to the CRM thread.</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">replied</Badge>
                      <Badge variant="outline">thread matched</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="size-5 text-brand-pink" />
                  Sequences Core
                </CardTitle>
                <CardDescription>
                  Email-first automation with manual tasks and stop conditions tied to real reply signals.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <BadgeCheck className="size-4 text-success" />
                    Step 1
                  </div>
                  <p className="mt-3 text-sm">Initial outreach email</p>
                  <p className="mt-1 text-xs text-muted-foreground">Send immediately from a connected mailbox with tracking enabled.</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock3 className="size-4 text-warning" />
                    Step 2
                  </div>
                  <p className="mt-3 text-sm">Follow-up after +2 days</p>
                  <p className="mt-1 text-xs text-muted-foreground">Skip automatically if the contact replied or is marked interested.</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="size-4 text-info" />
                    Step 3
                  </div>
                  <p className="mt-3 text-sm">Manual call / task</p>
                  <p className="mt-1 text-xs text-muted-foreground">Creates seller work instead of sending another email when human follow-up is better.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="size-5 text-brand-pink" />
                  Contact State Model
                </CardTitle>
                <CardDescription>
                  The workflow states the client asked for, visible directly inside CRM contact management.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {workflowStates.map((state) => (
                  <Badge key={state.label} variant="outline" className={state.tone}>
                    {state.label}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="size-5 text-brand-pink" />
                  Tracking
                </CardTitle>
                <CardDescription>
                  Open pixel, click redirect tracking and message status progression.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Statuses: sent, delivered, opened, clicked, replied, bounced.</p>
                <p>Reply sync updates the thread and the contact state automatically.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5 text-brand-pink" />
                  Deliverability
                </CardTitle>
                <CardDescription>
                  Guardrails per mailbox to stay inside safe sending behavior.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Daily cap: {selectedMailbox?.dailyLimit ?? "30-50/day"}</p>
                <p>Randomized delay between sends and optional warm-up policy for new inboxes.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-5 text-brand-pink" />
                  Analytics
                </CardTitle>
                <CardDescription>
                  Simple performance layer per sequence and mailbox.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Open rate, click rate, reply rate and sequence-level performance rollups.</p>
                <p>Automatic unsubscribe stop if a contact is marked unsubscribed.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}

export default function OutreachBetaPage() {
  return (
    <Suspense fallback={<main className="flex-1 p-6" />}>
      <OutreachBetaPageContent />
    </Suspense>
  )
}
