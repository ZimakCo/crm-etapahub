"use client"

import { useState } from "react"
import { FileText, MessageSquare, ShieldCheck, Users } from "lucide-react"
import { useContacts } from "@/lib/hooks"
import { ContactsTable } from "@/components/contacts/contacts-table"
import { ContactsToolbar } from "@/components/contacts/contacts-toolbar"
import { ContactDetailSheet } from "@/components/contacts/contact-detail-sheet"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Contact, ContactSort } from "@/lib/types"

export default function ContactsPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sort, setSort] = useState<ContactSort>({ field: "lastName", direction: "asc" })
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  
  const { contacts, isLoading } = useContacts([], sort)

  // Filter contacts by search query
  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      contact.firstName.toLowerCase().includes(query) ||
      contact.lastName.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.company.toLowerCase().includes(query) ||
      contact.jobTitle.toLowerCase().includes(query)
    )
  })

  const summaryCards = [
    {
      title: "Subscribed",
      value: filteredContacts.filter((contact) => contact.subscriptionStatus === "subscribed").length,
      description: "Reachable contacts currently usable in batches",
      icon: Users,
    },
    {
      title: "Replies",
      value: filteredContacts.filter((contact) => contact.hasReplied || contact.lastReplyAt).length,
      description: "Contacts with real conversation activity",
      icon: MessageSquare,
    },
    {
      title: "Brochure Requests",
      value: filteredContacts.filter((contact) => contact.brochureStatus === "requested").length,
      description: "Manual brochure follow-up queue",
      icon: FileText,
    },
    {
      title: "Owned",
      value: filteredContacts.filter((contact) => Boolean(contact.ownerName)).length,
      description: "Contacts already assigned to a commercial owner",
      icon: ShieldCheck,
    },
  ]

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Contacts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-col gap-4 p-4">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${filteredContacts.length.toLocaleString()} contacts across CRM, campaigns and event folders`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <Card key={card.title}>
                  <CardContent className="flex items-start justify-between gap-4 pt-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                      <p className="text-2xl font-semibold">{card.value.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{card.description}</p>
                    </div>
                    <div className="rounded-xl bg-muted p-3">
                      <card.icon className="size-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <ContactsToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCount={selectedRows.size}
            onClearSelection={() => setSelectedRows(new Set())}
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden px-4 pb-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <ContactsTable
              contacts={filteredContacts}
              sort={sort}
              onSortChange={setSort}
              selectedRows={selectedRows}
              onSelectedRowsChange={setSelectedRows}
              onRowClick={setSelectedContact}
            />
          )}
        </div>
      </main>

      {/* Contact Detail Sheet */}
      <ContactDetailSheet
        contact={selectedContact}
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
      />
    </>
  )
}
