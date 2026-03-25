"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, MessageSquare, ShieldCheck, Users } from "lucide-react"
import { toast } from "sonner"
import {
  addContactsToSegment,
  bulkAddTagsToContacts,
  createSegment,
  deleteContacts,
} from "@/lib/crm-repository"
import { useContacts, useSegments } from "@/lib/hooks"
import { ContactsTable } from "@/components/contacts/contacts-table"
import {
  ContactsToolbar,
  type ContactsToolbarFilters,
} from "@/components/contacts/contacts-toolbar"
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

const defaultFilters: ContactsToolbarFilters = {
  subscriptionStatus: "all",
  emailStatus: "all",
  brochureStatus: "all",
  ownerScope: "all",
  segmentId: "all",
  tagQuery: "",
}

export default function ContactsPage() {
  const router = useRouter()
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<ContactsToolbarFilters>(defaultFilters)
  const [sort, setSort] = useState<ContactSort>({ field: "lastName", direction: "asc" })
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const { contacts, isLoading, mutate: mutateContacts } = useContacts([], sort)
  const { segments, mutate: mutateSegments } = useSegments()

  const selectedSegmentName =
    filters.segmentId === "all"
      ? null
      : segments.find((segment) => segment.id === filters.segmentId)?.name ?? null

  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const tagQuery = filters.tagQuery.trim().toLowerCase()

    return contacts.filter((contact) => {
      const matchesSearch =
        query.length === 0 ||
        contact.firstName.toLowerCase().includes(query) ||
        contact.lastName.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.company.toLowerCase().includes(query) ||
        contact.jobTitle.toLowerCase().includes(query)

      const matchesSubscription =
        filters.subscriptionStatus === "all" ||
        contact.subscriptionStatus === filters.subscriptionStatus

      const matchesEmailStatus =
        filters.emailStatus === "all" || contact.emailStatus === filters.emailStatus

      const matchesBrochureStatus =
        filters.brochureStatus === "all" ||
        contact.brochureStatus === filters.brochureStatus

      const matchesOwner =
        filters.ownerScope === "all" ||
        (filters.ownerScope === "assigned" && Boolean(contact.ownerName)) ||
        (filters.ownerScope === "unassigned" && !contact.ownerName)

      const matchesSegment =
        !selectedSegmentName || contact.segments.includes(selectedSegmentName)

      const matchesTag =
        tagQuery.length === 0 ||
        contact.tags.some((tag) => tag.toLowerCase().includes(tagQuery))

      return (
        matchesSearch &&
        matchesSubscription &&
        matchesEmailStatus &&
        matchesBrochureStatus &&
        matchesOwner &&
        matchesSegment &&
        matchesTag
      )
    })
  }, [contacts, filters, searchQuery, selectedSegmentName])

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

  const clearSelection = () => setSelectedRows(new Set())

  const handleAddTags = async (tags: string[]) => {
    const selectedIds = Array.from(selectedRows)
    await bulkAddTagsToContacts(selectedIds, tags)
    await mutateContacts()
    clearSelection()
    toast.success(`Updated ${selectedIds.length} contact${selectedIds.length === 1 ? "" : "s"}`)
  }

  const handleAddToSegment = async (input: {
    segmentId?: string
    name?: string
    description?: string
  }) => {
    const selectedIds = Array.from(selectedRows)
    let segmentName = ""

    if (input.segmentId) {
      const targetSegment = segments.find((segment) => segment.id === input.segmentId)
      await addContactsToSegment(selectedIds, input.segmentId)
      segmentName = targetSegment?.name ?? "segment"
    } else {
      const createdSegment = await createSegment({
        name: input.name ?? "Selected Contacts",
        description: input.description ?? "Manual segment created from the contacts workspace.",
        segmentKind: "manual",
        contactIds: selectedIds,
      })
      segmentName = createdSegment.name
    }

    await Promise.all([mutateContacts(), mutateSegments()])
    clearSelection()
    toast.success(`Assigned ${selectedIds.length} contact${selectedIds.length === 1 ? "" : "s"} to ${segmentName}`)
  }

  const handleCreateCampaignSelection = async (segmentName: string) => {
    const selectedIds = Array.from(selectedRows)
    const segment = await createSegment({
      name: segmentName,
      description: `Manual campaign selection created from ${selectedIds.length} selected contacts.`,
      segmentKind: "manual",
      contactIds: selectedIds,
    })

    await Promise.all([mutateContacts(), mutateSegments()])
    clearSelection()
    toast.success("Campaign selection prepared")
    router.push(`/broadcasts/new?segmentId=${segment.id}`)
  }

  const handleDeleteSelection = async () => {
    const selectedIds = Array.from(selectedRows)
    await deleteContacts(selectedIds)
    await Promise.all([mutateContacts(), mutateSegments()])

    if (selectedContact && selectedIds.includes(selectedContact.id)) {
      setSelectedContact(null)
    }

    clearSelection()
    toast.success(`Deleted ${selectedIds.length} contact${selectedIds.length === 1 ? "" : "s"}`)
  }

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
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? "Loading..."
                  : `${filteredContacts.length.toLocaleString()} contacts across CRM, campaigns and event folders`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-lg" />
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
            onClearSelection={clearSelection}
            filters={filters}
            onApplyFilters={setFilters}
            segments={segments}
            onAddTags={handleAddTags}
            onAddToSegment={handleAddToSegment}
            onCreateCampaignSelection={handleCreateCampaignSelection}
            onDeleteSelection={handleDeleteSelection}
          />
        </div>

        <div className="flex-1 overflow-hidden px-4 pb-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-md" />
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

      <ContactDetailSheet
        contact={selectedContact}
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
      />
    </>
  )
}
