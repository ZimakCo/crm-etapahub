"use client"

import { useEffect, useState } from "react"
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
import type { Contact, Segment } from "@/lib/types"

export interface ContactsToolbarFilters {
  subscriptionStatus: "all" | Contact["subscriptionStatus"]
  emailStatus: "all" | Contact["emailStatus"]
  brochureStatus: "all" | Contact["brochureStatus"]
  ownerScope: "all" | "assigned" | "unassigned"
  segmentId: string
  tagQuery: string
}

interface ContactsToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCount: number
  onClearSelection: () => void
  filters: ContactsToolbarFilters
  onApplyFilters: (filters: ContactsToolbarFilters) => void
  segments: Segment[]
  onAddTags: (tags: string[]) => Promise<void>
  onAddToSegment: (input: { segmentId?: string; name?: string; description?: string }) => Promise<void>
  onCreateCampaignSelection: (segmentName: string) => Promise<void>
  onDeleteSelection: () => Promise<void>
}

const defaultFilters: ContactsToolbarFilters = {
  subscriptionStatus: "all",
  emailStatus: "all",
  brochureStatus: "all",
  ownerScope: "all",
  segmentId: "all",
  tagQuery: "",
}

export function ContactsToolbar({
  searchQuery,
  onSearchChange,
  selectedCount,
  onClearSelection,
  filters,
  onApplyFilters,
  segments,
  onAddTags,
  onAddToSegment,
  onCreateCampaignSelection,
  onDeleteSelection,
}: ContactsToolbarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [campaignOpen, setCampaignOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [segmentOpen, setSegmentOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftFilters, setDraftFilters] = useState<ContactsToolbarFilters>(filters)
  const [campaignSegmentName, setCampaignSegmentName] = useState("Selected Contacts Broadcast")
  const [tagsValue, setTagsValue] = useState("")
  const [selectedSegmentId, setSelectedSegmentId] = useState("__new__")
  const [newSegmentName, setNewSegmentName] = useState("Selected Contacts")
  const [newSegmentDescription, setNewSegmentDescription] = useState(
    "Working segment generated from a manual contact selection."
  )

  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  const resetFilters = () => {
    setDraftFilters(defaultFilters)
    onApplyFilters(defaultFilters)
    setFiltersOpen(false)
  }

  const handleApplyFilters = () => {
    onApplyFilters(draftFilters)
    setFiltersOpen(false)
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
    const parsedTags = tagsValue
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)

    if (parsedTags.length === 0) {
      toast.error("Add at least one tag")
      return
    }

    setIsSubmitting(true)
    try {
      await onAddTags(parsedTags)
      setTagsOpen(false)
      setTagsValue("")
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
              description: newSegmentDescription.trim() || "Manual segment created from the contacts workspace.",
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-9"
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => setFiltersOpen(true)}>
            <Filter className="size-4" />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-2">
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

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Filters</DialogTitle>
            <DialogDescription>Apply workspace filters without changing the search query.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Subscription</Label>
                <Select
                  value={draftFilters.subscriptionStatus}
                  onValueChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      subscriptionStatus: value as ContactsToolbarFilters["subscriptionStatus"],
                    }))
                  }
                >
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label>Email status</Label>
                <Select
                  value={draftFilters.emailStatus}
                  onValueChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      emailStatus: value as ContactsToolbarFilters["emailStatus"],
                    }))
                  }
                >
                  <SelectTrigger>
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
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Brochure queue</Label>
                <Select
                  value={draftFilters.brochureStatus}
                  onValueChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      brochureStatus: value as ContactsToolbarFilters["brochureStatus"],
                    }))
                  }
                >
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label>Owner</Label>
                <Select
                  value={draftFilters.ownerScope}
                  onValueChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      ownerScope: value as ContactsToolbarFilters["ownerScope"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All owners</SelectItem>
                    <SelectItem value="assigned">Assigned only</SelectItem>
                    <SelectItem value="unassigned">Unassigned only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Segment</Label>
                <Select
                  value={draftFilters.segmentId}
                  onValueChange={(value) =>
                    setDraftFilters((current) => ({ ...current, segmentId: value }))
                  }
                >
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label htmlFor="tagQuery">Tag contains</Label>
                <Input
                  id="tagQuery"
                  value={draftFilters.tagQuery}
                  onChange={(event) =>
                    setDraftFilters((current) => ({ ...current, tagQuery: event.target.value }))
                  }
                  placeholder="vip, webinar, seller-a"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <DialogDescription>Add one or more comma-separated tags to the selected contacts.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="bulkTags">Tags</Label>
            <Input
              id="bulkTags"
              value={tagsValue}
              onChange={(event) => setTagsValue(event.target.value)}
              placeholder="vip, milan-2026, brochure-priority"
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
