"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Braces, FileStack, PencilLine, Search, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { useSWRConfig } from "swr"
import {
  createOutreachTemplate,
  updateOutreachTemplate,
} from "@/lib/outreach-repository"
import { useOutreachSequences, useOutreachTemplates } from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useOutreachRouteState } from "@/components/outreach/use-outreach-route-state"
import { cn } from "@/lib/utils"
import type { OutreachTemplate } from "@/lib/types"

type TemplateViewKey = "all" | "intro" | "follow_up" | "meeting" | "re_engage" | "custom"

type TemplateFormState = {
  ownerName: string
  name: string
  category: OutreachTemplate["category"]
  subject: string
  plainTextBody: string
}

const EMPTY_TEMPLATE_FORM: TemplateFormState = {
  ownerName: "Clara Rossi",
  name: "",
  category: "intro",
  subject: "",
  plainTextBody: "",
}

export function OutreachTemplatesWorkspace() {
  const { mutate } = useSWRConfig()
  const { searchParams, setParams } = useOutreachRouteState()
  const templateIdParam = searchParams.get("templateId") ?? ""
  const newTemplateParam = searchParams.get("newTemplate") === "1"
  const editTemplateParam = searchParams.get("editTemplate") === "1"

  const { templates } = useOutreachTemplates()
  const { sequences } = useOutreachSequences()
  const [searchValue, setSearchValue] = useState("")
  const [activeView, setActiveView] = useState<TemplateViewKey>("all")
  const [templateForm, setTemplateForm] = useState<TemplateFormState>(EMPTY_TEMPLATE_FORM)

  const templateViews = [
    { key: "all" as const, label: "All templates", count: templates.length },
    { key: "intro" as const, label: "Intro", count: templates.filter((template) => template.category === "intro").length },
    { key: "follow_up" as const, label: "Follow up", count: templates.filter((template) => template.category === "follow_up").length },
    { key: "meeting" as const, label: "Meeting", count: templates.filter((template) => template.category === "meeting").length },
    { key: "re_engage" as const, label: "Re-engage", count: templates.filter((template) => template.category === "re_engage").length },
    { key: "custom" as const, label: "Custom", count: templates.filter((template) => template.category === "custom").length },
  ]

  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) => {
        const query = searchValue.trim().toLowerCase()
        const matchesQuery =
          query.length === 0 ||
          template.name.toLowerCase().includes(query) ||
          template.subject.toLowerCase().includes(query) ||
          template.plainTextBody.toLowerCase().includes(query)
        const matchesCategory = activeView === "all" || template.category === activeView

        return matchesQuery && matchesCategory
      }),
    [activeView, searchValue, templates]
  )

  const selectedTemplate = filteredTemplates.find((template) => template.id === templateIdParam) ?? filteredTemplates[0] ?? null
  const linkedSequences = selectedTemplate
    ? sequences.filter((sequence) => sequence.steps.some((step) => step.templateId === selectedTemplate.id))
    : []

  const openTemplate = (templateId: string) => {
    setParams({ templateId, newTemplate: null, editTemplate: null })
  }

  const openCreateDialog = () => {
    setTemplateForm({
      ...EMPTY_TEMPLATE_FORM,
      ownerName: selectedTemplate?.ownerName ?? EMPTY_TEMPLATE_FORM.ownerName,
      category: selectedTemplate?.category ?? EMPTY_TEMPLATE_FORM.category,
    })
    setParams({ newTemplate: "1", editTemplate: null })
  }

  const openEditDialog = () => {
    if (!selectedTemplate) {
      return
    }

    setTemplateForm({
      ownerName: selectedTemplate.ownerName ?? "EtapaHub seller",
      name: selectedTemplate.name,
      category: selectedTemplate.category,
      subject: selectedTemplate.subject,
      plainTextBody: selectedTemplate.plainTextBody,
    })
    setParams({ editTemplate: "1", newTemplate: null })
  }

  const closeDialog = () => {
    setParams({ newTemplate: null, editTemplate: null })
  }

  const handleSaveTemplate = async () => {
    if (editTemplateParam && selectedTemplate) {
      await updateOutreachTemplate(selectedTemplate.id, templateForm)
      toast.success(`Updated template ${templateForm.name}`)
    } else {
      const createdTemplate = await createOutreachTemplate(templateForm)
      toast.success(`Created template ${createdTemplate.name}`)
      setParams({ templateId: createdTemplate.id })
    }

    await mutate("outreach-templates")
    setParams({ newTemplate: null, editTemplate: null })
  }

  return (
    <>
      <div className="grid gap-5">
        <div className="rounded-2xl border bg-background shadow-sm">
          <div className="flex min-w-max items-center gap-6 overflow-x-auto border-b px-4">
            {templateViews.map((view) => (
              <button
                type="button"
                key={view.key}
                onClick={() => setActiveView(view.key)}
                className={cn(
                  "inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                  activeView === view.key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{view.label}</span>
                <span className="text-xs text-muted-foreground">{view.count}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search templates"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <Button size="sm" onClick={openCreateDialog}>Create template</Button>
              {selectedTemplate ? (
                <Button variant="outline" size="sm" onClick={openEditDialog}>
                  <PencilLine className="size-4" />
                  Edit selected
                </Button>
              ) : null}
              <Badge variant="outline">Visible {filteredTemplates.length}</Badge>
              <Badge variant="outline">Merge tags 2</Badge>
              <Badge variant="outline">Boundary 1:1 seller send</Badge>
            </div>
          </div>

          <div className="grid xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="border-b xl:border-b-0 xl:border-r">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-medium text-foreground">Seller template library</p>
                <p className="text-xs text-muted-foreground">Personal-mailbox content blocks for direct follow-up and sequences.</p>
              </div>

              <div className="max-h-[860px] overflow-auto">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => (
                    <button
                      type="button"
                      key={template.id}
                      onClick={() => openTemplate(template.id)}
                      className={cn(
                        "w-full border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/30",
                        selectedTemplate?.id === template.id && "bg-muted/45"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{template.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{template.subject}</p>
                        </div>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{template.ownerName}</span>
                        <span>•</span>
                        <span>{template.updatedAt.slice(0, 10)}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-sm text-muted-foreground">No templates match the current view.</div>
                )}
              </div>
            </div>

            <div className="grid gap-5 p-4 2xl:grid-cols-[1.2fr_0.8fr]">
              {selectedTemplate ? (
                <>
                  <section className="rounded-2xl border bg-background shadow-sm">
                    <div className="border-b px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <FileStack className="size-5 text-muted-foreground" />
                            <p className="font-medium text-foreground">Template preview</p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">Subject and plain-text content for the selected seller template.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{selectedTemplate.category}</Badge>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/outreach/emails?templateId=${selectedTemplate.id}`}>Open in composer</Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 p-4">
                      <div className="rounded-2xl border bg-muted/10 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Template name</p>
                        <p className="mt-2 font-medium text-foreground">{selectedTemplate.name}</p>
                      </div>

                      <div className="rounded-2xl border bg-muted/10 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Subject</p>
                        <p className="mt-2 text-foreground">{selectedTemplate.subject}</p>
                      </div>

                      <div className="rounded-2xl border bg-muted/10 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Body</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{selectedTemplate.plainTextBody}</p>
                      </div>
                    </div>
                  </section>

                  <div className="space-y-5">
                    <section className="rounded-2xl border bg-background p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Braces className="size-5 text-muted-foreground" />
                        <p className="font-medium text-foreground">Merge tags</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="secondary">{"{{first_name}}"}</Badge>
                        <Badge variant="secondary">{"{{company}}"}</Badge>
                      </div>
                    </section>

                    <section className="rounded-2xl border bg-background p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-5 text-muted-foreground" />
                        <p className="font-medium text-foreground">Linked sequences</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {linkedSequences.length > 0 ? (
                          linkedSequences.map((sequence) => (
                            <Button key={sequence.id} variant="outline" size="sm" asChild>
                              <Link href={`/outreach/sequences?sequenceId=${sequence.id}`}>{sequence.name}</Link>
                            </Button>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">This template is not referenced by any sequence yet.</p>
                        )}
                      </div>
                    </section>

                    <section className="rounded-2xl border bg-background p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-5 text-muted-foreground" />
                        <p className="font-medium text-foreground">Template boundary</p>
                      </div>
                      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                        <p>These templates are for seller-owned 1:1 motion.</p>
                        <p>They stay separate from Email Ops broadcast templates.</p>
                        <p>Sequence steps can reference them, but they are still personal-outreach content.</p>
                      </div>
                    </section>
                  </div>
                </>
              ) : (
                <div className="col-span-full rounded-2xl border bg-background p-6 text-sm text-muted-foreground shadow-sm">No template selected.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={newTemplateParam || editTemplateParam} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editTemplateParam ? "Edit template" : "Create template"}</DialogTitle>
            <DialogDescription>Manage seller-owned 1:1 templates. This does not send any email.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Owner</Label>
              <Input value={templateForm.ownerName} onChange={(event) => setTemplateForm((current) => ({ ...current, ownerName: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={templateForm.category} onValueChange={(value: OutreachTemplate["category"]) => setTemplateForm((current) => ({ ...current, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intro">Intro</SelectItem>
                  <SelectItem value="follow_up">Follow up</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="re_engage">Re-engage</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Name</Label>
              <Input value={templateForm.name} onChange={(event) => setTemplateForm((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Subject</Label>
              <Input value={templateForm.subject} onChange={(event) => setTemplateForm((current) => ({ ...current, subject: event.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Body</Label>
              <Textarea rows={10} value={templateForm.plainTextBody} onChange={(event) => setTemplateForm((current) => ({ ...current, plainTextBody: event.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSaveTemplate} disabled={!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.plainTextBody.trim()}>
              {editTemplateParam ? "Save changes" : "Create template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
