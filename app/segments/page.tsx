"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Plus, Search, Users } from "lucide-react"
import { useContacts, useSegments } from "@/lib/hooks"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function relativeDate(dateString: string) {
  const diffDays = Math.max(
    1,
    Math.round((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24))
  )

  return diffDays === 1 ? "1d ago" : `${diffDays}d ago`
}

function statusBadge(status: string) {
  switch (status) {
    case "subscribed":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
    case "bounced":
      return "border-rose-400/20 bg-rose-500/10 text-rose-200"
    case "complained":
      return "border-amber-400/20 bg-amber-500/10 text-amber-200"
    default:
      return "border-zinc-400/20 bg-zinc-500/10 text-zinc-200"
  }
}

export default function AudiencePage() {
  const { contacts } = useContacts()
  const { segments } = useSegments()
  const [searchQuery, setSearchQuery] = useState("")
  const [contactTypeFilter, setContactTypeFilter] = useState("all")
  const [subscriptionFilter, setSubscriptionFilter] = useState("all")

  const filteredContacts = useMemo(
    () =>
      contacts.filter((contact) => {
        const matchesSearch =
          !searchQuery ||
          [
            contact.email,
            `${contact.firstName} ${contact.lastName}`,
            contact.segments.join(" "),
          ]
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        const matchesType =
          contactTypeFilter === "all" || (contact.contactType ?? "lead") === contactTypeFilter
        const matchesSubscription =
          subscriptionFilter === "all" || contact.subscriptionStatus === subscriptionFilter

        return matchesSearch && matchesType && matchesSubscription
      }),
    [contactTypeFilter, contacts, searchQuery, subscriptionFilter]
  )

  const subscribers = contacts.filter((contact) => contact.subscriptionStatus === "subscribed").length
  const unsubscribers = contacts.filter((contact) => contact.subscriptionStatus === "unsubscribed").length

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Audience</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button className="rounded-xl bg-white text-black hover:bg-white/90" asChild>
            <Link href="/contacts/new">
              <Plus className="size-4" />
              Add contacts
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[#050505] px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-semibold tracking-tight">Audience</h1>
            <p className="max-w-3xl text-sm text-white/55">
              Contacts live in the database, sales creates manual slices as segments, and broadcasts target those segments directly.
            </p>
          </div>

          <Tabs defaultValue="contacts" className="space-y-8">
            <TabsList className="h-auto w-fit gap-2 rounded-full border border-white/10 bg-[#111214] p-1">
              <TabsTrigger value="contacts" className="rounded-full px-5 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Contacts
              </TabsTrigger>
              <TabsTrigger value="properties" className="rounded-full px-5 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Properties
              </TabsTrigger>
              <TabsTrigger value="segments" className="rounded-full px-5 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Segments
              </TabsTrigger>
              <TabsTrigger value="topics" className="rounded-full px-5 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Topics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contacts" className="m-0 space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-white/10 bg-transparent text-white shadow-none">
                  <CardContent className="pt-6">
                    <p className="text-sm uppercase tracking-[0.18em] text-white/40">All contacts</p>
                    <p className="mt-2 text-4xl font-semibold">{contacts.length}</p>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-transparent text-white shadow-none">
                  <CardContent className="pt-6">
                    <p className="text-sm uppercase tracking-[0.18em] text-white/40">Subscribers</p>
                    <p className="mt-2 text-4xl font-semibold">{subscribers}</p>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-transparent text-white shadow-none">
                  <CardContent className="pt-6">
                    <p className="text-sm uppercase tracking-[0.18em] text-white/40">Unsubscribers</p>
                    <p className="mt-2 text-4xl font-semibold">{unsubscribers}</p>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-transparent text-white shadow-none">
                  <CardContent className="pt-6">
                    <p className="text-sm uppercase tracking-[0.18em] text-white/40">Segments in use</p>
                    <p className="mt-2 text-4xl font-semibold">{segments.length}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-white/10 bg-[#111214] text-white shadow-none">
                <CardContent className="space-y-4 pt-6">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px_320px]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
                      <Input
                        className="h-12 rounded-2xl border-white/10 bg-[#1a1b1f] pl-11 text-white placeholder:text-white/35"
                        placeholder="Search by name, email, or multiple emails..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                      />
                    </div>
                    <Select value={contactTypeFilter} onValueChange={setContactTypeFilter}>
                      <SelectTrigger className="h-12 w-full rounded-2xl border-white/10 bg-[#1a1b1f] text-white">
                        <SelectValue placeholder="All contacts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All contacts</SelectItem>
                        <SelectItem value="lead">Leads</SelectItem>
                        <SelectItem value="client">Clients</SelectItem>
                        <SelectItem value="subscriber">Subscribers</SelectItem>
                        <SelectItem value="delegate">Delegates</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                      <SelectTrigger className="h-12 w-full rounded-2xl border-white/10 bg-[#1a1b1f] text-white">
                        <SelectValue placeholder="All subscriptions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All subscriptions</SelectItem>
                        <SelectItem value="subscribed">Subscribed</SelectItem>
                        <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                        <SelectItem value="bounced">Bounced</SelectItem>
                        <SelectItem value="complained">Complained</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Table>
                    <TableHeader className="border-white/10">
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-white/55">Email</TableHead>
                        <TableHead className="text-white/55">Segments</TableHead>
                        <TableHead className="text-white/55">Status</TableHead>
                        <TableHead className="text-right text-white/55">Added</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContacts.map((contact) => (
                        <TableRow key={contact.id} className="border-white/10 hover:bg-white/[0.03]">
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">
                                {contact.email}, {contact.firstName} {contact.lastName}
                              </p>
                              <p className="text-xs text-white/40">{contact.company}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {contact.segments.slice(0, 2).map((segment) => (
                                <Badge key={segment} variant="outline" className="border-white/10 bg-white/[0.03] text-white/75">
                                  {segment}
                                </Badge>
                              ))}
                              {contact.segments.length > 2 && (
                                <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-white/50">
                                  +{contact.segments.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusBadge(contact.subscriptionStatus)}>
                              {contact.subscriptionStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-white/50">
                            {relativeDate(contact.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="segments" className="m-0">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {segments.map((segment) => (
                  <Link key={segment.id} href={`/segments/${segment.id}`}>
                    <Card className="h-full border-white/10 bg-[#111214] text-white shadow-none transition-colors hover:bg-white/[0.03]">
                      <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{segment.name}</p>
                            <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-white/65 capitalize">
                              {segment.segmentKind ?? "manual"}
                            </Badge>
                          </div>
                          <p className="text-sm text-white/50">{segment.description}</p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/40">Contacts</span>
                          <span className="font-medium text-white">{segment.contactCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/40">Updated</span>
                          <span className="font-medium text-white">{relativeDate(segment.updatedAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="properties" className="m-0">
              <Card className="border-white/10 bg-[#111214] text-white shadow-none">
                <CardContent className="grid gap-4 pt-6 md:grid-cols-2 xl:grid-cols-4">
                  {["Company", "Country", "Industry", "Owner", "Lead source", "Brochure status", "Contact type", "Reply status"].map((property) => (
                    <div key={property} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                      <p className="text-sm font-medium">{property}</p>
                      <p className="mt-2 text-sm text-white/50">
                        Used by sellers to build segments such as `evento-roma-1`, `evento-roma-2` and other manual audience slices.
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="topics" className="m-0">
              <Card className="border-white/10 bg-[#111214] text-white shadow-none">
                <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
                  <Users className="size-8 text-white/30" />
                  <div className="space-y-1">
                    <p className="font-medium">Topics are not active yet</p>
                    <p className="max-w-2xl text-sm text-white/50">
                      For EtapaHub the real targeting happens on segments built by sales from the CRM database, so topics stay out of the critical path for now.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}
