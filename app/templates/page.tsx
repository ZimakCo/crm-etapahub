"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowUpRight, FileText, Plus, Search } from "lucide-react"
import { getTemplateSlug, getTemplateUsageCount } from "@/lib/email-ops"
import { useBroadcasts, useTemplates } from "@/lib/hooks"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function TemplatesPage() {
  const { templates } = useTemplates()
  const { campaigns } = useBroadcasts()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) =>
        [template.name, template.subject, template.previewText, template.textContent]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [searchQuery, templates]
  )

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Templates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/templates/new">
              <Plus className="size-4" />
              New template
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_14rem)] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Plain-text templates stay independent from broadcasts. Sales prepares the segment, then operations chooses template, sender identity and provider lane at send time.
              </p>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search templates"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {filteredTemplates.map((template) => {
              const usageCount = getTemplateUsageCount(template, campaigns)

              return (
                <Card key={template.id} className="border-border/70 bg-card/90 shadow-sm">
                  <CardContent className="space-y-4 p-5">
                    <div className="rounded-2xl border bg-muted/20 p-5">
                      <div className="rounded-xl border bg-background p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          <FileText className="size-3.5" />
                          Plain Text
                        </div>
                        <p className="mt-4 text-base font-medium">{template.subject}</p>
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {(template.textContent || template.previewText || "")
                            .slice(0, 260)
                            .trim() || "No body yet."}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xl font-semibold">{template.name}</p>
                          <p className="font-mono text-sm text-muted-foreground">
                            {getTemplateSlug(template)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Plain text</Badge>
                          <Badge variant="outline">
                            {usageCount} broadcast{usageCount === 1 ? "" : "s"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template.previewText || "No preview text configured."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/templates/${template.id}`}>Edit template</Link>
                      </Button>
                      <Button variant="ghost" asChild>
                        <Link href={`/broadcasts/new?templateId=${template.id}`}>
                          Use in broadcast
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
