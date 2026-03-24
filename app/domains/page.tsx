"use client"

import { useMemo, useState } from "react"
import { Globe, PencilLine, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { createEmailDomain, updateEmailDomain } from "@/lib/crm-repository"
import {
  formatProviderLabel,
  getDomainStatusBadgeClass,
  getTrackingBadgeClass,
} from "@/lib/email-ops"
import { useEmailDomains, useSenderIdentities } from "@/lib/hooks"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import type { EmailDomainProfile } from "@/lib/types"

function formatRelativeDate(dateString: string) {
  const diffDays = Math.max(
    1,
    Math.round((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24))
  )

  return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`
}

const defaultForm = {
  name: "",
  provider: "resend" as EmailDomainProfile["provider"],
  status: "verified" as EmailDomainProfile["status"],
  region: "",
  tracking: "enabled" as EmailDomainProfile["tracking"],
  notes: "",
}

export default function DomainsPage() {
  const { domains, mutate } = useEmailDomains()
  const { senderIdentities } = useSenderIdentities()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<EmailDomainProfile | null>(null)
  const [formData, setFormData] = useState(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredDomains = useMemo(
    () =>
      domains.filter((domain) => {
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
    [domains, regionFilter, searchQuery, statusFilter]
  )

  const availableRegions = Array.from(new Set(domains.map((domain) => domain.region))).filter(Boolean)

  const openCreateDialog = () => {
    setEditingDomain(null)
    setFormData(defaultForm)
    setDialogOpen(true)
  }

  const openEditDialog = (domain: EmailDomainProfile) => {
    setEditingDomain(domain)
    setFormData({
      name: domain.name,
      provider: domain.provider,
      status: domain.status,
      region: domain.region,
      tracking: domain.tracking,
      notes: domain.notes ?? "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      if (editingDomain) {
        await updateEmailDomain(editingDomain.id, formData)
        toast.success("Domain updated")
      } else {
        await createEmailDomain(formData)
        toast.success("Domain added")
      }
      await mutate()
      setDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast.error("Could not save the domain")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Domains</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button onClick={openCreateDialog}>
            <Plus className="size-4" />
            Add domain
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_14rem)] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Domains</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Verified sending domains behind your sender identities. Tracking and provider health live here, while the broadcast chooses one mailbox on top of this layer.
            </p>
          </div>

          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search domains"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="warming">Warming</SelectItem>
                    <SelectItem value="attention">Attention</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All regions</SelectItem>
                    {availableRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                    <TableHead className="w-[80px] text-right">Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDomains.map((domain) => {
                    const identities = senderIdentities.filter((sender) => sender.domainId === domain.id)

                    return (
                      <TableRow key={domain.id}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div className="flex size-11 items-center justify-center rounded-2xl border bg-muted/30">
                              <Globe className="size-5 text-foreground" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-medium">{domain.name}</p>
                              <p className="text-xs text-muted-foreground">
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
                        <TableCell className="text-muted-foreground">{domain.region}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatProviderLabel(domain.provider)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTrackingBadgeClass(domain.tracking)}>
                            {domain.tracking}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatRelativeDate(domain.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(domain)}>
                            <PencilLine className="size-4" />
                          </Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDomain ? "Edit domain" : "Add domain"}</DialogTitle>
            <DialogDescription>
              Configure the sending domain and its provider health.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="domain-name">Domain</Label>
              <Input
                id="domain-name"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                placeholder="mail.etapa-conferences.com"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) =>
                    setFormData((current) => ({
                      ...current,
                      provider: value as EmailDomainProfile["provider"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resend">Resend</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                    <SelectItem value="kumomta">KumoMTA</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Region</Label>
                <Input
                  value={formData.region}
                  onChange={(event) => setFormData((current) => ({ ...current, region: event.target.value }))}
                  placeholder="Ireland (eu-west-1)"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((current) => ({
                      ...current,
                      status: value as EmailDomainProfile["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="warming">Warming</SelectItem>
                    <SelectItem value="attention">Attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tracking</Label>
                <Select
                  value={formData.tracking}
                  onValueChange={(value) =>
                    setFormData((current) => ({
                      ...current,
                      tracking: value as EmailDomainProfile["tracking"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain-notes">Notes</Label>
              <Input
                id="domain-notes"
                value={formData.notes}
                onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Used for summit invitations"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {editingDomain ? "Save changes" : "Add domain"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
