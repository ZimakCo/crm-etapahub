"use client"

import { LockKeyhole, Mail, RefreshCw, Shield, UserRound } from "lucide-react"
import { useOutreachMailboxes } from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatConnectionStatus, formatMailboxProvider, formatSendingHealth } from "@/components/outreach/outreach-utils"

export function OutreachSettingsWorkspace() {
  const { mailboxes } = useOutreachMailboxes()

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-rose-200/80 bg-[linear-gradient(180deg,rgba(255,241,242,0.82),rgba(255,255,255,0.96))]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-5 text-muted-foreground" />
            Connected inbox roster
          </CardTitle>
          <CardDescription>
            Each CRM user connects their own Google Workspace, Outlook or Microsoft 365 inbox here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mailboxes.map((mailbox) => (
            <div key={mailbox.id} className="rounded-2xl border border-rose-200/70 bg-white/80 p-4 shadow-sm">
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
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                <p>Owner: <span className="text-foreground">{mailbox.ownerName}</span></p>
                <p>Owner email: <span className="text-foreground">{mailbox.ownerEmail ?? mailbox.email}</span></p>
                <p>Last sync: <span className="text-foreground">{mailbox.lastSyncAt ? new Date(mailbox.lastSyncAt).toLocaleString("en-US") : "Not synced yet"}</span></p>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100">Connect Google Workspace</Button>
            <Button variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100">Connect Microsoft 365</Button>
            <Button variant="outline" className="border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100">Connect Outlook</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.82),rgba(255,255,255,0.96))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole className="size-5 text-muted-foreground" />
              Token vault
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>OAuth access token + refresh token storage belongs on the server side, not in the browser.</p>
            <p>Each mailbox should be owned by one CRM user with explicit reconnect and revoke state.</p>
            <p>Multi-account support is valid as long as ownership remains clear.</p>
          </CardContent>
        </Card>

        <Card className="border-sky-200/80 bg-[linear-gradient(180deg,rgba(240,249,255,0.82),rgba(255,255,255,0.96))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="size-5 text-muted-foreground" />
              Reply sync
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Inbox API read access for Gmail / Outlook / Microsoft 365.</p>
            <p>Thread matching back to the CRM contact and seller owner.</p>
            <p>Conversation history inside seller outreach, not inside the campaign module.</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/80 bg-[linear-gradient(180deg,rgba(236,253,245,0.82),rgba(255,255,255,0.96))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5 text-muted-foreground" />
              Boundary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Campaign sender identities do not belong here.</p>
            <p>Broadcast domains and warmup tooling do not belong here.</p>
            <p>Only seller-owned 1:1 outreach mailboxes belong in this module.</p>
          </CardContent>
        </Card>

        <Card className="border-violet-200/80 bg-[linear-gradient(180deg,rgba(245,243,255,0.82),rgba(255,255,255,0.96))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-5 text-muted-foreground" />
              Next production step
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Server-side OAuth callback flow.</p>
            <p>Encrypted token storage and rotation state.</p>
            <p>User-level ownership and RLS before browser writes are allowed.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
