"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Inbox, MailOpen, Search, Send, Users } from "lucide-react"
import {
  useContact,
  useContactsPage,
  useOutreachConversations,
  useOutreachMailboxes,
  useOutreachSequences,
  useOutreachTemplates,
} from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  formatConnectionStatus,
  formatConversationStatus,
  formatMailboxProvider,
  formatSendingHealth,
  formatShortDate,
  renderMergeTags,
} from "@/components/outreach/outreach-utils"

export function OutreachEmailsWorkspace() {
  const searchParams = useSearchParams()
  const initialContactId = searchParams.get("contactId") ?? ""
  const initialConversationId = searchParams.get("conversationId") ?? ""

  const { result: contactsResult } = useContactsPage({
    page: 1,
    pageSize: 100,
    sort: { field: "lastActivityAt", direction: "desc" },
  })
  const { contact: linkedContact } = useContact(initialContactId || null)
  const { conversations } = useOutreachConversations()
  const { mailboxes } = useOutreachMailboxes()
  const { templates } = useOutreachTemplates()
  const { sequences } = useOutreachSequences()

  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedConversationId, setSelectedConversationId] = useState(initialConversationId)
  const [selectedMailboxId, setSelectedMailboxId] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState("")

  const spotlightConversation = useMemo(() => {
    if (!linkedContact) {
      return null
    }

    return {
      id: `linked-contact-${linkedContact.id}`,
      contactId: linkedContact.id,
      contactName: `${linkedContact.firstName} ${linkedContact.lastName}`,
      company: linkedContact.company,
      ownerName: linkedContact.ownerName ?? "EtapaHub seller",
      mailboxId: mailboxes[0]?.id ?? "",
      sequenceId: undefined,
      sequenceName: undefined,
      status: "active" as const,
      lastEvent: linkedContact.lastReplyAt ? ("replied" as const) : ("sent" as const),
      lastActivityAt: linkedContact.lastReplyAt ?? linkedContact.lastActivityAt,
      unreadCount: linkedContact.lastReplyAt ? 1 : 0,
      preview: linkedContact.lastReplyAt
        ? "Latest reply from the linked contact is already visible here."
        : "Direct seller thread opened from the contact record.",
      messages: [
        {
          id: `linked-contact-message-${linkedContact.id}`,
          direction: "system" as const,
          subject: `Linked from contact record: ${linkedContact.firstName} ${linkedContact.lastName}`,
          body: "Use this seller workspace to continue the conversation, enroll the contact into a seller sequence, or create a manual follow-up task.",
          event: linkedContact.lastReplyAt ? ("replied" as const) : ("sent" as const),
          sentAt: linkedContact.lastReplyAt ?? linkedContact.lastActivityAt,
        },
      ],
      createdAt: linkedContact.createdAt,
      updatedAt: linkedContact.updatedAt,
    }
  }, [linkedContact, mailboxes])

  const filteredConversations = useMemo(() => {
    const source = spotlightConversation
      ? [spotlightConversation, ...conversations.filter((item) => item.contactId !== spotlightConversation.contactId)]
      : conversations

    return source.filter((conversation) => {
      const query = searchValue.trim().toLowerCase()
      const matchesQuery =
        query.length === 0 ||
        conversation.contactName.toLowerCase().includes(query) ||
        conversation.company.toLowerCase().includes(query) ||
        conversation.preview.toLowerCase().includes(query)
      const matchesStatus = statusFilter === "all" || conversation.status === statusFilter

      return matchesQuery && matchesStatus
    })
  }, [conversations, searchValue, spotlightConversation, statusFilter])

  const selectedConversation =
    filteredConversations.find((conversation) => conversation.id === selectedConversationId || conversation.id === initialConversationId) ??
    filteredConversations[0] ??
    spotlightConversation ??
    null

  const selectedMailbox =
    mailboxes.find((mailbox) => mailbox.id === selectedMailboxId) ??
    mailboxes.find((mailbox) => mailbox.id === selectedConversation?.mailboxId) ??
    mailboxes[0] ??
    null

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ?? templates[0] ?? null

  const selectedContact =
    (selectedConversation?.contactId
      ? contactsResult.contacts.find((contact) => contact.id === selectedConversation.contactId)
      : undefined) ?? linkedContact ?? null

  const tokenContact = selectedContact
    ? { firstName: selectedContact.firstName, company: selectedContact.company }
    : selectedConversation
      ? { firstName: selectedConversation.contactName.split(" ")[0] ?? "there", company: selectedConversation.company }
      : null

  const renderedSubject = renderMergeTags(
    selectedTemplate?.subject ?? "Quick intro for {{first_name}} at {{company}}",
    tokenContact
  )
  const renderedBody = renderMergeTags(
    selectedTemplate?.plainTextBody ?? "Hi {{first_name}},\n\nI wanted to follow up regarding {{company}}.\n\nBest regards,\nEtapaHub",
    tokenContact
  )

  const replyCount = filteredConversations.filter((conversation) => conversation.lastEvent === "replied").length
  const activeSequenceCount = sequences.filter((sequence) => sequence.status === "active").length
  const healthyMailboxCount = mailboxes.filter((mailbox) => mailbox.sendingHealth === "healthy").length

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Active threads</p>
            <p className="mt-3 text-3xl font-semibold">{filteredConversations.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Seller conversations currently visible in the workspace.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Replies synced</p>
            <p className="mt-3 text-3xl font-semibold">{replyCount}</p>
            <p className="mt-2 text-sm text-muted-foreground">Threads that already moved from outbound into two-way communication.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Healthy inboxes</p>
            <p className="mt-3 text-3xl font-semibold">{healthyMailboxCount}</p>
            <p className="mt-2 text-sm text-muted-foreground">Mailboxes with stable health inside the seller-only sending stack.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Active sequences</p>
            <p className="mt-3 text-3xl font-semibold">{activeSequenceCount}</p>
            <p className="mt-2 text-sm text-muted-foreground">Seller sequences available for enrollment without touching broadcast infrastructure.</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <Select value={selectedMailbox?.id ?? "all"} onValueChange={setSelectedMailboxId}>
            <SelectTrigger className="w-full lg:w-[280px]">
              <SelectValue placeholder="All personal inboxes" />
            </SelectTrigger>
            <SelectContent>
              {mailboxes.map((mailbox) => (
                <SelectItem key={mailbox.id} value={mailbox.id}>
                  {mailbox.displayName} · {mailbox.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-[220px]">
              <SelectValue placeholder="All thread states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All thread states</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="needs_reply">Needs reply</SelectItem>
              <SelectItem value="bounced">Bounced</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search seller emails"
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/outreach/sequences">Add contacts to sequence</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/outreach/settings">Manage inboxes</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="size-5 text-muted-foreground" />
              Email workspace
            </CardTitle>
            <CardDescription>
              Unified seller queue for replies, waiting threads and bounce exceptions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredConversations.map((conversation) => (
              <button
                type="button"
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${selectedConversation?.id === conversation.id ? "border-foreground bg-muted/40" : "border-border hover:bg-muted/20"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{conversation.contactName}</p>
                    <p className="text-sm text-muted-foreground">{conversation.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {conversation.unreadCount > 0 ? (
                      <Badge variant="secondary">{conversation.unreadCount} new</Badge>
                    ) : null}
                    <Badge variant="outline">{formatConversationStatus(conversation.status)}</Badge>
                  </div>
                </div>
                <p className="mt-3 text-sm text-foreground">{conversation.preview}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{conversation.ownerName}</span>
                  <span>•</span>
                  <span>{conversation.sequenceName ?? "Direct 1:1"}</span>
                  <span>•</span>
                  <span>{formatShortDate(conversation.lastActivityAt)}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MailOpen className="size-5 text-muted-foreground" />
                Conversation thread
              </CardTitle>
              <CardDescription>
                Direct inbox-style history for the selected seller thread.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedConversation ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border p-4">
                    <div>
                      <p className="font-medium text-foreground">{selectedConversation.contactName}</p>
                      <p className="text-sm text-muted-foreground">{selectedConversation.company}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{formatConversationStatus(selectedConversation.status)}</Badge>
                      {selectedConversation.sequenceName ? <Badge variant="secondary">{selectedConversation.sequenceName}</Badge> : null}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`rounded-2xl border px-4 py-3 ${message.direction === "outbound" ? "border-border bg-muted/50" : message.direction === "inbound" ? "border-success/20 bg-success/5" : "border-dashed border-border bg-card"}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          <p className="font-medium text-foreground">{message.subject}</p>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {message.event ? <Badge variant="outline">{message.event}</Badge> : null}
                            <span>{formatShortDate(message.sentAt)}</span>
                          </div>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{message.body}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No seller thread selected yet.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="size-5 text-muted-foreground" />
                  1:1 email composer
                </CardTitle>
                <CardDescription>
                  Seller send preview with mailbox selection, template merge tags and plain text fallback.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Select value={selectedMailbox?.id ?? ""} onValueChange={setSelectedMailboxId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select seller mailbox" />
                      </SelectTrigger>
                      <SelectContent>
                        {mailboxes.map((mailbox) => (
                          <SelectItem key={mailbox.id} value={mailbox.id}>
                            {mailbox.displayName} · {mailbox.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select value={selectedTemplate?.id ?? ""} onValueChange={setSelectedTemplateId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select seller template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>To</Label>
                  <Input value={selectedContact?.email ?? `${selectedConversation?.contactName ?? "contact"} <external>`} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={renderedSubject} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Body</Label>
                  <Textarea value={renderedBody} readOnly rows={10} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{"{{first_name}}"}</Badge>
                  <Badge variant="secondary">{"{{company}}"}</Badge>
                  {selectedTemplate ? <Badge variant="outline">{selectedTemplate.category}</Badge> : null}
                  <Badge variant="outline">HTML + plain fallback</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-muted-foreground" />
                  Mailbox and contact context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                {selectedMailbox ? (
                  <div className="rounded-2xl border border-border p-4">
                    <p className="font-medium text-foreground">{selectedMailbox.displayName}</p>
                    <p className="mt-1">{selectedMailbox.email}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className={formatConnectionStatus(selectedMailbox.connectionStatus).tone}>
                        {formatConnectionStatus(selectedMailbox.connectionStatus).label}
                      </Badge>
                      <Badge variant="outline" className={formatSendingHealth(selectedMailbox.sendingHealth).tone}>
                        {formatSendingHealth(selectedMailbox.sendingHealth).label}
                      </Badge>
                      <Badge variant="outline">{formatMailboxProvider(selectedMailbox.provider)}</Badge>
                    </div>
                    <p className="mt-3">Daily limit: <span className="text-foreground">{selectedMailbox.dailyLimit}</span></p>
                  </div>
                ) : null}

                <div className="rounded-2xl border border-border p-4">
                  <p className="font-medium text-foreground">Sequence sender logic</p>
                  <p className="mt-2">
                    Contacts pick the seller mailbox when they are added to a sequence. The sequence defines steps and stop rules, but it does not own the mailbox itself.
                  </p>
                </div>

                <div className="rounded-2xl border border-border p-4">
                  <p className="font-medium text-foreground">Linked contact state</p>
                  <p className="mt-2">Owner: <span className="text-foreground">{selectedContact?.ownerName ?? selectedConversation?.ownerName ?? "EtapaHub seller"}</span></p>
                  <p className="mt-1">Outreach status: <span className="text-foreground">{selectedContact?.outreachStatus?.replaceAll("_", " ") ?? "in communication"}</span></p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/outreach/tasks">Open tasks</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/contacts">Open contacts</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
