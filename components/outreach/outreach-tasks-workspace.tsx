"use client"

import { useMemo, useState } from "react"
import { ArrowUpDown, Search, SlidersHorizontal } from "lucide-react"
import { useOutreachTasks } from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatPriority, formatShortDate, formatTaskType } from "@/components/outreach/outreach-utils"
import { cn } from "@/lib/utils"

type TaskViewKey = "all" | "call" | "manual_email" | "linkedin" | "overdue" | "mine"
type TaskSortKey = "due_asc" | "due_desc" | "priority"

export function OutreachTasksWorkspace() {
  const { tasks } = useOutreachTasks()
  const [searchValue, setSearchValue] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(true)
  const [activeView, setActiveView] = useState<TaskViewKey>("all")
  const [sortMode, setSortMode] = useState<TaskSortKey>("due_asc")
  const referenceNow = new Date("2026-03-26T12:00:00Z").getTime()
  const primaryOwnerName = tasks[0]?.ownerName ?? "EtapaHub seller"

  const taskViews = [
    { key: "all" as const, label: "All tasks", count: tasks.length },
    { key: "call" as const, label: "Call tasks", count: tasks.filter((task) => task.type === "call").length },
    {
      key: "manual_email" as const,
      label: "Email tasks",
      count: tasks.filter((task) => task.type === "manual_email").length,
    },
    { key: "linkedin" as const, label: "LinkedIn tasks", count: tasks.filter((task) => task.type === "linkedin").length },
    {
      key: "overdue" as const,
      label: "Overdue tasks",
      count: tasks.filter((task) => new Date(task.dueAt).getTime() < referenceNow).length,
    },
    {
      key: "mine" as const,
      label: "All your tasks",
      count: tasks.filter((task) => task.ownerName === primaryOwnerName).length,
    },
  ]

  const filteredTasks = useMemo(() => {
    const priorityRank = { high: 0, medium: 1, low: 2 }

    return [...tasks]
      .filter((task) => {
        const query = searchValue.trim().toLowerCase()
        const matchesQuery =
          query.length === 0 ||
          task.title.toLowerCase().includes(query) ||
          task.contactName.toLowerCase().includes(query) ||
          task.company.toLowerCase().includes(query)
        const matchesType = typeFilter === "all" || task.type === typeFilter
        const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
        const matchesView =
          activeView === "all" ||
          (activeView === "call" && task.type === "call") ||
          (activeView === "manual_email" && task.type === "manual_email") ||
          (activeView === "linkedin" && task.type === "linkedin") ||
          (activeView === "overdue" && new Date(task.dueAt).getTime() < referenceNow) ||
          (activeView === "mine" && task.ownerName === primaryOwnerName)

        return matchesQuery && matchesType && matchesPriority && matchesView
      })
      .sort((left, right) => {
        if (sortMode === "priority") {
          return priorityRank[left.priority] - priorityRank[right.priority]
        }

        const leftTime = new Date(left.dueAt).getTime()
        const rightTime = new Date(right.dueAt).getTime()
        return sortMode === "due_asc" ? leftTime - rightTime : rightTime - leftTime
      })
  }, [activeView, priorityFilter, primaryOwnerName, referenceNow, searchValue, sortMode, tasks, typeFilter])

  const activeFilterCount = [typeFilter !== "all", priorityFilter !== "all", searchValue.trim().length > 0].filter(Boolean).length

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border bg-background shadow-sm">
        <div className="flex min-w-max items-center gap-6 overflow-x-auto border-b px-4">
          {taskViews.map((view) => (
            <button
              type="button"
              key={view.key}
              onClick={() => setActiveView(view.key)}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                activeView === view.key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{view.label}</span>
              <span className="text-xs text-muted-foreground">{view.count}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <Button variant="outline" size="sm" onClick={() => setShowFilters((value) => !value)}>
              <SlidersHorizontal className="size-4" />
              Show filters
              {activeFilterCount > 0 ? <Badge variant="secondary" className="ml-1 rounded-full px-2 py-0">{activeFilterCount}</Badge> : null}
            </Button>

            <div className="relative flex-1 lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search tasks"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ArrowUpDown className="size-4 text-muted-foreground" />
            <Select value={sortMode} onValueChange={(value: TaskSortKey) => setSortMode(value)}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due_asc">Due date</SelectItem>
                <SelectItem value="due_desc">Due date desc</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFilters ? (
          <div className="flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-[220px]">
                  <SelectValue placeholder="All task types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All task types</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="manual_email">Manual email</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="action_item">Action item</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full lg:w-[220px]">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">Visible {filteredTasks.length}</Badge>
              <Badge variant="outline">Owner {primaryOwnerName}</Badge>
            </div>
          </div>
        ) : null}

        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium text-foreground">Seller task queue</p>
          <p className="text-xs text-muted-foreground">Calls, manual emails, LinkedIn touches and action items generated by seller outreach.</p>
        </div>

        <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,0.95fr)_140px_120px_140px] gap-4 border-b bg-muted/25 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:grid">
          <span>Task</span>
          <span>Contact</span>
          <span>Type</span>
          <span>Priority</span>
          <span>Due date</span>
        </div>

        <div>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="grid gap-3 border-b px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.95fr)_140px_120px_140px] lg:items-center lg:gap-4"
              >
                <div>
                  <p className="font-medium text-foreground">{task.title}</p>
                  {task.note ? <p className="mt-1 text-sm text-muted-foreground">{task.note}</p> : null}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="text-foreground">{task.contactName}</p>
                  <p>{task.company}</p>
                  <p className="mt-1 text-xs">{task.sequenceName ?? "Direct 1:1"}</p>
                </div>
                <div>
                  <Badge variant="outline">{formatTaskType(task.type)}</Badge>
                </div>
                <div>
                  <Badge variant="outline">{formatPriority(task.priority)}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="text-foreground">{formatShortDate(task.dueAt)}</p>
                  <p>{task.ownerName}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-sm text-muted-foreground">No tasks match the current view and filters.</div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t px-4 py-3 text-sm text-muted-foreground">
          <Badge variant="outline">Call tasks {tasks.filter((task) => task.type === "call").length}</Badge>
          <Badge variant="outline">Manual email {tasks.filter((task) => task.type === "manual_email").length}</Badge>
          <Badge variant="outline">Overdue {tasks.filter((task) => new Date(task.dueAt).getTime() < referenceNow).length}</Badge>
        </div>
      </div>
    </div>
  )
}
