"use client"

import Link from "next/link"
import { LockKeyhole, Mail, RefreshCw, Shield, UserRound } from "lucide-react"
import { useOutreachMailboxes } from "@/lib/hooks"
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

function formatProvider(provider: string) {
  switch (provider) {
    case "google_workspace":
      return "Google Workspace"
    case "microsoft_365":
      return "Microsoft 365"
    default:
      return "Outlook"
  }
}

export default function OutreachSettingsPage() {
  const { mailboxes } = useOutreachMailboxes()

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/outreach">Outreach</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Personal Mailboxes</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight">Personal Mailboxes</h1>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px]">
                  Beta
                </Badge>
              </div>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Each CRM user connects their own Google Workspace, Outlook or Microsoft 365 inbox here. This area belongs only to seller outreach and stays separate from campaign sender identities.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">Connect Google Workspace</Button>
              <Button variant="outline">Connect Microsoft 365</Button>
              <Button variant="outline">Connect Outlook</Button>
            </div>
          </div>

          <Card className="border-dashed">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Shared CRM data is fine. Shared sending infrastructure is not. Seller outreach uses personal mailbox OAuth, reply sync and seller templates. Marketing campaigns continue to use their own delivery stack, domains and broadcast controls.
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="size-5 text-muted-foreground" />
                  Connected inbox roster
                </CardTitle>
                <CardDescription>
                  Seller-linked mailboxes that power direct 1:1 communication.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mailboxes.map((mailbox) => (
                  <div key={mailbox.id} className="rounded-2xl border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{mailbox.displayName}</p>
                        <p className="text-sm text-muted-foreground">{mailbox.email}</p>
                      </div>
                      <Badge variant="outline">{formatProvider(mailbox.provider)}</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-4">
                      <p><span className="text-foreground">Owner</span>: {mailbox.ownerName}</p>
                      <p><span className="text-foreground">Connection</span>: {mailbox.connectionStatus}</p>
                      <p><span className="text-foreground">Health</span>: {mailbox.sendingHealth.replaceAll("_", " ")}</p>
                      <p><span className="text-foreground">Daily limit</span>: {mailbox.dailyLimit}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LockKeyhole className="size-5 text-muted-foreground" />
                    Token Vault
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>OAuth access token + refresh token storage</p>
                  <p>Mailbox reconnection status per seller</p>
                  <p>Optional multi-account support for one CRM user</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="size-5 text-muted-foreground" />
                    Reply Sync
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Inbox API read access for Gmail / Outlook / Microsoft 365</p>
                  <p>Thread matching back to the CRM contact</p>
                  <p>Conversation view inside seller outreach</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="size-5 text-muted-foreground" />
                    Boundary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Campaign sender identities do not appear here.</p>
                  <p>Broadcast domains do not appear here.</p>
                  <p>Only seller-owned 1:1 outreach mailboxes belong in this module.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserRound className="size-5 text-muted-foreground" />
                    Next Step
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  The correct production path is server-side OAuth, encrypted token storage and per-user mailbox ownership before tightening RLS on outreach entities.
                  <div className="mt-4">
                    <Button variant="outline" asChild>
                      <Link href="/outreach">Back to Outreach</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
