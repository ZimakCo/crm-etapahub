import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OutreachShell } from "@/components/outreach/outreach-shell"
import { OutreachEmailsWorkspace } from "@/components/outreach/outreach-emails-workspace"

export default function OutreachEmailsPage() {
  return (
    <OutreachShell
      sectionKey="emails"
      sectionLabel="Emails"
      title="Emails"
      description="Mailbox-connected seller workspace for direct 1:1 emails, synced replies, conversation threads and manual follow-up."
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/outreach/settings">Manage personal mailboxes</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/outreach/analytics">Seller analytics</Link>
          </Button>
        </>
      }
    >
      <Suspense fallback={<div className="min-h-24 rounded-2xl border border-dashed border-border bg-card/50" />}>
        <OutreachEmailsWorkspace />
      </Suspense>
    </OutreachShell>
  )
}
