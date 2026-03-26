"use client"

import { useState } from "react"
import { AlertTriangle, BarChart3, MailOpen, MessageSquareReply, Shield, SquareMousePointer, Wrench } from "lucide-react"
import { useOutreachConversations, useOutreachMailboxes, useOutreachSequences, useOutreachTasks } from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatConnectionStatus, formatMailboxProvider, formatSendingHealth, formatSequenceStatus } from "@/components/outreach/outreach-utils"

type AnalyticsViewKey = "overview" | "mailboxes" | "sequences" | "pipeline"

export function OutreachAnalyticsWorkspace() {
  const { conversations } = useOutreachConversations()
  const { mailboxes } = useOutreachMailboxes()
  const { sequences } = useOutreachSequences()
  const { tasks } = useOutreachTasks()

  const [activeView, setActiveView] = useState<AnalyticsViewKey>("overview")

  const openRate = sequences.length === 0 ? 0 : Math.round(sequences.reduce((sum, sequence) => sum + sequence.openRate, 0) / sequences.length)
  const replyRate = sequences.length === 0 ? 0 : Math.round(sequences.reduce((sum, sequence) => sum + sequence.replyRate, 0) / sequences.length)
  const clickRate = Math.round((conversations.filter((conversation) => conversation.lastEvent === "clicked").length / Math.max(conversations.length, 1)) * 100)
  const repliedThreads = conversations.filter((conversation) => conversation.lastEvent === "replied").length
  const openTasks = tasks.filter((task) => task.status === "open").length
  const bouncedThreads = conversations.filter((conversation) => conversation.lastEvent === "bounced").length
  const attentionMailboxes = mailboxes.filter((mailbox) => mailbox.connectionStatus === "attention").length

  const analyticsViews = [
    { key: "overview" as const, label: "Overview" },
    { key: "mailboxes" as const, label: "Mailboxes" },
    { key: "sequences" as const, label: "Sequences" },
    { key: "pipeline" as const, label: "Pipeline" },
  ]

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border bg-background shadow-sm">
        <div className="flex min-w-max items-center gap-6 overflow-x-auto border-b px-4">
          {analyticsViews.map((view) => (
            <button
              type="button"
              key={view.key}
              onClick={() => setActiveView(view.key)}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                activeView === view.key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{view.label}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-3 border-b p-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border bg-muted/10 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MailOpen className="size-4" />
              <span className="text-sm font-medium">Open rate</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-foreground">{openRate}%</p>
          </div>
          <div className="rounded-2xl border bg-muted/10 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquareReply className="size-4" />
              <span className="text-sm font-medium">Reply rate</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-foreground">{replyRate}%</p>
          </div>
          <div className="rounded-2xl border bg-muted/10 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <SquareMousePointer className="size-4" />
              <span className="text-sm font-medium">Click rate</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-foreground">{clickRate}%</p>
          </div>
          <div className="rounded-2xl border bg-muted/10 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wrench className="size-4" />
              <span className="text-sm font-medium">Open tasks</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-foreground">{openTasks}</p>
          </div>
          <div className="rounded-2xl border bg-muted/10 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="size-4" />
              <span className="text-sm font-medium">Attention</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-foreground">{attentionMailboxes}</p>
          </div>
        </div>

        <div className="grid gap-5 p-4 xl:grid-cols-[1.05fr_0.95fr]">
          {(activeView === "overview" || activeView === "mailboxes") ? (
            <section className="rounded-2xl border bg-background shadow-sm">
              <div className="border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <Shield className="size-5 text-muted-foreground" />
                  <p className="font-medium text-foreground">Mailbox health and readiness</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Personal seller mailboxes monitored independently from campaign infrastructure.</p>
              </div>

              <div className="hidden grid-cols-[minmax(0,1fr)_140px_140px_110px] gap-4 border-b bg-muted/25 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:grid">
                <span>Mailbox</span>
                <span>Provider</span>
                <span>Connection</span>
                <span>Health</span>
              </div>

              <div>
                {mailboxes.map((mailbox) => (
                  <div key={mailbox.id} className="grid gap-3 border-b px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_140px_140px_110px] lg:items-center lg:gap-4">
                    <div>
                      <p className="font-medium text-foreground">{mailbox.displayName}</p>
                      <p className="text-sm text-muted-foreground">{mailbox.email}</p>
                    </div>
                    <div>
                      <Badge variant="outline">{formatMailboxProvider(mailbox.provider)}</Badge>
                    </div>
                    <div>
                      <Badge variant="outline" className={formatConnectionStatus(mailbox.connectionStatus).tone}>
                        {formatConnectionStatus(mailbox.connectionStatus).label}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant="outline" className={formatSendingHealth(mailbox.sendingHealth).tone}>
                        {formatSendingHealth(mailbox.sendingHealth).label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {(activeView === "overview" || activeView === "sequences") ? (
            <section className="rounded-2xl border bg-background shadow-sm">
              <div className="border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-muted-foreground" />
                  <p className="font-medium text-foreground">Sequence performance</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Performance signals for seller-owned 1:1 sequences.</p>
              </div>

              <div className="hidden grid-cols-[minmax(0,1fr)_110px_110px_90px] gap-4 border-b bg-muted/25 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:grid">
                <span>Sequence</span>
                <span>Open</span>
                <span>Reply</span>
                <span>Active</span>
              </div>

              <div>
                {sequences.map((sequence) => (
                  <div key={sequence.id} className="grid gap-3 border-b px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_110px_110px_90px] lg:items-center lg:gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{sequence.name}</p>
                        <Badge variant="outline">{formatSequenceStatus(sequence.status)}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{sequence.ownerName}</p>
                    </div>
                    <div className="text-sm text-foreground">{sequence.openRate}%</div>
                    <div className="text-sm text-foreground">{sequence.replyRate}%</div>
                    <div className="text-sm text-foreground">{sequence.activeContacts}</div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {(activeView === "overview" || activeView === "pipeline") ? (
            <section className="rounded-2xl border bg-background p-4 shadow-sm xl:col-span-full">
              <p className="font-medium text-foreground">Pipeline signals</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
                <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                  <p>Replied threads</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{repliedThreads}</p>
                </div>
                <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                  <p>Bounced conversations</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{bouncedThreads}</p>
                </div>
                <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                  <p>Mailboxes needing attention</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{attentionMailboxes}</p>
                </div>
                <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                  <p>Sequences live</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{sequences.filter((sequence) => sequence.status === "active").length}</p>
                </div>
                <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                  <p>Tasks pending</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{openTasks}</p>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
