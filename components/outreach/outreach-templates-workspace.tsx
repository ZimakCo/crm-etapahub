"use client"

import { useMemo, useState } from "react"
import { Braces, FileStack, Search, Sparkles } from "lucide-react"
import { useOutreachTemplates } from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OutreachMetricCard } from "@/components/outreach/outreach-metric-card"

export function OutreachTemplatesWorkspace() {
  const { templates } = useOutreachTemplates()
  const [searchValue, setSearchValue] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) => {
        const query = searchValue.trim().toLowerCase()
        const matchesQuery =
          query.length === 0 ||
          template.name.toLowerCase().includes(query) ||
          template.subject.toLowerCase().includes(query) ||
          template.plainTextBody.toLowerCase().includes(query)
        const matchesCategory = categoryFilter === "all" || template.category === categoryFilter

        return matchesQuery && matchesCategory
      }),
    [categoryFilter, searchValue, templates]
  )

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OutreachMetricCard
          title="Templates"
          value={filteredTemplates.length}
          description="Seller-only templates for 1:1 inbox use and sequence steps."
          icon={FileStack}
          toneClassName="border-fuchsia-200/80 bg-fuchsia-50/80"
        />
        <OutreachMetricCard
          title="Merge tags"
          value={2}
          description="Core variables surfaced to the seller workflow today."
          icon={Braces}
          toneClassName="border-sky-200/80 bg-sky-50/80"
        />
        <OutreachMetricCard
          title="Boundary"
          value="1:1"
          description="These templates are intentionally separate from Email Ops broadcast templates."
          icon={Sparkles}
          toneClassName="border-amber-200/80 bg-amber-50/80"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-fuchsia-200/80 bg-[linear-gradient(135deg,rgba(253,244,255,0.95),rgba(255,255,255,0.9))] p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search templates"
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full lg:w-[220px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="intro">Intro</SelectItem>
              <SelectItem value="follow_up">Follow up</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="re_engage">Re-engage</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-fuchsia-200/80 bg-[linear-gradient(180deg,rgba(253,244,255,0.82),rgba(255,255,255,0.96))]">
        <CardHeader>
          <CardTitle>Seller template library</CardTitle>
          <CardDescription>
            Templates designed for personal mailbox sends, manual follow-up and sequence steps.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="rounded-2xl border border-fuchsia-200/70 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-foreground">{template.name}</p>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <p className="mt-3 text-sm text-foreground">{template.subject}</p>
              <p className="mt-3 line-clamp-6 whitespace-pre-wrap text-sm text-muted-foreground">{template.plainTextBody}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">{"{{first_name}}"}</Badge>
                <Badge variant="secondary">{"{{company}}"}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
