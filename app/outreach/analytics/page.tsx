import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OutreachShell } from "@/components/outreach/outreach-shell"
import { OutreachAnalyticsWorkspace } from "@/components/outreach/outreach-analytics-workspace"

export default function OutreachAnalyticsPage() {
  return (
    <OutreachShell
      sectionKey="analytics"
      sectionLabel="Analytics"
      title="Analytics"
      description="Performance, mailbox health and seller pipeline signals for personal inbox outreach."
      actions={
        <Button variant="outline" asChild>
          <Link href="/outreach/settings">View mailboxes</Link>
        </Button>
      }
    >
      <OutreachAnalyticsWorkspace />
    </OutreachShell>
  )
}
