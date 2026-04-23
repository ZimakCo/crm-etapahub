import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OutreachShell } from "@/components/outreach/outreach-shell"
import { OutreachTemplatesWorkspace } from "@/components/outreach/outreach-templates-workspace"

export default function OutreachTemplatesPage() {
  return (
    <OutreachShell
      sectionKey="templates"
      sectionLabel="Templates"
      title="Templates"
      description="Reusable 1:1 seller templates and sequence content blocks, fully separate from broadcast templates owned by Email Ops."
      actions={
        <Button asChild>
          <Link href="/outreach/templates?newTemplate=1">Create template</Link>
        </Button>
      }
    >
      <Suspense fallback={<div className="min-h-24 rounded-2xl border border-dashed border-border bg-card/50" />}>
        <OutreachTemplatesWorkspace />
      </Suspense>
    </OutreachShell>
  )
}
