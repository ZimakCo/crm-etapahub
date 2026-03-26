import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OutreachShell } from "@/components/outreach/outreach-shell"
import { OutreachTasksWorkspace } from "@/components/outreach/outreach-tasks-workspace"

export default function OutreachTasksPage() {
  return (
    <OutreachShell
      sectionLabel="Tasks"
      title="Tasks"
      description="Task center for seller follow-up work created by replies, sequence steps and qualification rules."
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/outreach/emails">Open email queue</Link>
          </Button>
          <Button>Create task</Button>
        </>
      }
    >
      <OutreachTasksWorkspace />
    </OutreachShell>
  )
}
