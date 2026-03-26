"use client"

import { ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, XCircle, AlertCircle, Mail } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Contact, ContactSort } from "@/lib/types"

interface ContactsTableProps {
  contacts: Contact[]
  sort: ContactSort
  onSortChange: (sort: ContactSort) => void
  selectedRows: Set<string>
  onSelectedRowsChange: (rows: Set<string>) => void
  onRowClick: (contact: Contact) => void
}

function getEmailStatusIcon(status: Contact["emailStatus"]) {
  switch (status) {
    case "valid":
      return <CheckCircle2 className="size-3.5 text-success" />
    case "invalid":
      return <XCircle className="size-3.5 text-destructive" />
    case "spam":
      return <AlertCircle className="size-3.5 text-destructive" />
    case "catch-all":
      return <AlertCircle className="size-3.5 text-warning" />
    default:
      return <Mail className="size-3.5 text-muted-foreground" />
  }
}

function getSubscriptionBadge(status: Contact["subscriptionStatus"]) {
  switch (status) {
    case "subscribed":
      return <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">Subscribed</Badge>
    case "unsubscribed":
      return <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">Unsubscribed</Badge>
    case "bounced":
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Bounced</Badge>
    case "complained":
      return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">Complained</Badge>
    default:
      return null
  }
}

function getOutreachBadge(status: Contact["outreachStatus"]) {
  switch (status) {
    case "interested":
      return <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">Interested</Badge>
    case "replied":
      return <Badge variant="outline" className="bg-info/10 text-info border-info/20 text-xs">Replied</Badge>
    case "in_sequence":
      return <Badge variant="outline" className="bg-brand-pink/10 text-brand-pink border-brand-pink/20 text-xs">In sequence</Badge>
    case "in_communication":
      return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">In communication</Badge>
    case "not_interested":
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Not interested</Badge>
    default:
      return <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">Not contacted</Badge>
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function ContactsTable({
  contacts,
  sort,
  onSortChange,
  selectedRows,
  onSelectedRowsChange,
  onRowClick,
}: ContactsTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedRowsChange(new Set(contacts.map((c) => c.id)))
    } else {
      onSelectedRowsChange(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    onSelectedRowsChange(newSelected)
  }

  const handleSort = (field: string) => {
    if (sort.field === field) {
      onSortChange({
        field,
        direction: sort.direction === "asc" ? "desc" : "asc",
      })
    } else {
      onSortChange({ field, direction: "asc" })
    }
  }

  const getSortIcon = (field: string) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
    }
    return sort.direction === "asc" ? (
      <ArrowUp className="size-3.5" />
    ) : (
      <ArrowDown className="size-3.5" />
    )
  }

  const allSelected = contacts.length > 0 && selectedRows.size === contacts.length
  const someSelected = selectedRows.size > 0 && selectedRows.size < contacts.length

  return (
    <div className="rounded-md border border-border">
      <ScrollArea className="h-[calc(100vh-280px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={someSelected ? "data-[state=checked]:bg-primary" : ""}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected
                    }
                  }}
                />
              </TableHead>
              <TableHead className="min-w-[200px]">
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => handleSort("lastName")}
                >
                  Contact
                  {getSortIcon("lastName")}
                </button>
              </TableHead>
              <TableHead className="min-w-[200px]">
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => handleSort("email")}
                >
                  Email
                  {getSortIcon("email")}
                </button>
              </TableHead>
              <TableHead className="min-w-[150px]">
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => handleSort("company")}
                >
                  Company
                  {getSortIcon("company")}
                </button>
              </TableHead>
              <TableHead className="min-w-[150px]">
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => handleSort("jobTitle")}
                >
                  Job Title
                  {getSortIcon("jobTitle")}
                </button>
              </TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[120px]">
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => handleSort("lastActivityAt")}
                >
                  Last Activity
                  {getSortIcon("lastActivityAt")}
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => {
              const initials = `${contact.firstName[0]}${contact.lastName[0]}`
              const isSelected = selectedRows.has(contact.id)

              return (
                <TableRow
                  key={contact.id}
                  className="cursor-pointer"
                  data-state={isSelected ? "selected" : undefined}
                  onClick={() => onRowClick(contact)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectRow(contact.id, !!checked)}
                      aria-label={`Select ${contact.firstName} ${contact.lastName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-gradient-to-br from-brand-pink to-brand-purple text-xs text-primary-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {getOutreachBadge(contact.outreachStatus)}
                          {contact.tags.length > 0 && (
                            <>
                            {contact.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {contact.tags.length > 2 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{contact.tags.length - 2}
                              </span>
                            )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEmailStatusIcon(contact.emailStatus)}
                      <span className="text-sm">{contact.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{contact.company}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {contact.jobTitle}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getSubscriptionBadge(contact.subscriptionStatus)}
                      {contact.ownerName ? (
                        <span className="text-xs text-muted-foreground">{contact.ownerName}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">No owner</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(contact.lastActivityAt)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
