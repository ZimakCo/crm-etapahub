"use client"

import { useState } from "react"
import Link from "next/link"
import { useRegistrations } from "@/lib/hooks"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Search,
  ClipboardList,
  Users,
  Building2,
  Calendar,
} from "lucide-react"
import type { RegistrationStatus, RegistrationTicketType } from "@/lib/types"

const statusColors: Record<RegistrationStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  waitlist: "bg-blue-100 text-blue-700",
}

const ticketTypeColors: Record<RegistrationTicketType, string> = {
  standard: "bg-muted text-muted-foreground",
  vip: "bg-purple-100 text-purple-700",
  speaker: "bg-blue-100 text-blue-700",
  sponsor: "bg-amber-100 text-amber-700",
  exhibitor: "bg-green-100 text-green-700",
  press: "bg-cyan-100 text-cyan-700",
  staff: "bg-gray-100 text-gray-500",
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export default function RegistrationsPage() {
  const { registrations, isLoading } = useRegistrations()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calculate summary stats
  const totalRegistrations = registrations.length
  const confirmedRegistrations = registrations.filter(r => r.status === 'confirmed').length
  const totalAttendees = registrations.reduce((sum, r) => sum + r.quantity, 0)
  const totalRevenue = registrations.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + r.totalAmount, 0)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Registrations</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/registrations/new">
              <Plus className="mr-2 size-4" />
              New Registration
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Card className="border-dashed">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Registrations are the records that tie together an event, the main contact, the billing company and the future invoice. They are not the same as simple attendee presence.
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                <ClipboardList className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{totalRegistrations}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <Calendar className="size-4 text-green-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold text-green-600">{confirmedRegistrations}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                <Users className="size-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold text-blue-600">{totalAttendees}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <Building2 className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{formatCurrency(totalRevenue, 'EUR')}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search registrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="waitlist">Waitlist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Registrations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Event Registrations</CardTitle>
              <CardDescription>
                Manage event enrollments, attendee counts and invoice readiness.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration ID</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Ticket Type</TableHead>
                      <TableHead>Attendees</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Link 
                            href={`/registrations/${registration.id}`}
                            className="font-mono text-sm text-primary hover:underline"
                          >
                            {registration.id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link 
                            href={`/events/${registration.eventId}`}
                            className="font-medium hover:text-primary hover:underline"
                          >
                            {registration.eventName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{registration.contactName}</div>
                          <div className="text-xs text-muted-foreground">{registration.contactEmail}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{registration.company.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {registration.company.city}, {registration.company.country}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={ticketTypeColors[registration.ticketType]}>
                            {registration.ticketType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="size-3 text-muted-foreground" />
                            <span>{registration.quantity}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(registration.totalAmount, registration.currency)}
                        </TableCell>
                        <TableCell>
                          {registration.invoiceId ? (
                            <Link 
                              href={`/billing/${registration.invoiceId}`}
                              className="text-xs font-mono text-primary hover:underline"
                            >
                              {registration.invoiceId}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusColors[registration.status]}>
                            {registration.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredRegistrations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No registrations found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
