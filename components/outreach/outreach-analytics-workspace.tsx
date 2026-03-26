"use client"

import { AlertTriangle, BarChart3, MailOpen, MessageSquareReply, Shield, SquareMousePointer, Wrench } from "lucide-react"
import { useOutreachConversations, useOutreachMailboxes, useOutreachSequences, useOutreachTasks } from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatConnectionStatus, formatMailboxProvider, formatSendingHealth, formatSequenceStatus } from "@/components/outreach/outreach-utils"
import { OutreachMetricCard } from "@/components/outreach/outreach-metric-card"

export function OutreachAnalyticsWorkspace() {
  const { conversations } = useOutreachConversations()
  const { mailboxes } = useOutreachMailboxes()
  const { sequences } = useOutreachSequences()
  const { tasks } = useOutreachTasks()

  const openRate = sequences.length === 0 ? 0 : Math.round(sequences.reduce((sum, sequence) => sum + sequence.openRate, 0) / sequences.length)
  const replyRate = sequences.length === 0 ? 0 : Math.round(sequences.reduce((sum, sequence) => sum + sequence.replyRate, 0) / sequences.length)
  const clickRate = Math.round((conversations.filter((conversation) => conversation.lastEvent === "clicked").length / Math.max(conversations.length, 1)) * 100)
  const repliedThreads = conversations.filter((conversation) => conversation.lastEvent === "replied").length

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OutreachMetricCard
          title="Open rate"
          value={`${openRate}%`}
          description="Across seller sequences and personal inbox sends."
          icon={MailOpen}
          toneClassName="border-violet-200/80 bg-violet-50/80"
        />
        <OutreachMetricCard
          title="Reply rate"
          value={`${replyRate}%`}
          description="Threads progressing into active seller communication."
          icon={MessageSquareReply}
          toneClassName="border-emerald-200/80 bg-emerald-50/80"
        />
        <OutreachMetricCard
          title="Click rate"
          value={`${clickRate}%`}
          description="Tracked engagement from seller-owned links in 1:1 motion."
          icon={SquareMousePointer}
          toneClassName="border-sky-200/80 bg-sky-50/80"
        />
        <OutreachMetricCard
          title="Open tasks"
          value={tasks.filter((task) => task.status === "open").length}
          description="Manual work still pending after inbox events and stop rules."
          icon={Wrench}
          toneClassName="border-amber-200/80 bg-amber-50/80"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-violet-200/80 bg-[linear-gradient(180deg,rgba(245,243,255,0.82),rgba(255,255,255,0.96))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5 text-muted-foreground" />
              Mailbox health and readiness
            </CardTitle>
            <CardDescription>
              Personal mailbox state belongs to seller outreach and should be monitored separately from campaign infrastructure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mailboxes.map((mailbox) => (
              <div key={mailbox.id} className="rounded-2xl border border-violet-200/70 bg-white/80 p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{mailbox.displayName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{mailbox.email}</p>
                  </div>
                  <Badge variant="outline">{formatMailboxProvider(mailbox.provider)}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className={formatConnectionStatus(mailbox.connectionStatus).tone}>
                    {formatConnectionStatus(mailbox.connectionStatus).label}
                  </Badge>
                  <Badge variant="outline" className={formatSendingHealth(mailbox.sendingHealth).tone}>
                    {formatSendingHealth(mailbox.sendingHealth).label}
                  </Badge>
                  <Badge variant="outline">{mailbox.dailyLimit}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-sky-200/80 bg-[linear-gradient(180deg,rgba(240,249,255,0.82),rgba(255,255,255,0.96))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5 text-muted-foreground" />
                Sequence performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sequences.map((sequence) => (
                <div key={sequence.id} className="rounded-2xl border border-sky-200/70 bg-white/80 p-4 text-sm text-muted-foreground shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{sequence.name}</p>
                    <Badge variant="outline">{formatSequenceStatus(sequence.status)}</Badge>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <p>Open rate: <span className="text-foreground">{sequence.openRate}%</span></p>
                    <p>Reply rate: <span className="text-foreground">{sequence.replyRate}%</span></p>
                    <p>Active: <span className="text-foreground">{sequence.activeContacts}</span></p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-rose-200/80 bg-[linear-gradient(180deg,rgba(255,241,242,0.82),rgba(255,255,255,0.96))]">
            <CardHeader>
              <CardTitle>Pipeline signals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Replied threads: <span className="text-foreground">{repliedThreads}</span></p>
              <p className="flex items-center gap-2"><AlertTriangle className="size-4 text-rose-600" />Bounced conversations: <span className="text-foreground">{conversations.filter((conversation) => conversation.lastEvent === "bounced").length}</span></p>
              <p>Mailboxes needing attention: <span className="text-foreground">{mailboxes.filter((mailbox) => mailbox.connectionStatus === "attention").length}</span></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
