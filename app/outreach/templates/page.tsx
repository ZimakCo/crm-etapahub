import { OutreachShell } from "@/components/outreach/outreach-shell"
import { OutreachTemplatesWorkspace } from "@/components/outreach/outreach-templates-workspace"

export default function OutreachTemplatesPage() {
  return (
    <OutreachShell
      sectionLabel="Templates"
      title="Templates"
      description="Reusable 1:1 seller templates and sequence content blocks, fully separate from broadcast templates owned by Email Ops."
    >
      <OutreachTemplatesWorkspace />
    </OutreachShell>
  )
}
