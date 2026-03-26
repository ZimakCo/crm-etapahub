"use client"

import { useMemo, useState } from "react"
import { Braces, FileStack, Search, Sparkles } from "lucide-react"
import { useOutreachTemplates } from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type TemplateViewKey = "all" | "intro" | "follow_up" | "meeting" | "re_engage" | "custom"

export function OutreachTemplatesWorkspace() {
  const { templates } = useOutreachTemplates()
  const [searchValue, setSearchValue] = useState("")
  const [activeView, setActiveView] = useState<TemplateViewKey>("all")
  const [selectedTemplateId, setSelectedTemplateId] = useState("")

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

  const selectedTemplate =
    filteredTemplates.find((template) => template.id === selectedTemplateId) ?? filteredTemplates[0] ?? null

  return (
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
                    onClick={() => setSelectedTemplateId(template.id)}
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

          <div className="grid gap-5 p-4 2xl:grid-cols-[1.25fr_0.75fr]">
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
                      <Badge variant="outline">{selectedTemplate.category}</Badge>
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
              <div className="col-span-full rounded-2xl border bg-background p-6 text-sm text-muted-foreground shadow-sm">
                No template selected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
