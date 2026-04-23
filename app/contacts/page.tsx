"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { FileText, MessageSquare, ShieldCheck, Users } from "lucide-react"
import { toast } from "sonner"
import {
  addContactsToSegment,
  bulkAddTagsToContacts,
  createContactTag,
  createSegment,
  deleteContacts,
} from "@/lib/crm-repository"
import { useContact, useContactTags, useContactsPage, useSegments } from "@/lib/hooks"
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
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Contact, ContactSort } from "@/lib/types"

const defaultFilters: ContactsToolbarFilters = {
  subscriptionStatus: "all",
  emailStatus: "all",
  outreachStatus: "all",
  brochureStatus: "all",
  ownerScope: "all",
  segmentId: "all",
  tag: "",
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs)
    return () => window.clearTimeout(timeoutId)
  }, [delayMs, value])

  return debouncedValue
}

function ContactsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const contactIdParam = searchParams.get("contactId")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<ContactsToolbarFilters>(defaultFilters)
  const [sort, setSort] = useState<ContactSort>({ field: "lastName", direction: "asc" })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 250)

  const query = useMemo(
    () => ({
      filters: {
        searchQuery: debouncedSearchQuery,
        subscriptionStatus: filters.subscriptionStatus,
        emailStatus: filters.emailStatus,
        outreachStatus: filters.outreachStatus,
        brochureStatus: filters.brochureStatus,
        ownerScope: filters.ownerScope,
        segmentId: filters.segmentId === "all" ? undefined : filters.segmentId,
        tag: filters.tag,
      },
      sort,
      page,
      pageSize,
    }),
    [debouncedSearchQuery, filters, page, pageSize, sort]
  )

  const { result, isLoading, mutate: mutateContacts } = useContactsPage(query)
  const { contact: routedContact } = useContact(contactIdParam)
  const { tags, mutate: mutateContactTags } = useContactTags()
  const { segments, mutate: mutateSegments } = useSegments()
  const contacts = result.contacts
  const pageStart = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1
  const pageEnd = result.total === 0 ? 0 : pageStart + contacts.length - 1
  const activeSelectedContact = routedContact ?? selectedContact

  const syncContactParam = (contactId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (contactId) {
      params.set("contactId", contactId)
    } else {
      params.delete("contactId")
    }

    const queryString = params.toString()
    router.replace(queryString ? `/contacts?${queryString}` : "/contacts", { scroll: false })
  }

  const handleContactOpen = (contact: Contact) => {
    setSelectedContact(contact)
    syncContactParam(contact.id)
  }

  const summaryCards = [
    {
      title: "Subscribed",
      value: contacts.filter((contact) => contact.subscriptionStatus === "subscribed").length,
      description: "Reachable contacts on the current page",
      icon: Users,
    },
    {
      title: "Replies",
      value: contacts.filter((contact) => contact.hasReplied || contact.lastReplyAt).length,
      description: "Conversation activity visible on this page",
      icon: MessageSquare,
    },
    {
      title: "Brochure Requests",
      value: contacts.filter((contact) => contact.brochureStatus === "requested").length,
      description: "Brochure queue count on the current page",
      icon: FileText,
    },
    {
      title: "In Communication",
      value: contacts.filter((contact) =>
        ["in_communication", "in_sequence", "replied", "interested"].includes(contact.outreachStatus)
      ).length,
      description: "Contacts actively worked by EtapaHub staff on this page",
      icon: ShieldCheck,
    },
  ]

  const clearSelection = () => setSelectedRows(new Set())

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setPage(1)
    clearSelection()
  }

  const handleFiltersChange = (nextFilters: ContactsToolbarFilters) => {
    setFilters(nextFilters)
    setPage(1)
    clearSelection()
  }

  const handleSortChange = (nextSort: ContactSort) => {
    setSort(nextSort)
    clearSelection()
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    clearSelection()
  }

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize)
    setPage(1)
    clearSelection()
  }

  const handleAddTags = async (tags: string[]) => {
    const selectedIds = Array.from(selectedRows)
    await bulkAddTagsToContacts(selectedIds, tags)
    await Promise.all([mutateContacts(), mutateContactTags()])
    clearSelection()
    toast.success(`Updated ${selectedIds.length} contact${selectedIds.length === 1 ? "" : "s"}`)
  }

  const handleCreateCustomTag = async (name: string) => {
    const tag = await createContactTag(name)
    await mutateContactTags()
    toast.success(`Created tag ${tag.name}`)
    return tag
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

    await Promise.all([mutateContacts(), mutateSegments(), mutateContactTags()])
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
    await Promise.all([mutateContacts(), mutateSegments(), mutateContactTags()])

    if (activeSelectedContact && selectedIds.includes(activeSelectedContact.id)) {
      setSelectedContact(null)
      syncContactParam(null)
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
                  : `${result.total.toLocaleString()} contacts matching the current workspace filters`}
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
            onSearchChange={handleSearchChange}
            selectedCount={selectedRows.size}
            onClearSelection={clearSelection}
            filters={filters}
            onApplyFilters={handleFiltersChange}
            segments={segments}
            availableTags={tags}
            onAddTags={handleAddTags}
            onCreateCustomTag={handleCreateCustomTag}
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
              contacts={contacts}
              sort={sort}
              onSortChange={handleSortChange}
              selectedRows={selectedRows}
              onSelectedRowsChange={setSelectedRows}
              onRowClick={handleContactOpen}
            />
          )}
        </div>

        <div
          data-testid="contacts-pagination"
          className="flex flex-col gap-3 border-t border-border px-4 py-3 md:flex-row md:items-center md:justify-between"
        >
          <div className="text-sm text-muted-foreground">
            {result.total === 0
              ? "No contacts found for the current filters"
              : `Showing ${pageStart.toLocaleString()}-${pageEnd.toLocaleString()} of ${result.total.toLocaleString()} contacts`}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="h-8 w-[88px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={result.page <= 1}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, result.page - 1))}
                disabled={result.page <= 1}
              >
                Previous
              </Button>
              <span className="min-w-[110px] text-center text-sm text-muted-foreground">
                Page {result.page.toLocaleString()} of {result.totalPages.toLocaleString()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(result.totalPages, result.page + 1))}
                disabled={result.page >= result.totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(result.totalPages)}
                disabled={result.page >= result.totalPages}
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <ContactDetailSheet
        contact={activeSelectedContact}
        open={!!activeSelectedContact}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedContact(null)
            syncContactParam(null)
          }
        }}
        availableTags={tags}
        onCreateCustomTag={handleCreateCustomTag}
      />
    </>
  )
}

export default function ContactsPage() {
  return (
    <Suspense fallback={<main className="flex flex-1 flex-col overflow-hidden p-4" />}>
      <ContactsPageContent />
    </Suspense>
  )
}
