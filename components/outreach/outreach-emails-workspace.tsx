"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Inbox, MailOpen, Search, Send, SlidersHorizontal, Users } from "lucide-react"
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
import { cn } from "@/lib/utils"

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
  const [showFilters, setShowFilters] = useState(true)
  const [selectedConversationId, setSelectedConversationId] = useState(initialConversationId)
  const [mailboxFilterId, setMailboxFilterId] = useState("all")
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
      const matchesMailbox = mailboxFilterId === "all" || conversation.mailboxId === mailboxFilterId

      return matchesQuery && matchesStatus && matchesMailbox
    })
  }, [conversations, mailboxFilterId, searchValue, spotlightConversation, statusFilter])

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
  const emailViews = [
    { key: "all" as const, label: "All emails", count: conversations.length + (spotlightConversation ? 1 : 0) },
    { key: "active" as const, label: "Active", count: conversations.filter((conversation) => conversation.status === "active").length },
    { key: "waiting" as const, label: "Waiting", count: conversations.filter((conversation) => conversation.status === "waiting").length },
    {
      key: "needs_reply" as const,
      label: "Needs reply",
      count: conversations.filter((conversation) => conversation.status === "needs_reply").length,
    },
    { key: "bounced" as const, label: "Bounced", count: conversations.filter((conversation) => conversation.status === "bounced").length },
  ]
  const activeFilterCount = [mailboxFilterId !== "all", searchValue.trim().length > 0].filter(Boolean).length

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border bg-background shadow-sm">
        <div className="flex min-w-max items-center gap-6 overflow-x-auto border-b px-4">
          {emailViews.map((view) => (
            <button
              type="button"
              key={view.key}
              onClick={() => setStatusFilter(view.key)}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                statusFilter === view.key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{view.label}</span>
              <span className="text-xs text-muted-foreground">{view.count}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <Button variant="outline" size="sm" onClick={() => setShowFilters((value) => !value)}>
              <SlidersHorizontal className="size-4" />
              Show filters
              {activeFilterCount > 0 ? <Badge variant="secondary" className="ml-1 rounded-full px-2 py-0">{activeFilterCount}</Badge> : null}
            </Button>

            <div className="relative flex-1 lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search emails"
                className="pl-9"
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredConversations.length} thread{filteredConversations.length === 1 ? "" : "s"}
          </div>
        </div>

        {showFilters ? (
          <div className="flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={mailboxFilterId} onValueChange={setMailboxFilterId}>
                <SelectTrigger className="w-full lg:w-[260px]">
                  <SelectValue placeholder="All inboxes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All inboxes</SelectItem>
                  {mailboxes.map((mailbox) => (
                    <SelectItem key={mailbox.id} value={mailbox.id}>
                      {mailbox.displayName} · {mailbox.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">Replies synced {replyCount}</Badge>
              <Badge variant="outline">Healthy inboxes {healthyMailboxCount}</Badge>
              <Badge variant="outline">Active sequences {activeSequenceCount}</Badge>
            </div>
          </div>
        ) : null}

        <div className="grid xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="border-b xl:border-b-0 xl:border-r">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Email workspace</p>
                <p className="text-xs text-muted-foreground">Replies, waiting threads and bounce exceptions.</p>
              </div>
              <Badge variant="outline">{filteredConversations.length}</Badge>
            </div>

            <div className="max-h-[860px] overflow-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <button
                    type="button"
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={cn(
                      "w-full border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/35",
                      selectedConversation?.id === conversation.id && "bg-muted/45"
                    )}
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
                    <p className="mt-2 text-sm text-foreground">{conversation.preview}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{conversation.ownerName}</span>
                      <span>•</span>
                      <span>{conversation.sequenceName ?? "Direct 1:1"}</span>
                      <span>•</span>
                      <span>{formatShortDate(conversation.lastActivityAt)}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-sm text-muted-foreground">No conversations match the current filters.</div>
              )}
            </div>
          </div>

          <div className="grid gap-5 p-4 2xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <section className="rounded-2xl border bg-background shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <MailOpen className="size-5 text-muted-foreground" />
                      <p className="font-medium text-foreground">Conversation thread</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Direct inbox-style history for the selected seller thread.</p>
                  </div>
                  {selectedConversation ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{formatConversationStatus(selectedConversation.status)}</Badge>
                      {selectedConversation.sequenceName ? <Badge variant="secondary">{selectedConversation.sequenceName}</Badge> : null}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4 p-4">
                  {selectedConversation ? (
                    <>
                      <div className="rounded-2xl border bg-muted/15 p-4">
                        <p className="font-medium text-foreground">{selectedConversation.contactName}</p>
                        <p className="text-sm text-muted-foreground">{selectedConversation.company}</p>
                      </div>

                      <div className="space-y-3">
                        {selectedConversation.messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "rounded-2xl border px-4 py-3 text-sm",
                              message.direction === "outbound" && "bg-muted/20",
                              message.direction === "inbound" && "border-emerald-200/60 bg-emerald-50/50",
                              message.direction === "system" && "border-dashed border-amber-200/60 bg-amber-50/40"
                            )}
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
                </div>
              </section>

              <section className="rounded-2xl border bg-background shadow-sm">
                <div className="border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Send className="size-5 text-muted-foreground" />
                    <p className="font-medium text-foreground">1:1 email composer</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Mailbox selection, template merge tags and plain text fallback.</p>
                </div>

                <div className="space-y-4 p-4">
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
                </div>
              </section>
            </div>

            <section className="space-y-4 rounded-2xl border bg-background p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-muted-foreground" />
                <p className="font-medium text-foreground">Mailbox and contact context</p>
              </div>

              {selectedMailbox ? (
                <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
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

              <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Sequence sender logic</p>
                <p className="mt-2">
                  Mailbox selection happens when contacts are added to a sequence. The sequence defines steps and stop rules, but it does not own the mailbox identity.
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
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

              <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Inbox className="size-4" />
                  <p className="font-medium text-foreground">Workspace snapshot</p>
                </div>
                <div className="mt-3 grid gap-2">
                  <p>Active threads: <span className="text-foreground">{filteredConversations.length}</span></p>
                  <p>Replies synced: <span className="text-foreground">{replyCount}</span></p>
                  <p>Healthy inboxes: <span className="text-foreground">{healthyMailboxCount}</span></p>
                  <p>Available sequences: <span className="text-foreground">{activeSequenceCount}</span></p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
