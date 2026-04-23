import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OutreachShell } from "@/components/outreach/outreach-shell"
import { OutreachTasksWorkspace } from "@/components/outreach/outreach-tasks-workspace"

export default function OutreachTasksPage() {
  return (
    <OutreachShell
      sectionKey="tasks"
      sectionLabel="Tasks"
      title="Tasks"
      description="Task center for seller follow-up work created by replies, sequence steps and qualification rules."
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/outreach/emails">Open email queue</Link>
          </Button>
          <Button asChild>
            <Link href="/outreach/tasks?newTask=1">Create task</Link>
          </Button>
        </>
      }
    >
      <Suspense fallback={<div className="min-h-24 rounded-2xl border border-dashed border-border bg-card/50" />}>
        <OutreachTasksWorkspace />
      </Suspense>
    </OutreachShell>
  )
}
