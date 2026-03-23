"use client"

import { useState } from "react"
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
                {isLoading ? "Loading..." : `${filteredContacts.length.toLocaleString()} contacts`}
              </p>
            </div>
          </div>

          {/* Toolbar */}
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
