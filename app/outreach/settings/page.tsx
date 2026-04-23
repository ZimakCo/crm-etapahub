import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OutreachShell } from "@/components/outreach/outreach-shell"
import { OutreachSettingsWorkspace } from "@/components/outreach/outreach-settings-workspace"

export default function OutreachSettingsPage() {
  return (
    <OutreachShell
      sectionKey="mailboxes"
      sectionLabel="Mailboxes"
      title="Personal Mailboxes"
      description="Mailbox connection, sync readiness and ownership for each seller using the outreach workspace."
      actions={
        <Button asChild>
          <Link href="/outreach/settings?newMailbox=1">Connect mailbox</Link>
        </Button>
      }
    >
      <Suspense fallback={<div className="min-h-24 rounded-2xl border border-dashed border-border bg-card/50" />}>
        <OutreachSettingsWorkspace />
      </Suspense>
    </OutreachShell>
  )
}
