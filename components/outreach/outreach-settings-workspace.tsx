"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { LockKeyhole, Mail, RefreshCw, Shield, UserRound } from "lucide-react"
import { toast } from "sonner"
import { useSWRConfig } from "swr"
import {
  createOutreachMailbox,
  updateOutreachMailbox,
} from "@/lib/outreach-repository"
import { useOutreachConversations, useOutreachMailboxes, useOutreachTasks } from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useOutreachRouteState } from "@/components/outreach/use-outreach-route-state"
import { formatConnectionStatus, formatMailboxProvider, formatSendingHealth } from "@/components/outreach/outreach-utils"
import type { OutreachMailbox } from "@/lib/types"

type MailboxFormState = {
  ownerName: string
  ownerEmail: string
  provider: OutreachMailbox["provider"]
  email: string
  displayName: string
  connectionStatus: OutreachMailbox["connectionStatus"]
  sendingHealth: OutreachMailbox["sendingHealth"]
  dailyLimit: string
}

const EMPTY_MAILBOX_FORM: MailboxFormState = {
  ownerName: "",
  ownerEmail: "",
  provider: "google_workspace",
  email: "",
  displayName: "",
  connectionStatus: "paused",
  sendingHealth: "paused",
  dailyLimit: "25",
}

export function OutreachSettingsWorkspace() {
  const { mutate } = useSWRConfig()
  const { searchParams, setParams } = useOutreachRouteState()
  const mailboxIdParam = searchParams.get("mailboxId") ?? ""
  const newMailboxParam = searchParams.get("newMailbox") === "1"
  const providerParam = searchParams.get("provider") as OutreachMailbox["provider"] | null

  const { mailboxes } = useOutreachMailboxes()
  const { conversations } = useOutreachConversations()
  const { tasks } = useOutreachTasks()

  const [mailboxForm, setMailboxForm] = useState<MailboxFormState>(EMPTY_MAILBOX_FORM)
  const selectedMailbox = mailboxes.find((mailbox) => mailbox.id === mailboxIdParam) ?? mailboxes[0] ?? null

  const selectedMailboxThreads = useMemo(
    () => conversations.filter((conversation) => conversation.mailboxId === selectedMailbox?.id),
    [conversations, selectedMailbox?.id]
  )
  const selectedMailboxTasks = useMemo(
    () => tasks.filter((task) => selectedMailboxThreads.some((conversation) => conversation.id === task.threadId)),
    [selectedMailboxThreads, tasks]
  )

  const openMailbox = (mailboxId: string) => {
    setParams({ mailboxId, newMailbox: null, provider: null })
  }

  const openCreateDialog = (provider?: OutreachMailbox["provider"]) => {
    setMailboxForm({
      ...EMPTY_MAILBOX_FORM,
      provider: provider ?? providerParam ?? "google_workspace",
    })
    setParams({ newMailbox: "1", provider: provider ?? providerParam ?? "google_workspace" })
  }

  const closeCreateDialog = () => {
    setParams({ newMailbox: null, provider: null })
  }

  const handleSaveMailbox = async () => {
    const createdMailbox = await createOutreachMailbox({
      ownerName: mailboxForm.ownerName,
      ownerEmail: mailboxForm.ownerEmail,
      provider: mailboxForm.provider,
      email: mailboxForm.email,
      displayName: mailboxForm.displayName,
      connectionStatus: mailboxForm.connectionStatus,
      sendingHealth: mailboxForm.sendingHealth,
      dailyLimit: Number(mailboxForm.dailyLimit),
    })

    await mutate("outreach-mailboxes")
    toast.success(`Connected mailbox ${createdMailbox.displayName}`)
    setParams({ newMailbox: null, provider: null, mailboxId: createdMailbox.id })
  }

  const handleMailboxState = async (input: Partial<Pick<OutreachMailbox, "connectionStatus" | "sendingHealth">>) => {
    if (!selectedMailbox) {
      return
    }

    await updateOutreachMailbox(selectedMailbox.id, {
      connectionStatus: input.connectionStatus,
      sendingHealth: input.sendingHealth,
    })
    await mutate("outreach-mailboxes")
    toast.success(`Updated ${selectedMailbox.displayName}`)
  }

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-2xl border bg-background shadow-sm">
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Connected inbox roster</p>
                <p className="text-xs text-muted-foreground">Each CRM user connects their own Google Workspace, Outlook or Microsoft 365 inbox here.</p>
              </div>
              <Button size="sm" onClick={() => openCreateDialog()}>Connect mailbox</Button>
            </div>
          </div>

          <div className="max-h-[820px] overflow-auto">
            {mailboxes.map((mailbox) => (
              <button
                type="button"
                key={mailbox.id}
                onClick={() => openMailbox(mailbox.id)}
                className={`w-full border-b px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-muted/30 ${selectedMailbox?.id === mailbox.id ? "bg-muted/45" : ""}`}
              >
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
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 border-t px-4 py-3">
            <Button variant="outline" size="sm" onClick={() => openCreateDialog("google_workspace")}>Connect Google Workspace</Button>
            <Button variant="outline" size="sm" onClick={() => openCreateDialog("microsoft_365")}>Connect Microsoft 365</Button>
            <Button variant="outline" size="sm" onClick={() => openCreateDialog("outlook")}>Connect Outlook</Button>
          </div>
        </section>

        <div className="grid gap-5">
          {selectedMailbox ? (
            <section className="rounded-2xl border bg-background shadow-sm">
              <div className="border-b px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{selectedMailbox.displayName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedMailbox.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleMailboxState({ connectionStatus: "connected", sendingHealth: "healthy" })}>Mark healthy</Button>
                    <Button variant="outline" size="sm" onClick={() => handleMailboxState({ connectionStatus: "attention", sendingHealth: "at_risk" })}>Mark attention</Button>
                    <Button variant="outline" size="sm" onClick={() => handleMailboxState({ connectionStatus: "paused", sendingHealth: "paused" })}>Pause</Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{formatMailboxProvider(selectedMailbox.provider)}</Badge>
                      <Badge variant="outline" className={formatConnectionStatus(selectedMailbox.connectionStatus).tone}>
                        {formatConnectionStatus(selectedMailbox.connectionStatus).label}
                      </Badge>
                      <Badge variant="outline" className={formatSendingHealth(selectedMailbox.sendingHealth).tone}>
                        {formatSendingHealth(selectedMailbox.sendingHealth).label}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <p>Owner: <span className="text-foreground">{selectedMailbox.ownerName}</span></p>
                      <p>Owner email: <span className="text-foreground">{selectedMailbox.ownerEmail ?? selectedMailbox.email}</span></p>
                      <p>Last sync: <span className="text-foreground">{selectedMailbox.lastSyncAt ? new Date(selectedMailbox.lastSyncAt).toLocaleString("en-US") : "Not synced yet"}</span></p>
                      <p>Daily limit: <span className="text-foreground">{selectedMailbox.dailyLimit}</span></p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/outreach/emails?mailboxId=${selectedMailbox.id}`}>Open emails</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/outreach/analytics`}>Open analytics</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-background p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="size-5 text-muted-foreground" />
                      <p className="font-medium text-foreground">Mailbox workload</p>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                        <p>Threads</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{selectedMailboxThreads.length}</p>
                      </div>
                      <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                        <p>Open tasks</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{selectedMailboxTasks.filter((task) => task.status === "open").length}</p>
                      </div>
                      <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                        <p>Replies synced</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{selectedMailboxThreads.filter((thread) => thread.lastEvent === "replied").length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5">
                  <section className="rounded-2xl border bg-background p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <LockKeyhole className="size-5 text-muted-foreground" />
                      <p className="font-medium text-foreground">Token vault</p>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <p>OAuth access token + refresh token storage belongs on the server side, not in the browser.</p>
                      <p>Each mailbox should be owned by one CRM user with explicit reconnect and revoke state.</p>
                      <p>Multi-account support is valid as long as ownership remains clear.</p>
                    </div>
                  </section>

                  <section className="rounded-2xl border bg-background p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="size-5 text-muted-foreground" />
                      <p className="font-medium text-foreground">Reply sync</p>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <p>Inbox API read access for Gmail / Outlook / Microsoft 365.</p>
                      <p>Thread matching back to the CRM contact and seller owner.</p>
                      <p>Conversation history inside seller outreach, not inside the campaign module.</p>
                    </div>
                  </section>

                  <section className="rounded-2xl border bg-background p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="size-5 text-muted-foreground" />
                      <p className="font-medium text-foreground">Boundary</p>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <p>Campaign sender identities do not belong here.</p>
                      <p>Broadcast domains and warmup tooling do not belong here.</p>
                      <p>Only seller-owned 1:1 outreach mailboxes belong in this module.</p>
                    </div>
                  </section>

                  <section className="rounded-2xl border bg-background p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <UserRound className="size-5 text-muted-foreground" />
                      <p className="font-medium text-foreground">Next production step</p>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <p>Server-side OAuth callback flow.</p>
                      <p>Encrypted token storage and rotation state.</p>
                      <p>User-level ownership and RLS before browser writes are allowed.</p>
                    </div>
                  </section>
                </div>
              </div>
            </section>
          ) : (
            <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground shadow-sm">No mailbox selected.</div>
          )}
        </div>
      </div>

      <Dialog open={newMailboxParam} onOpenChange={(open) => !open && closeCreateDialog()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connect mailbox</DialogTitle>
            <DialogDescription>Create the seller mailbox record and ownership state. OAuth remains out of scope here.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Owner name</Label>
              <Input value={mailboxForm.ownerName} onChange={(event) => setMailboxForm((current) => ({ ...current, ownerName: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Owner email</Label>
              <Input value={mailboxForm.ownerEmail} onChange={(event) => setMailboxForm((current) => ({ ...current, ownerEmail: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={mailboxForm.provider} onValueChange={(value: OutreachMailbox["provider"]) => setMailboxForm((current) => ({ ...current, provider: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_workspace">Google Workspace</SelectItem>
                  <SelectItem value="microsoft_365">Microsoft 365</SelectItem>
                  <SelectItem value="outlook">Outlook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Display name</Label>
              <Input value={mailboxForm.displayName} onChange={(event) => setMailboxForm((current) => ({ ...current, displayName: event.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Mailbox email</Label>
              <Input value={mailboxForm.email} onChange={(event) => setMailboxForm((current) => ({ ...current, email: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Connection status</Label>
              <Select value={mailboxForm.connectionStatus} onValueChange={(value: OutreachMailbox["connectionStatus"]) => setMailboxForm((current) => ({ ...current, connectionStatus: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="connected">Connected</SelectItem>
                  <SelectItem value="attention">Attention</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sending health</Label>
              <Select value={mailboxForm.sendingHealth} onValueChange={(value: OutreachMailbox["sendingHealth"]) => setMailboxForm((current) => ({ ...current, sendingHealth: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="warming">Warming</SelectItem>
                  <SelectItem value="at_risk">At risk</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Daily limit</Label>
              <Input value={mailboxForm.dailyLimit} onChange={(event) => setMailboxForm((current) => ({ ...current, dailyLimit: event.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeCreateDialog}>Cancel</Button>
            <Button onClick={handleSaveMailbox} disabled={!mailboxForm.ownerName.trim() || !mailboxForm.email.trim() || !mailboxForm.displayName.trim()}>Save mailbox</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
