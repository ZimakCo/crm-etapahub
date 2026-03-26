"use client"

import { useMemo, useState } from "react"
import { GitBranchPlus, Search, Workflow } from "lucide-react"
import { useOutreachSequences, useOutreachTemplates } from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatSequenceStatus, formatStepType } from "@/components/outreach/outreach-utils"
import { cn } from "@/lib/utils"
import type { OutreachSequenceStatus } from "@/lib/types"

type SequenceViewKey = "all" | OutreachSequenceStatus

export function OutreachSequencesWorkspace() {
  const { sequences } = useOutreachSequences()
  const { templates } = useOutreachTemplates()
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState<SequenceViewKey>("all")
  const [selectedSequenceId, setSelectedSequenceId] = useState("")

  const sequenceViews = [
    { key: "all" as const, label: "All sequences", count: sequences.length },
    { key: "active" as const, label: "Active", count: sequences.filter((sequence) => sequence.status === "active").length },
    { key: "draft" as const, label: "Draft", count: sequences.filter((sequence) => sequence.status === "draft").length },
    { key: "paused" as const, label: "Paused", count: sequences.filter((sequence) => sequence.status === "paused").length },
    { key: "completed" as const, label: "Completed", count: sequences.filter((sequence) => sequence.status === "completed").length },
  ]

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

  const selectedSequenceTemplates = selectedSequence
    ? selectedSequence.steps
        .map((step) => templates.find((template) => template.id === step.templateId))
        .filter((template): template is NonNullable<typeof template> => Boolean(template))
    : []

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border bg-background shadow-sm">
        <div className="flex min-w-max items-center gap-6 overflow-x-auto border-b px-4">
          {sequenceViews.map((view) => (
            <button
              type="button"
              key={view.key}
              onClick={() => setStatusFilter(view.key)}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                statusFilter === view.key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{view.label}</span>
              <span className="text-xs text-muted-foreground">{view.count}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search sequences"
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: SequenceViewKey) => setStatusFilter(value)}>
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
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Visible {filteredSequences.length}</Badge>
            <Badge variant="outline">Active contacts {filteredSequences.reduce((sum, sequence) => sum + sequence.activeContacts, 0)}</Badge>
            <Badge variant="outline">Avg reply {averageReplyRate}%</Badge>
          </div>
        </div>

        <div className="grid xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="border-b xl:border-b-0 xl:border-r">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium text-foreground">Sequence library</p>
              <p className="text-xs text-muted-foreground">Seller-owned playbooks with stop rules and manual follow-up steps.</p>
            </div>

            <div className="max-h-[860px] overflow-auto">
              {filteredSequences.length > 0 ? (
                filteredSequences.map((sequence) => (
                  <button
                    type="button"
                    key={sequence.id}
                    onClick={() => setSelectedSequenceId(sequence.id)}
                    className={cn(
                      "w-full border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/30",
                      selectedSequence?.id === sequence.id && "bg-muted/45"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{sequence.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{sequence.description}</p>
                      </div>
                      <Badge variant="outline">{formatSequenceStatus(sequence.status)}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{sequence.ownerName}</span>
                      <span>•</span>
                      <span>{sequence.activeContacts} active</span>
                      <span>•</span>
                      <span>{sequence.replyRate}% reply</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-sm text-muted-foreground">No sequences match the current filters.</div>
              )}
            </div>
          </div>

          <div className="grid gap-5 p-4 2xl:grid-cols-[1.2fr_0.8fr]">
            {selectedSequence ? (
              <>
                <div className="space-y-5">
                  <section className="rounded-2xl border bg-background shadow-sm">
                    <div className="border-b px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Workflow className="size-5 text-muted-foreground" />
                            <p className="font-medium text-foreground">{selectedSequence.name}</p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{selectedSequence.description}</p>
                        </div>
                        <Badge variant="outline">{formatSequenceStatus(selectedSequence.status)}</Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 border-b px-4 py-3 text-sm text-muted-foreground">
                      <Badge variant="outline">Owner {selectedSequence.ownerName}</Badge>
                      <Badge variant="outline">Active {selectedSequence.activeContacts}</Badge>
                      <Badge variant="outline">Completed {selectedSequence.completedContacts}</Badge>
                      <Badge variant="outline">Open rate {selectedSequence.openRate}%</Badge>
                      <Badge variant="outline">Reply rate {selectedSequence.replyRate}%</Badge>
                    </div>

                    <div className="space-y-4 p-4">
                      <div className="flex items-center gap-2">
                        <GitBranchPlus className="size-5 text-muted-foreground" />
                        <p className="font-medium text-foreground">Sequence flow</p>
                      </div>

                      <div className="space-y-4">
                        {selectedSequence.steps.map((step, index) => {
                          const stepTemplate = templates.find((template) => template.id === step.templateId)

                          return (
                            <div key={step.id} className="relative pl-12">
                              {index < selectedSequence.steps.length - 1 ? (
                                <div className="absolute left-[1.05rem] top-9 h-[calc(100%-0.25rem)] w-px bg-border" />
                              ) : null}
                              <div className="absolute left-0 top-1 flex size-8 items-center justify-center rounded-full border bg-background text-sm font-medium text-foreground">
                                {step.order}
                              </div>
                              <div className="rounded-2xl border bg-muted/10 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-foreground">{step.title}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{formatStepType(step.type)} · Delay +{step.delayDays} day{step.delayDays === 1 ? "" : "s"}</p>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {step.priority ? <Badge variant="outline">{step.priority}</Badge> : null}
                                    {stepTemplate ? <Badge variant="secondary">{stepTemplate.name}</Badge> : null}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-5">
                  <section className="rounded-2xl border bg-background p-4 shadow-sm">
                    <p className="font-medium text-foreground">Sequence settings</p>
                    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <div className="rounded-2xl border bg-muted/10 p-4">
                        <p><span className="font-medium text-foreground">Stop on reply</span>: {selectedSequence.stopOnReply ? "Yes" : "No"}</p>
                        <p className="mt-1"><span className="font-medium text-foreground">Stop on interested</span>: {selectedSequence.stopOnInterested ? "Yes" : "No"}</p>
                      </div>
                      <div className="rounded-2xl border bg-muted/10 p-4">
                        <p className="font-medium text-foreground">Sender selection</p>
                        <p className="mt-1">Mailbox assignment happens at enrollment time, not inside the sequence definition.</p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border bg-background p-4 shadow-sm">
                    <p className="font-medium text-foreground">Linked templates</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedSequenceTemplates.length > 0 ? (
                        selectedSequenceTemplates.map((template) => (
                          <Badge key={template.id} variant="secondary">{template.name}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No templates linked yet.</p>
                      )}
                    </div>
                  </section>

                  <section className="rounded-2xl border bg-background p-4 shadow-sm">
                    <p className="font-medium text-foreground">Why this structure</p>
                    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <p>Sequences are the seller playbook.</p>
                      <p>Mailboxes are personal identities owned by each CRM user.</p>
                      <p>Reply and interested status should stop future automatic steps immediately.</p>
                    </div>
                  </section>
                </div>
              </>
            ) : (
              <div className="col-span-full rounded-2xl border bg-background p-6 text-sm text-muted-foreground shadow-sm">
                No sequence selected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
