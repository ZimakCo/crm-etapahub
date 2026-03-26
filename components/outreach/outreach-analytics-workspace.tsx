"use client"

import { BarChart3, Shield } from "lucide-react"
import { useOutreachConversations, useOutreachMailboxes, useOutreachSequences, useOutreachTasks } from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatConnectionStatus, formatMailboxProvider, formatSendingHealth, formatSequenceStatus } from "@/components/outreach/outreach-utils"

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
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Open rate</p>
            <p className="mt-3 text-3xl font-semibold">{openRate}%</p>
            <p className="mt-2 text-sm text-muted-foreground">Across seller sequences and personal inbox sends.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Reply rate</p>
            <p className="mt-3 text-3xl font-semibold">{replyRate}%</p>
            <p className="mt-2 text-sm text-muted-foreground">Threads progressing into active seller communication.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Click rate</p>
            <p className="mt-3 text-3xl font-semibold">{clickRate}%</p>
            <p className="mt-2 text-sm text-muted-foreground">Tracked engagement from seller-owned links in 1:1 motion.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Open tasks</p>
            <p className="mt-3 text-3xl font-semibold">{tasks.filter((task) => task.status === "open").length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Manual work still pending after inbox events and stop rules.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
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
              <div key={mailbox.id} className="rounded-2xl border border-border p-4">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5 text-muted-foreground" />
                Sequence performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sequences.map((sequence) => (
                <div key={sequence.id} className="rounded-2xl border border-border p-4 text-sm text-muted-foreground">
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

          <Card>
            <CardHeader>
              <CardTitle>Pipeline signals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Replied threads: <span className="text-foreground">{repliedThreads}</span></p>
              <p>Bounced conversations: <span className="text-foreground">{conversations.filter((conversation) => conversation.lastEvent === "bounced").length}</span></p>
              <p>Mailboxes needing attention: <span className="text-foreground">{mailboxes.filter((mailbox) => mailbox.connectionStatus === "attention").length}</span></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
