import { Suspense } from "react"
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
          <Button asChild>
            <Link href="/outreach/sequences?newSequence=1">Create sequence</Link>
          </Button>
        </>
      }
    >
      <Suspense fallback={<div className="min-h-24 rounded-2xl border border-dashed border-border bg-card/50" />}>
        <OutreachSequencesWorkspace />
      </Suspense>
    </OutreachShell>
  )
}
