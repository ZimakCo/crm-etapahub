"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Filter,
  LoaderCircle,
  Mail,
  Plus,
  Search,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { toast } from "sonner"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ContactTagInput } from "@/components/contacts/contact-tag-input"
import type { Contact, ContactTag, Segment } from "@/lib/types"

export interface ContactsToolbarFilters {
  subscriptionStatus: "all" | Contact["subscriptionStatus"]
  emailStatus: "all" | Contact["emailStatus"]
  outreachStatus: "all" | Contact["outreachStatus"]
  brochureStatus: "all" | NonNullable<Contact["brochureStatus"]>
  ownerScope: "all" | "assigned" | "unassigned"
  segmentId: string
  tag: string
}

interface ContactsToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCount: number
  onClearSelection: () => void
  filters: ContactsToolbarFilters
  onApplyFilters: (filters: ContactsToolbarFilters) => void
  segments: Segment[]
  availableTags: ContactTag[]
  onAddTags: (tags: string[]) => Promise<void>
  onCreateCustomTag: (name: string) => Promise<ContactTag>
  onAddToSegment: (input: { segmentId?: string; name?: string; description?: string }) => Promise<void>
  onCreateCampaignSelection: (segmentName: string) => Promise<void>
  onDeleteSelection: () => Promise<void>
}

const defaultFilters: ContactsToolbarFilters = {
  subscriptionStatus: "all",
  emailStatus: "all",
  outreachStatus: "all",
  brochureStatus: "all",
  ownerScope: "all",
  segmentId: "all",
  tag: "",
}

export function ContactsToolbar({
  searchQuery,
  onSearchChange,
  selectedCount,
  onClearSelection,
  filters,
  onApplyFilters,
  segments,
  availableTags,
  onAddTags,
  onCreateCustomTag,
  onAddToSegment,
  onCreateCampaignSelection,
  onDeleteSelection,
}: ContactsToolbarProps) {
  const [campaignOpen, setCampaignOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [segmentOpen, setSegmentOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [campaignSegmentName, setCampaignSegmentName] = useState("Selected Contacts Broadcast")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedSegmentId, setSelectedSegmentId] = useState("__new__")
  const [newSegmentName, setNewSegmentName] = useState("Selected Contacts")
  const [newSegmentDescription, setNewSegmentDescription] = useState(
    "Working segment generated from a manual contact selection."
  )

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = []
    const segmentName = segments.find((segment) => segment.id === filters.segmentId)?.name

    if (filters.subscriptionStatus !== "all") {
      labels.push(`Subscription: ${filters.subscriptionStatus.replace("_", " ")}`)
    }

    if (filters.emailStatus !== "all") {
      labels.push(`Email: ${filters.emailStatus.replace("_", " ")}`)
    }

    if (filters.outreachStatus !== "all") {
      labels.push(`Outreach: ${filters.outreachStatus.replaceAll("_", " ")}`)
    }

    if (filters.brochureStatus !== "all") {
      labels.push(`Brochure: ${filters.brochureStatus.replace("_", " ")}`)
    }

    if (filters.ownerScope !== "all") {
      labels.push(`Owner: ${filters.ownerScope}`)
    }

    if (filters.segmentId !== "all" && segmentName) {
      labels.push(`Segment: ${segmentName}`)
    }

    if (filters.tag.trim()) {
      labels.push(`Tag: ${filters.tag.trim()}`)
    }

    return labels
  }, [filters, segments])

  const hasActiveFilters = activeFilterLabels.length > 0

  const updateFilters = (nextFilters: ContactsToolbarFilters) => {
    onApplyFilters(nextFilters)
  }

  const resetFilters = () => {
    updateFilters(defaultFilters)
  }

  const handleCreateCampaignSelection = async () => {
    const trimmedName = campaignSegmentName.trim()

    if (!trimmedName) {
      toast.error("Add a working segment name first")
      return
    }

    setIsSubmitting(true)
    try {
      await onCreateCampaignSelection(trimmedName)
      setCampaignOpen(false)
      setCampaignSegmentName("Selected Contacts Broadcast")
    } catch (error) {
      console.error(error)
      toast.error("Could not prepare the campaign selection")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTags = async () => {
    if (selectedTags.length === 0) {
      toast.error("Add at least one tag")
      return
    }

    setIsSubmitting(true)
    try {
      await onAddTags(selectedTags)
      setTagsOpen(false)
      setSelectedTags([])
    } catch (error) {
      console.error(error)
      toast.error("Could not update the selected contacts")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAssignToSegment = async () => {
    const isCreatingNewSegment = selectedSegmentId === "__new__"

    if (isCreatingNewSegment && !newSegmentName.trim()) {
      toast.error("Provide a segment name")
      return
    }

    if (!isCreatingNewSegment && selectedSegmentId === "all") {
      toast.error("Choose an existing segment or create a new one")
      return
    }

    setIsSubmitting(true)
    try {
      await onAddToSegment(
        isCreatingNewSegment
          ? {
              name: newSegmentName.trim(),
              description:
                newSegmentDescription.trim() ||
                "Manual segment created from the contacts workspace.",
            }
          : { segmentId: selectedSegmentId }
      )
      setSegmentOpen(false)
      setSelectedSegmentId("__new__")
      setNewSegmentName("Selected Contacts")
      setNewSegmentDescription("Working segment generated from a manual contact selection.")
    } catch (error) {
      console.error(error)
      toast.error("Could not assign the selected contacts")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSelection = async () => {
    setIsSubmitting(true)
    try {
      await onDeleteSelection()
      setDeleteOpen(false)
    } catch (error) {
      console.error(error)
      toast.error("Could not delete the selected contacts")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div
        data-testid="contacts-filter-bar"
        className="space-y-4 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Filter className="size-3.5" />
              Live filters
              {hasActiveFilters && (
                <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] tracking-normal">
                  {activeFilterLabels.length} active
                </Badge>
              )}
            </div>

            <div className="relative max-w-xl flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                data-testid="contacts-search-input"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedCount > 0 ? (
              <>
                <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setCampaignOpen(true)}>
                      <Mail className="size-4" />
                      Add to Campaign
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setTagsOpen(true)}>
                      <Tag className="size-4" />
                      Add Tags
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setSegmentOpen(true)}>
                      <Filter className="size-4" />
                      Add to Segment
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onSelect={() => setDeleteOpen(true)}>
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" onClick={onClearSelection}>
                  <X className="size-4" />
                  Clear
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/contacts/import">
                    <Upload className="size-4" />
                    Import
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/contacts/new">
                    <Plus className="size-4" />
                    Add Contact
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(6,minmax(0,1fr))_minmax(0,1.2fr)_auto]">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Subscription
            </Label>
            <Select
              value={filters.subscriptionStatus}
              onValueChange={(value) =>
                updateFilters({
                  ...filters,
                  subscriptionStatus: value as ContactsToolbarFilters["subscriptionStatus"],
                })
              }
            >
              <SelectTrigger data-testid="contacts-filter-subscription" size="sm" className="w-full">
                <SelectValue />
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

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Email Status
            </Label>
            <Select
              value={filters.emailStatus}
              onValueChange={(value) =>
                updateFilters({
                  ...filters,
                  emailStatus: value as ContactsToolbarFilters["emailStatus"],
                })
              }
            >
              <SelectTrigger data-testid="contacts-filter-email-status" size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All email statuses</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
                <SelectItem value="catch-all">Catch-all</SelectItem>
                <SelectItem value="invalid">Invalid</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Outreach
            </Label>
            <Select
              value={filters.outreachStatus}
              onValueChange={(value) =>
                updateFilters({
                  ...filters,
                  outreachStatus: value as ContactsToolbarFilters["outreachStatus"],
                })
              }
            >
              <SelectTrigger data-testid="contacts-filter-outreach" size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All outreach states</SelectItem>
                <SelectItem value="not_contacted">Not contacted</SelectItem>
                <SelectItem value="in_communication">In communication</SelectItem>
                <SelectItem value="in_sequence">In sequence</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="not_interested">Not interested</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Brochure Queue
            </Label>
            <Select
              value={filters.brochureStatus}
              onValueChange={(value) =>
                updateFilters({
                  ...filters,
                  brochureStatus: value as ContactsToolbarFilters["brochureStatus"],
                })
              }
            >
              <SelectTrigger data-testid="contacts-filter-brochure" size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brochure statuses</SelectItem>
                <SelectItem value="not_requested">Not requested</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Owner
            </Label>
            <Select
              value={filters.ownerScope}
              onValueChange={(value) =>
                updateFilters({
                  ...filters,
                  ownerScope: value as ContactsToolbarFilters["ownerScope"],
                })
              }
            >
              <SelectTrigger data-testid="contacts-filter-owner" size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All owners</SelectItem>
                <SelectItem value="assigned">Assigned only</SelectItem>
                <SelectItem value="unassigned">Unassigned only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Segment
            </Label>
            <Select
              value={filters.segmentId}
              onValueChange={(value) =>
                updateFilters({
                  ...filters,
                  segmentId: value,
                })
              }
            >
              <SelectTrigger data-testid="contacts-filter-segment" size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All segments</SelectItem>
                {segments.map((segment) => (
                  <SelectItem key={segment.id} value={segment.id}>
                    {segment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagQuery" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Tag
            </Label>
            <Input
              data-testid="contacts-filter-tag-query"
              id="tagQuery"
              value={filters.tag}
              onChange={(event) =>
                updateFilters({
                  ...filters,
                  tag: event.target.value,
                })
              }
              placeholder="Exact tag match"
              className="h-8"
            />
          </div>

          <div className="flex items-end">
            <Button
              data-testid="contacts-filter-reset"
              variant="outline"
              size="sm"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="w-full xl:w-auto"
            >
              Reset
            </Button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
            {activeFilterLabels.map((label) => (
              <Badge key={label} variant="outline" className="rounded-full px-2.5 py-1">
                {label}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Campaign Selection</DialogTitle>
            <DialogDescription>
              Build a working segment from the selected contacts and open the broadcast composer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="campaignSegmentName">Working segment name</Label>
            <Input
              id="campaignSegmentName"
              value={campaignSegmentName}
              onChange={(event) => setCampaignSegmentName(event.target.value)}
              placeholder="Pharma follow-up shortlist"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCampaignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaignSelection} disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
              Continue to Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tagsOpen} onOpenChange={setTagsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tags</DialogTitle>
            <DialogDescription>
              Apply existing tags or create new custom tags for the selected contacts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="bulkTags">Tags</Label>
            <ContactTagInput
              availableTags={availableTags}
              value={selectedTags}
              onChange={setSelectedTags}
              onCreateTag={onCreateCustomTag}
              inputId="bulkTags"
              inputTestId="contacts-bulk-tags-input"
              placeholder="Search an existing tag or create a new one"
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTags} disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
              Save Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={segmentOpen} onOpenChange={setSegmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Segment</DialogTitle>
            <DialogDescription>
              Attach the selected contacts to an existing segment or create a new manual segment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Target segment</Label>
              <Select value={selectedSegmentId} onValueChange={setSelectedSegmentId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__new__">Create new segment</SelectItem>
                  {segments.map((segment) => (
                    <SelectItem key={segment.id} value={segment.id}>
                      {segment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedSegmentId === "__new__" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="segmentName">Segment name</Label>
                  <Input
                    id="segmentName"
                    value={newSegmentName}
                    onChange={(event) => setNewSegmentName(event.target.value)}
                    placeholder="Broker shortlist"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segmentDescription">Description</Label>
                  <Textarea
                    id="segmentDescription"
                    value={newSegmentDescription}
                    onChange={(event) => setNewSegmentDescription(event.target.value)}
                    rows={4}
                    placeholder="Manual working list created from selected contacts."
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSegmentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignToSegment} disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
              Save Segment Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Contacts</DialogTitle>
            <DialogDescription>
              This permanently removes {selectedCount} contact{selectedCount === 1 ? "" : "s"} from the CRM.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Registrations linked directly to those contacts are removed as well. Invoices keep their billing snapshot.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSelection} disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
              Delete Contacts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
