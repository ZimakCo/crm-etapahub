import { OutreachShell } from "@/components/outreach/outreach-shell"
import { OutreachSettingsWorkspace } from "@/components/outreach/outreach-settings-workspace"

export default function OutreachSettingsPage() {
  return (
    <OutreachShell
      sectionLabel="Mailboxes"
      title="Personal Mailboxes"
      description="Mailbox connection, sync readiness and ownership for each seller using the outreach workspace."
    >
      <OutreachSettingsWorkspace />
    </OutreachShell>
  )
}
