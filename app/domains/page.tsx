"use client"

import { useMemo, useState } from "react"
import { Globe, Plus, Search } from "lucide-react"
import {
  emailDomains,
  formatProviderLabel,
  getDomainStatusBadgeClass,
  getTrackingBadgeClass,
  senderIdentities,
} from "@/lib/email-ops"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatRelativeDate(dateString: string) {
  const diffDays = Math.max(
    1,
    Math.round((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24))
  )

  return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`
}

export default function DomainsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")

  const filteredDomains = useMemo(
    () =>
      emailDomains.filter((domain) => {
        const matchesSearch =
          !searchQuery ||
          [domain.name, domain.region, formatProviderLabel(domain.provider)]
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || domain.status === statusFilter
        const matchesRegion = regionFilter === "all" || domain.region === regionFilter

        return matchesSearch && matchesStatus && matchesRegion
      }),
    [regionFilter, searchQuery, statusFilter]
  )

  const availableRegions = Array.from(new Set(emailDomains.map((domain) => domain.region)))

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Domains</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button className="rounded-xl bg-white text-black hover:bg-white/90">
            <Plus className="size-4" />
            Add domain
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[#050505] px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-semibold tracking-tight">Domains</h1>
            <p className="max-w-3xl text-sm text-white/55">
              Verified sending domains used by Resend, Mailgun and the KumoMTA relay. This is the operational layer behind sender identities and tracking.
            </p>
          </div>

          <Card className="border-white/10 bg-[#111214] text-white shadow-none">
            <CardHeader className="gap-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px_340px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
                  <Input
                    className="h-12 rounded-2xl border-white/10 bg-[#1a1b1f] pl-11 text-white placeholder:text-white/35"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 w-full rounded-2xl border-white/10 bg-[#1a1b1f] text-white">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="warming">Warming</SelectItem>
                    <SelectItem value="attention">Attention</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="h-12 w-full rounded-2xl border-white/10 bg-[#1a1b1f] text-white">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {availableRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="border-white/10">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/55">Domain</TableHead>
                    <TableHead className="text-white/55">Status</TableHead>
                    <TableHead className="text-white/55">Region</TableHead>
                    <TableHead className="text-white/55">Provider</TableHead>
                    <TableHead className="text-white/55">Tracking</TableHead>
                    <TableHead className="text-right text-white/55">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDomains.map((domain) => {
                    const identities = senderIdentities.filter((sender) => sender.domainId === domain.id)

                    return (
                      <TableRow key={domain.id} className="border-white/10 hover:bg-white/[0.03]">
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div className="flex size-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                              <Globe className="size-5 text-emerald-300" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-medium">{domain.name}</p>
                              <p className="text-xs text-white/40">
                                {identities.length} sender identit{identities.length === 1 ? "y" : "ies"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getDomainStatusBadgeClass(domain.status)}>
                            {domain.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/75">{domain.region}</TableCell>
                        <TableCell className="text-white/75">{formatProviderLabel(domain.provider)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTrackingBadgeClass(domain.tracking)}>
                            {domain.tracking}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-white/55">
                          {formatRelativeDate(domain.createdAt)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
