"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { getTemplateSlug, getTemplateUsageCount } from "@/lib/email-ops"
import { useCampaigns, useTemplates } from "@/lib/hooks"
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
  const { campaigns } = useCampaigns()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) =>
        [template.name, template.subject, template.previewText]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [searchQuery, templates]
  )

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Templates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button className="rounded-xl bg-white text-black hover:bg-white/90" asChild>
            <Link href="/templates/new">
              <Plus className="size-4" />
              Create template
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[#050505] px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-5xl font-semibold tracking-tight">Templates</h1>
              <p className="max-w-3xl text-sm text-white/55">
                Templates stay separate from broadcasts. Sales creates the audience slice, operations picks the sender identity, and the broadcast only pulls the content from here.
              </p>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
              <Input
                className="h-12 rounded-2xl border-white/10 bg-[#1a1b1f] pl-11 text-white placeholder:text-white/35"
                placeholder="Search..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {filteredTemplates.map((template) => {
              const usageCount = getTemplateUsageCount(template, campaigns)

              return (
                <Card key={template.id} className="overflow-hidden border-white/10 bg-[#050505] text-white shadow-none">
                  <CardContent className="space-y-5 p-0">
                    <div className="rounded-[32px] border border-white/10 bg-white p-6 text-black">
                      <div className="rounded-[26px] bg-[#f5f5f4] p-6">
                        <div className="max-w-md rounded-[24px] bg-white/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                          <p className="text-sm text-black/55">{"Dear {{{contact.first_name}}}"}</p>
                          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-black/80">
                            {(template.textContent || template.previewText).slice(0, 260)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 px-3 pb-3">
                      <div className="space-y-1">
                        <p className="text-2xl font-semibold">{template.name}</p>
                        <p className="font-mono text-lg text-white/45">{getTemplateSlug(template)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-white/70">
                          Plain text
                        </Badge>
                        <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-white/70">
                          {usageCount} broadcast{usageCount === 1 ? "" : "s"}
                        </Badge>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]" asChild>
                          <Link href="/campaigns/new">Use in broadcast</Link>
                        </Button>
                      </div>
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
