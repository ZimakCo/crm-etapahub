"use client"

import Link from "next/link"
import { Search, Plus, Upload, Filter, X, Mail, Tag, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ContactsToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCount: number
  onClearSelection: () => void
}

export function ContactsToolbar({
  searchQuery,
  onSearchChange,
  selectedCount,
  onClearSelection,
}: ContactsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Button */}
        <Button variant="outline" size="sm" onClick={() => toast.info("Advanced filters land in the next phase. Search already works now.")}>
          <Filter className="size-4" />
          Filters
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {/* Bulk Actions (when rows selected) */}
        {selectedCount > 0 ? (
          <>
            <span className="text-sm text-muted-foreground">
              {selectedCount} selected
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info("Bulk campaign actions land in the next phase.")}>
                  <Mail className="size-4" />
                  Add to Campaign
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Bulk tag editing lands in the next phase.")}>
                  <Tag className="size-4" />
                  Add Tags
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Bulk segment actions land in the next phase.")}>
                  <Filter className="size-4" />
                  Add to Segment
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => toast.info("Bulk delete is intentionally disabled in this phase.")}>
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
            {/* Import Button */}
            <Button variant="outline" size="sm" asChild>
              <Link href="/contacts/import">
                <Upload className="size-4" />
                Import
              </Link>
            </Button>

            {/* Add Contact Button */}
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
  )
}
