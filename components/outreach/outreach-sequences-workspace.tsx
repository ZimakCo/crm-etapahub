"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { GitBranchPlus, Search, Workflow } from "lucide-react"
import { useOutreachSequences, useOutreachTemplates } from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatSequenceStatus, formatStepType } from "@/components/outreach/outreach-utils"

export function OutreachSequencesWorkspace() {
  const { sequences } = useOutreachSequences()
  const { templates } = useOutreachTemplates()
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSequenceId, setSelectedSequenceId] = useState("")

  const filteredSequences = useMemo(
    () =>
      sequences.filter((sequence) => {
        const query = searchValue.trim().toLowerCase()
        const matchesQuery =
          query.length === 0 ||
          sequence.name.toLowerCase().includes(query) ||
          sequence.ownerName.toLowerCase().includes(query) ||
          sequence.description.toLowerCase().includes(query)
        const matchesStatus = statusFilter === "all" || sequence.status === statusFilter

        return matchesQuery && matchesStatus
      }),
    [searchValue, sequences, statusFilter]
  )

  const selectedSequence =
    filteredSequences.find((sequence) => sequence.id === selectedSequenceId) ?? filteredSequences[0] ?? null

  const averageReplyRate =
    filteredSequences.length === 0
      ? 0
      : Math.round(filteredSequences.reduce((sum, sequence) => sum + sequence.replyRate, 0) / filteredSequences.length)

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Sequences</p>
            <p className="mt-3 text-3xl font-semibold">{filteredSequences.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Seller-owned flows for multi-step outreach.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Active contacts</p>
            <p className="mt-3 text-3xl font-semibold">{filteredSequences.reduce((sum, sequence) => sum + sequence.activeContacts, 0)}</p>
            <p className="mt-2 text-sm text-muted-foreground">People currently progressing through seller sequences.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Average reply rate</p>
            <p className="mt-3 text-3xl font-semibold">{averageReplyRate}%</p>
            <p className="mt-2 text-sm text-muted-foreground">Performance measured on 1:1 seller motion, not campaign traffic.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Templates linked</p>
            <p className="mt-3 text-3xl font-semibold">{templates.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Reusable content blocks available for sequence steps.</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search sequences"
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-[220px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/contacts">Enroll contacts</Link>
          </Button>
          <Button>Create sequence</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="size-5 text-muted-foreground" />
              Sequence library
            </CardTitle>
            <CardDescription>
              Seller sequences should describe the motion and stop rules. Mailbox choice happens when contacts are enrolled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredSequences.map((sequence) => (
              <button
                type="button"
                key={sequence.id}
                onClick={() => setSelectedSequenceId(sequence.id)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${selectedSequence?.id === sequence.id ? "border-foreground bg-muted/40" : "border-border hover:bg-muted/20"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{sequence.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{sequence.description}</p>
                  </div>
                  <Badge variant="outline">{formatSequenceStatus(sequence.status)}</Badge>
                </div>
                <div className="mt-3 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                  <p>Owner: <span className="text-foreground">{sequence.ownerName}</span></p>
                  <p>Active contacts: <span className="text-foreground">{sequence.activeContacts}</span></p>
                  <p>Reply rate: <span className="text-foreground">{sequence.replyRate}%</span></p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranchPlus className="size-5 text-muted-foreground" />
                Sequence flow
              </CardTitle>
              <CardDescription>
                Step order, delays and stop rules for the selected seller sequence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSequence ? (
                <>
                  <div className="rounded-2xl border border-border p-4 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Stop on reply</span>: {selectedSequence.stopOnReply ? "Yes" : "No"}</p>
                    <p className="mt-1"><span className="font-medium text-foreground">Stop on interested</span>: {selectedSequence.stopOnInterested ? "Yes" : "No"}</p>
                    <p className="mt-1"><span className="font-medium text-foreground">Sender selection</span>: choose mailbox when contacts are added, not in the sequence definition.</p>
                  </div>

                  <div className="space-y-3">
                    {selectedSequence.steps.map((step) => (
                      <div key={step.id} className="rounded-2xl border border-border p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">Step {step.order}: {step.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{formatStepType(step.type)} · Delay +{step.delayDays} day{step.delayDays === 1 ? "" : "s"}</p>
                          </div>
                          {step.priority ? <Badge variant="outline">{step.priority}</Badge> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No sequence selected.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why this structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Sequences are the seller playbook.</p>
              <p>Mailboxes are personal identities owned by each CRM user.</p>
              <p>Enrollment picks the mailbox and can optionally rotate among approved seller mailboxes.</p>
              <p>Reply and interested status should stop future automatic steps immediately.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
