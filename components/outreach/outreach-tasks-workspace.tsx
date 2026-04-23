"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowUpDown, CheckCircle2, Search, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"
import { useSWRConfig } from "swr"
import {
  createOutreachTask,
  updateOutreachTask,
} from "@/lib/outreach-repository"
import {
  useContactsPage,
  useOutreachConversations,
  useOutreachSequences,
  useOutreachTasks,
} from "@/lib/hooks"
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
import { useOutreachRouteState } from "@/components/outreach/use-outreach-route-state"
import { formatPriority, formatShortDate, formatTaskType } from "@/components/outreach/outreach-utils"
import { cn } from "@/lib/utils"
import type { OutreachTaskPriority, OutreachTaskStatus, OutreachTaskType } from "@/lib/types"

type TaskViewKey = "all" | "call" | "manual_email" | "linkedin" | "overdue" | "mine"
type TaskSortKey = "due_asc" | "due_desc" | "priority"

type TaskFormState = {
  title: string
  ownerName: string
  type: OutreachTaskType
  priority: OutreachTaskPriority
  dueAt: string
  note: string
  contactId: string
  sequenceId: string
}

const EMPTY_TASK_FORM: TaskFormState = {
  title: "",
  ownerName: "Clara Rossi",
  type: "call",
  priority: "medium",
  dueAt: "2026-04-24T09:00",
  note: "",
  contactId: "none",
  sequenceId: "none",
}

function toDateTimeLocal(value: string) {
  return value.slice(0, 16)
}

export function OutreachTasksWorkspace() {
  const { mutate } = useSWRConfig()
  const { searchParams, setParams } = useOutreachRouteState()
  const taskIdParam = searchParams.get("taskId") ?? ""
  const newTaskParam = searchParams.get("newTask") === "1"
  const threadIdParam = searchParams.get("threadId") ?? ""
  const sequenceIdParam = searchParams.get("sequenceId") ?? ""
  const contactIdParam = searchParams.get("contactId") ?? ""

  const { tasks } = useOutreachTasks()
  const { sequences } = useOutreachSequences()
  const { conversations } = useOutreachConversations()
  const { result: contactsResult } = useContactsPage({
    page: 1,
    pageSize: 100,
    sort: { field: "lastActivityAt", direction: "desc" },
  })

  const [searchValue, setSearchValue] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(true)
  const [activeView, setActiveView] = useState<TaskViewKey>("all")
  const [sortMode, setSortMode] = useState<TaskSortKey>("due_asc")
  const [taskForm, setTaskForm] = useState<TaskFormState>(EMPTY_TASK_FORM)
  const referenceNow = new Date("2026-04-23T12:00:00Z").getTime()
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
        const matchesThread = !threadIdParam || task.threadId === threadIdParam
        const matchesSequence = !sequenceIdParam || task.sequenceId === sequenceIdParam
        const matchesContact = !contactIdParam || task.contactId === contactIdParam

        return matchesQuery && matchesType && matchesPriority && matchesView && matchesThread && matchesSequence && matchesContact
      })
      .sort((left, right) => {
        if (sortMode === "priority") {
          return priorityRank[left.priority] - priorityRank[right.priority]
        }

        const leftTime = new Date(left.dueAt).getTime()
        const rightTime = new Date(right.dueAt).getTime()
        return sortMode === "due_asc" ? leftTime - rightTime : rightTime - leftTime
      })
  }, [activeView, contactIdParam, priorityFilter, primaryOwnerName, referenceNow, searchValue, sequenceIdParam, sortMode, tasks, threadIdParam, typeFilter])

  const selectedTask = filteredTasks.find((task) => task.id === taskIdParam) ?? filteredTasks[0] ?? null
  const selectedSequence = sequences.find((sequence) => sequence.id === selectedTask?.sequenceId) ?? null
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedTask?.threadId) ?? null
  const selectedContact = contactsResult.contacts.find((contact) => contact.id === selectedTask?.contactId) ?? null

  const activeFilterCount = [
    typeFilter !== "all",
    priorityFilter !== "all",
    searchValue.trim().length > 0,
    Boolean(threadIdParam),
    Boolean(sequenceIdParam),
    Boolean(contactIdParam),
  ].filter(Boolean).length

  const openTask = (taskId: string, taskContactId?: string, taskThreadId?: string, taskSequenceId?: string) => {
    setParams({
      taskId,
      contactId: taskContactId,
      threadId: taskThreadId,
      sequenceId: taskSequenceId,
      newTask: null,
    })
  }

  const clearContext = () => {
    setParams({
      taskId: selectedTask?.id ?? null,
      contactId: null,
      threadId: null,
      sequenceId: null,
      newTask: null,
    })
  }

  const openCreateDialog = () => {
    setTaskForm({
      ...EMPTY_TASK_FORM,
      ownerName: selectedTask?.ownerName ?? selectedSequence?.ownerName ?? EMPTY_TASK_FORM.ownerName,
      contactId: contactIdParam || selectedTask?.contactId || "none",
      sequenceId: sequenceIdParam || selectedTask?.sequenceId || "none",
      dueAt: toDateTimeLocal(selectedTask?.dueAt ?? "2026-04-24T09:00:00Z"),
    })
    setParams({ newTask: "1" })
  }

  const closeCreateDialog = () => {
    setParams({ newTask: null })
  }

  const handleSaveTask = async () => {
    const createdTask = await createOutreachTask({
      contactId: taskForm.contactId === "none" ? undefined : taskForm.contactId,
      threadId: threadIdParam || undefined,
      sequenceId: taskForm.sequenceId === "none" ? undefined : taskForm.sequenceId,
      ownerName: taskForm.ownerName,
      title: taskForm.title,
      type: taskForm.type,
      priority: taskForm.priority,
      dueAt: new Date(taskForm.dueAt).toISOString(),
      note: taskForm.note || undefined,
    })

    await mutate("outreach-tasks")
    toast.success(`Created task ${createdTask.title}`)
    setParams({
      newTask: null,
      taskId: createdTask.id,
      contactId: createdTask.contactId,
      threadId: createdTask.threadId,
      sequenceId: createdTask.sequenceId,
    })
  }

  const handleTaskStatus = async (status: OutreachTaskStatus) => {
    if (!selectedTask) {
      return
    }

    await mutate(
      "outreach-tasks",
      (currentTasks: typeof tasks | undefined) =>
        (currentTasks ?? []).map((task) =>
          task.id === selectedTask.id
            ? {
                ...task,
                status,
              }
            : task
        ),
      { revalidate: false }
    )

    await updateOutreachTask(selectedTask.id, { status })
    await mutate("outreach-tasks")
    toast.success(`Task marked ${status.replaceAll("_", " ")}`)
  }

  return (
    <>
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
              <Button size="sm" onClick={openCreateDialog}>Create task</Button>
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
                {threadIdParam ? <Badge variant="outline">Thread scoped</Badge> : null}
                {sequenceIdParam ? <Badge variant="outline">Sequence scoped</Badge> : null}
                {contactIdParam ? <Badge variant="outline">Contact scoped</Badge> : null}
                {threadIdParam || sequenceIdParam || contactIdParam ? (
                  <Button variant="outline" size="sm" onClick={clearContext}>Clear context</Button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="grid xl:grid-cols-[minmax(0,1.2fr)_380px]">
            <div className="border-b xl:border-b-0 xl:border-r">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-medium text-foreground">Seller task queue</p>
                <p className="text-xs text-muted-foreground">Calls, manual emails, LinkedIn touches and action items generated by seller outreach.</p>
              </div>

              <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_120px_110px_120px] gap-4 border-b bg-muted/25 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:grid">
                <span>Task</span>
                <span>Contact</span>
                <span>Type</span>
                <span>Priority</span>
                <span>Due date</span>
              </div>

              <div>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => openTask(task.id, task.contactId, task.threadId, task.sequenceId)}
                      className={cn(
                        "grid w-full gap-3 border-b px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-muted/30 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_120px_110px_120px] lg:items-center lg:gap-4",
                        selectedTask?.id === task.id && "bg-muted/45"
                      )}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">{task.title}</p>
                          {task.status !== "open" ? <Badge variant="secondary">{task.status}</Badge> : null}
                        </div>
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
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-sm text-muted-foreground">No tasks match the current view and filters.</div>
                )}
              </div>
            </div>

            <div className="space-y-4 p-4">
              {selectedTask ? (
                <>
                  <section className="rounded-2xl border bg-background p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{selectedTask.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{selectedTask.note ?? "No note attached to this task yet."}</p>
                      </div>
                      <Badge variant="outline" data-testid="selected-task-status">{selectedTask.status}</Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedTask.status !== "completed" ? (
                        <Button size="sm" onClick={() => handleTaskStatus("completed")}>
                          <CheckCircle2 className="size-4" />
                          Complete
                        </Button>
                      ) : null}
                      {selectedTask.status !== "skipped" ? (
                        <Button variant="outline" size="sm" onClick={() => handleTaskStatus("skipped")}>
                          Skip
                        </Button>
                      ) : null}
                      {selectedTask.status !== "open" ? (
                        <Button variant="outline" size="sm" onClick={() => handleTaskStatus("open")}>
                          Reopen
                        </Button>
                      ) : null}
                    </div>
                  </section>

                  <section className="rounded-2xl border bg-background p-4 shadow-sm">
                    <p className="font-medium text-foreground">Linked records</p>
                    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <div className="rounded-2xl border bg-muted/10 p-4">
                        <p>Contact</p>
                        <p className="mt-1 text-foreground">{selectedTask.contactName}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedTask.contactId ? (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/contacts?contactId=${selectedTask.contactId}`}>Open contact</Link>
                            </Button>
                          ) : null}
                          {selectedTask.contactId ? (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/outreach/emails?contactId=${selectedTask.contactId}${selectedTask.threadId ? `&conversationId=${selectedTask.threadId}` : ""}`}>Open thread</Link>
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-muted/10 p-4">
                        <p>Sequence</p>
                        <p className="mt-1 text-foreground">{selectedTask.sequenceName ?? "Direct 1:1"}</p>
                        {selectedTask.sequenceId ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/outreach/sequences?sequenceId=${selectedTask.sequenceId}`}>Open sequence</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/outreach/emails?sequenceId=${selectedTask.sequenceId}${selectedTask.threadId ? `&conversationId=${selectedTask.threadId}` : ""}`}>Open related emails</Link>
                            </Button>
                          </div>
                        ) : null}
                      </div>

                      <div className="rounded-2xl border bg-muted/10 p-4">
                        <p>Execution context</p>
                        <p className="mt-1">Type: <span className="text-foreground">{formatTaskType(selectedTask.type)}</span></p>
                        <p className="mt-1">Priority: <span className="text-foreground">{formatPriority(selectedTask.priority)}</span></p>
                        <p className="mt-1">Due: <span className="text-foreground">{formatShortDate(selectedTask.dueAt)}</span></p>
                        <p className="mt-1">Owner: <span className="text-foreground">{selectedTask.ownerName}</span></p>
                      </div>
                    </div>
                  </section>

                  {selectedSequence ? (
                    <section className="rounded-2xl border bg-background p-4 shadow-sm">
                      <p className="font-medium text-foreground">Sequence snapshot</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{selectedSequence.status}</Badge>
                        <Badge variant="outline">Open {selectedSequence.openRate}%</Badge>
                        <Badge variant="outline">Reply {selectedSequence.replyRate}%</Badge>
                        <Badge variant="outline">Active {selectedSequence.activeContacts}</Badge>
                      </div>
                    </section>
                  ) : null}

                  {selectedConversation ? (
                    <section className="rounded-2xl border bg-background p-4 shadow-sm">
                      <p className="font-medium text-foreground">Thread snapshot</p>
                      <p className="mt-2 text-sm text-muted-foreground">{selectedConversation.preview}</p>
                    </section>
                  ) : null}

                  {selectedContact ? (
                    <section className="rounded-2xl border bg-background p-4 shadow-sm">
                      <p className="font-medium text-foreground">Contact state</p>
                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <p>Outreach status: <span className="text-foreground">{selectedContact.outreachStatus.replaceAll("_", " ")}</span></p>
                        <p>Email status: <span className="text-foreground">{selectedContact.emailStatus}</span></p>
                      </div>
                    </section>
                  ) : null}
                </>
              ) : (
                <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground shadow-sm">No task selected.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={newTaskParam} onOpenChange={(open) => !open && closeCreateDialog()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create task</DialogTitle>
            <DialogDescription>Create a seller follow-up task without sending any email yet.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="outreach-task-title">Title</Label>
              <Input
                id="outreach-task-title"
                value={taskForm.title}
                onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Owner</Label>
              <Input
                value={taskForm.ownerName}
                onChange={(event) => setTaskForm((current) => ({ ...current, ownerName: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Due at</Label>
              <Input
                type="datetime-local"
                value={taskForm.dueAt}
                onChange={(event) => setTaskForm((current) => ({ ...current, dueAt: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={taskForm.type} onValueChange={(value: OutreachTaskType) => setTaskForm((current) => ({ ...current, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="manual_email">Manual email</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="action_item">Action item</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={taskForm.priority} onValueChange={(value: OutreachTaskPriority) => setTaskForm((current) => ({ ...current, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Contact</Label>
              <Select value={taskForm.contactId} onValueChange={(value) => setTaskForm((current) => ({ ...current, contactId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked contact</SelectItem>
                  {contactsResult.contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName} · {contact.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sequence</Label>
              <Select value={taskForm.sequenceId} onValueChange={(value) => setTaskForm((current) => ({ ...current, sequenceId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional sequence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Direct 1:1</SelectItem>
                  {sequences.map((sequence) => (
                    <SelectItem key={sequence.id} value={sequence.id}>
                      {sequence.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Note</Label>
              <Textarea
                rows={5}
                value={taskForm.note}
                onChange={(event) => setTaskForm((current) => ({ ...current, note: event.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeCreateDialog}>Cancel</Button>
            <Button onClick={handleSaveTask} disabled={!taskForm.title.trim()}>Create task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
