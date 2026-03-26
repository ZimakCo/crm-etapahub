import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OutreachShell } from "@/components/outreach/outreach-shell"
import { OutreachSequencesWorkspace } from "@/components/outreach/outreach-sequences-workspace"

export default function OutreachSequencesPage() {
  return (
    <OutreachShell
      sectionKey="sequences"
      sectionLabel="Sequences"
      title="Sequences"
      description="Seller sequences combine direct emails, manual follow-up, calls and qualification tasks without sharing the campaign sending stack."
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/contacts">Enroll contacts</Link>
          </Button>
          <Button>Create sequence</Button>
        </>
      }
    >
      <OutreachSequencesWorkspace />
    </OutreachShell>
  )
}
