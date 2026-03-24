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
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "bounced":
      return "border-rose-200 bg-rose-50 text-rose-700"
    case "complained":
      return "border-amber-200 bg-amber-50 text-amber-700"
    default:
      return "border-zinc-200 bg-zinc-100 text-zinc-700"
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
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Audience</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/contacts/new">
              <Plus className="size-4" />
              Add contacts
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_14rem)] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Audience</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Contacts live in the database, sales creates manual slices as segments, and broadcasts target those segments directly.
            </p>
          </div>

          <Tabs defaultValue="contacts" className="space-y-8">
            <TabsList className="h-auto w-fit gap-2 rounded-full border bg-card/90 p-1">
              <TabsTrigger value="contacts" className="rounded-full px-5">
                Contacts
              </TabsTrigger>
              <TabsTrigger value="properties" className="rounded-full px-5">
                Properties
              </TabsTrigger>
              <TabsTrigger value="segments" className="rounded-full px-5">
                Segments
              </TabsTrigger>
              <TabsTrigger value="topics" className="rounded-full px-5">
                Topics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contacts" className="m-0 space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-border/70 bg-card/90 shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">All contacts</p>
                    <p className="mt-2 text-4xl font-semibold">{contacts.length}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-card/90 shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Subscribers</p>
                    <p className="mt-2 text-4xl font-semibold">{subscribers}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-card/90 shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Unsubscribers</p>
                    <p className="mt-2 text-4xl font-semibold">{unsubscribers}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-card/90 shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Segments in use</p>
                    <p className="mt-2 text-4xl font-semibold">{segments.length}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/70 bg-card/90 shadow-sm">
                <CardContent className="space-y-4 pt-6">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px_320px]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="h-12 rounded-2xl pl-11"
                        placeholder="Search by name, email, or multiple emails..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                      />
                    </div>
                    <Select value={contactTypeFilter} onValueChange={setContactTypeFilter}>
                      <SelectTrigger className="h-12 w-full rounded-2xl">
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
                      <SelectTrigger className="h-12 w-full rounded-2xl">
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
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Segments</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Added</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">
                                {contact.email}, {contact.firstName} {contact.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{contact.company}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {contact.segments.slice(0, 2).map((segment) => (
                                <Badge key={segment} variant="outline">
                                  {segment}
                                </Badge>
                              ))}
                              {contact.segments.length > 2 && (
                                <Badge variant="outline" className="text-muted-foreground">
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
                          <TableCell className="text-right text-muted-foreground">
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
                    <Card className="h-full border-border/70 bg-card/90 shadow-sm transition-colors hover:bg-muted/30">
                      <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{segment.name}</p>
                            <Badge variant="outline" className="capitalize">
                              {segment.segmentKind ?? "manual"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{segment.description}</p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Contacts</span>
                          <span className="font-medium">{segment.contactCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Updated</span>
                          <span className="font-medium">{relativeDate(segment.updatedAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="properties" className="m-0">
              <Card className="border-border/70 bg-card/90 shadow-sm">
                <CardContent className="grid gap-4 pt-6 md:grid-cols-2 xl:grid-cols-4">
                  {["Company", "Country", "Industry", "Owner", "Lead source", "Brochure status", "Contact type", "Reply status"].map((property) => (
                    <div key={property} className="rounded-2xl border bg-muted/20 p-4">
                      <p className="text-sm font-medium">{property}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Used by sellers to build segments such as `evento-roma-1`, `evento-roma-2` and other manual audience slices.
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="topics" className="m-0">
              <Card className="border-border/70 bg-card/90 shadow-sm">
                <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
                  <Users className="size-8 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="font-medium">Topics are not active yet</p>
                    <p className="max-w-2xl text-sm text-muted-foreground">
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
