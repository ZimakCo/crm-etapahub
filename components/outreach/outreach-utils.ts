import type {
  Contact,
  OutreachConversationStatus,
  OutreachMailboxProvider,
  OutreachSequenceStatus,
  OutreachSequenceStepType,
  OutreachTaskPriority,
  OutreachTaskType,
} from "@/lib/types"

export function renderMergeTags(value: string, contact: Pick<Contact, "firstName" | "company"> | null) {
  return value
    .replaceAll("{{first_name}}", contact?.firstName ?? "there")
    .replaceAll("{{company}}", contact?.company ?? "your company")
}

export function formatMailboxProvider(provider: OutreachMailboxProvider) {
  switch (provider) {
    case "google_workspace":
      return "Google Workspace"
    case "microsoft_365":
      return "Microsoft 365"
    default:
      return "Outlook"
  }
}

export function formatConnectionStatus(status: "connected" | "attention" | "paused") {
  switch (status) {
    case "connected":
      return {
        label: "Connected",
        tone: "border-success/20 bg-success/10 text-success",
      }
    case "attention":
      return {
        label: "Attention",
        tone: "border-warning/20 bg-warning/10 text-warning",
      }
    default:
      return {
        label: "Paused",
        tone: "border-border bg-muted text-muted-foreground",
      }
  }
}

export function formatSendingHealth(status: "healthy" | "warming" | "at_risk" | "paused") {
  switch (status) {
    case "healthy":
      return {
        label: "Healthy",
        tone: "border-success/20 bg-success/10 text-success",
      }
    case "warming":
      return {
        label: "Warming",
        tone: "border-info/20 bg-info/10 text-info",
      }
    case "at_risk":
      return {
        label: "At risk",
        tone: "border-warning/20 bg-warning/10 text-warning",
      }
    default:
      return {
        label: "Paused",
        tone: "border-border bg-muted text-muted-foreground",
      }
  }
}

export function formatConversationStatus(status: OutreachConversationStatus) {
  switch (status) {
    case "active":
      return "Active"
    case "waiting":
      return "Waiting"
    case "needs_reply":
      return "Needs reply"
    case "bounced":
      return "Bounced"
    default:
      return "Completed"
  }
}

export function formatTaskType(type: OutreachTaskType) {
  switch (type) {
    case "manual_email":
      return "Manual email"
    case "action_item":
      return "Action item"
    case "linkedin":
      return "LinkedIn"
    default:
      return "Call"
  }
}

export function formatPriority(priority: OutreachTaskPriority) {
  switch (priority) {
    case "high":
      return "High"
    case "medium":
      return "Medium"
    default:
      return "Low"
  }
}

export function formatSequenceStatus(status: OutreachSequenceStatus) {
  switch (status) {
    case "active":
      return "Active"
    case "paused":
      return "Paused"
    case "completed":
      return "Completed"
    default:
      return "Draft"
  }
}

export function formatStepType(type: OutreachSequenceStepType) {
  switch (type) {
    case "automatic_email":
      return "Automatic email"
    case "manual_email":
      return "Manual email"
    case "linkedin":
      return "LinkedIn touch"
    case "task":
      return "Task"
    default:
      return "Call"
  }
}

export function formatShortDate(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
