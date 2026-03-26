"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
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
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Templates</p>
            <p className="mt-3 text-3xl font-semibold">{filteredTemplates.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Seller-only templates for 1:1 inbox use and sequence steps.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Merge tags</p>
            <p className="mt-3 text-3xl font-semibold">2</p>
            <p className="mt-2 text-sm text-muted-foreground">Core variables surfaced to the seller workflow today.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Boundary</p>
            <p className="mt-3 text-3xl font-semibold">1:1</p>
            <p className="mt-2 text-sm text-muted-foreground">These templates are intentionally separate from Email Ops broadcast templates.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Seller template library</CardTitle>
          <CardDescription>
            Templates designed for personal mailbox sends, manual follow-up and sequence steps.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="rounded-2xl border border-border p-4">
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
