import type {
  OutreachConversation,
  OutreachMailbox,
  OutreachSequence,
  OutreachTask,
  OutreachTemplate,
} from "@/lib/types"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

const outreachMailboxes: OutreachMailbox[] = [
  {
    id: "outreach-mailbox-clara-rossi",
    ownerName: "Clara Rossi",
    ownerEmail: "clara.rossi@etapahub.com",
    provider: "google_workspace",
    email: "clara.rossi@etapahub.com",
    displayName: "Clara Rossi",
    connectionStatus: "connected",
    sendingHealth: "healthy",
    dailyLimit: "40/day",
    lastSyncAt: "2026-03-26T12:40:00Z",
    createdAt: "2026-03-24T09:00:00Z",
    updatedAt: "2026-03-26T12:40:00Z",
  },
  {
    id: "outreach-mailbox-daniel-meyer",
    ownerName: "Daniel Meyer",
    ownerEmail: "daniel.meyer@etapahub.com",
    provider: "microsoft_365",
    email: "daniel.meyer@etapahub.com",
    displayName: "Daniel Meyer",
    connectionStatus: "connected",
    sendingHealth: "warming",
    dailyLimit: "30/day",
    lastSyncAt: "2026-03-26T12:22:00Z",
    createdAt: "2026-03-25T08:30:00Z",
    updatedAt: "2026-03-26T12:22:00Z",
  },
  {
    id: "outreach-mailbox-lucia-bianchi",
    ownerName: "Lucia Bianchi",
    ownerEmail: "lucia.bianchi@etapahub.com",
    provider: "outlook",
    email: "lucia.bianchi@etapahub.com",
    displayName: "Lucia Bianchi",
    connectionStatus: "attention",
    sendingHealth: "at_risk",
    dailyLimit: "20/day",
    lastSyncAt: "2026-03-26T09:10:00Z",
    createdAt: "2026-03-20T11:15:00Z",
    updatedAt: "2026-03-26T09:10:00Z",
  },
]

const outreachTemplates: OutreachTemplate[] = [
  {
    id: "outreach-template-intro",
    ownerName: "Clara Rossi",
    name: "Intro Call Invite",
    category: "intro",
    subject: "Quick intro for {{first_name}} at {{company}}",
    plainTextBody:
      "Hi {{first_name}},\n\nI am reaching out personally from EtapaHub because I would like to open a direct conversation with {{company}}.\n\nWould you be open to a short intro call next week?\n\nBest regards,\nClara",
    createdAt: "2026-03-24T09:00:00Z",
    updatedAt: "2026-03-26T10:15:00Z",
  },
  {
    id: "outreach-template-follow-up",
    ownerName: "Daniel Meyer",
    name: "Reply Nudge",
    category: "follow_up",
    subject: "Following up on my note, {{first_name}}",
    plainTextBody:
      "Hi {{first_name}},\n\nJust bringing this back to the top of your inbox in case the first note was buried.\n\nIf it helps, I can send a short summary tailored to {{company}}.\n\nBest regards,\nDaniel",
    createdAt: "2026-03-24T11:00:00Z",
    updatedAt: "2026-03-26T11:45:00Z",
  },
  {
    id: "outreach-template-meeting",
    ownerName: "Lucia Bianchi",
    name: "Meeting Confirm",
    category: "meeting",
    subject: "Locking a time for {{company}}",
    plainTextBody:
      "Hi {{first_name}},\n\nHappy to continue the conversation.\n\nI can hold a 20 minute slot for us and keep it focused on {{company}}.\n\nBest regards,\nLucia",
    createdAt: "2026-03-23T15:00:00Z",
    updatedAt: "2026-03-25T14:20:00Z",
  },
  {
    id: "outreach-template-reengage",
    ownerName: "Clara Rossi",
    name: "Re-engage After Silence",
    category: "re_engage",
    subject: "Still worth reopening this for {{company}}?",
    plainTextBody:
      "Hi {{first_name}},\n\nClosing the loop on my previous note. If this is still relevant for {{company}}, I can send a concise overview or book a short intro.\n\nBest regards,\nClara",
    createdAt: "2026-03-22T15:00:00Z",
    updatedAt: "2026-03-26T08:20:00Z",
  },
]

const outreachConversations: OutreachConversation[] = [
  {
    id: "outreach-conversation-cloudripple",
    contactId: undefined,
    contactName: "Luca Moretti",
    company: "CloudRipple",
    ownerName: "Clara Rossi",
    mailboxId: "outreach-mailbox-clara-rossi",
    sequenceId: "outreach-sequence-expo-warm-intro",
    sequenceName: "Expo Warm Intro",
    status: "active",
    lastEvent: "replied",
    lastActivityAt: "2026-03-26T12:28:00Z",
    unreadCount: 1,
    preview: "Sounds relevant. Can you share two time slots for next week?",
    messages: [
      {
        id: "conversation-cloudripple-msg-1",
        direction: "outbound",
        subject: "Quick intro for Luca at CloudRipple",
        body:
          "Hi Luca,\n\nI am reaching out personally from EtapaHub because I would like to open a direct conversation with CloudRipple.\n\nWould you be open to a short intro call next week?\n\nBest regards,\nClara",
        event: "opened",
        sentAt: "2026-03-25T08:30:00Z",
        mailboxId: "outreach-mailbox-clara-rossi",
      },
      {
        id: "conversation-cloudripple-msg-2",
        direction: "inbound",
        subject: "Re: Quick intro for Luca at CloudRipple",
        body: "Sounds relevant. Can you share two time slots for next week?",
        event: "replied",
        sentAt: "2026-03-26T12:28:00Z",
      },
    ],
    createdAt: "2026-03-25T08:30:00Z",
    updatedAt: "2026-03-26T12:28:00Z",
  },
  {
    id: "outreach-conversation-nordicforge",
    contactId: undefined,
    contactName: "Anna Berg",
    company: "NordicForge",
    ownerName: "Daniel Meyer",
    mailboxId: "outreach-mailbox-daniel-meyer",
    sequenceId: "outreach-sequence-event-follow-up",
    sequenceName: "Event Follow-up",
    status: "waiting",
    lastEvent: "clicked",
    lastActivityAt: "2026-03-26T10:05:00Z",
    unreadCount: 0,
    preview: "Tracked click on the case-study link. Waiting for the +2 day manual email step.",
    messages: [
      {
        id: "conversation-nordicforge-msg-1",
        direction: "outbound",
        subject: "Following up on my note, Anna",
        body:
          "Hi Anna,\n\nJust bringing this back to the top of your inbox in case the first note was buried.\n\nIf it helps, I can send a short summary tailored to NordicForge.\n\nBest regards,\nDaniel",
        event: "clicked",
        sentAt: "2026-03-24T14:10:00Z",
        mailboxId: "outreach-mailbox-daniel-meyer",
      },
    ],
    createdAt: "2026-03-24T14:10:00Z",
    updatedAt: "2026-03-26T10:05:00Z",
  },
  {
    id: "outreach-conversation-helixworks",
    contactId: undefined,
    contactName: "Mina Patel",
    company: "HelixWorks",
    ownerName: "Lucia Bianchi",
    mailboxId: "outreach-mailbox-lucia-bianchi",
    sequenceId: "outreach-sequence-reengage-q2",
    sequenceName: "Re-engage Q2",
    status: "needs_reply",
    lastEvent: "opened",
    lastActivityAt: "2026-03-26T07:48:00Z",
    unreadCount: 0,
    preview: "Opened twice. Waiting on a manual seller follow-up before the thread cools down.",
    messages: [
      {
        id: "conversation-helixworks-msg-1",
        direction: "outbound",
        subject: "Still worth reopening this for HelixWorks?",
        body:
          "Hi Mina,\n\nClosing the loop on my previous note. If this is still relevant for HelixWorks, I can send a concise overview or book a short intro.\n\nBest regards,\nLucia",
        event: "opened",
        sentAt: "2026-03-25T16:10:00Z",
        mailboxId: "outreach-mailbox-lucia-bianchi",
      },
    ],
    createdAt: "2026-03-25T16:10:00Z",
    updatedAt: "2026-03-26T07:48:00Z",
  },
  {
    id: "outreach-conversation-brightpath",
    contactId: undefined,
    contactName: "George Bell",
    company: "BrightPath Labs",
    ownerName: "Clara Rossi",
    mailboxId: "outreach-mailbox-clara-rossi",
    sequenceId: undefined,
    sequenceName: undefined,
    status: "bounced",
    lastEvent: "bounced",
    lastActivityAt: "2026-03-25T09:20:00Z",
    unreadCount: 0,
    preview: "Mailbox issue detected. Contact removed from automatic sends until manually reviewed.",
    messages: [
      {
        id: "conversation-brightpath-msg-1",
        direction: "system",
        subject: "Bounce detected",
        body: "Message bounced. Seller follow-up is blocked until the mailbox or contact email is reviewed.",
        event: "bounced",
        sentAt: "2026-03-25T09:20:00Z",
      },
    ],
    createdAt: "2026-03-25T09:20:00Z",
    updatedAt: "2026-03-25T09:20:00Z",
  },
]

const outreachTasks: OutreachTask[] = [
  {
    id: "outreach-task-call-cloudripple",
    title: "Book intro call with Luca Moretti",
    type: "call",
    priority: "high",
    status: "open",
    dueAt: "2026-03-27T09:00:00Z",
    ownerName: "Clara Rossi",
    contactName: "Luca Moretti",
    company: "CloudRipple",
    sequenceId: "outreach-sequence-expo-warm-intro",
    sequenceName: "Expo Warm Intro",
    note: "Reply received. Seller should confirm next week availability.",
    createdAt: "2026-03-26T12:30:00Z",
    updatedAt: "2026-03-26T12:30:00Z",
  },
  {
    id: "outreach-task-email-nordicforge",
    title: "Send manual follow-up to Anna Berg",
    type: "manual_email",
    priority: "medium",
    status: "open",
    dueAt: "2026-03-28T10:00:00Z",
    ownerName: "Daniel Meyer",
    contactName: "Anna Berg",
    company: "NordicForge",
    sequenceId: "outreach-sequence-event-follow-up",
    sequenceName: "Event Follow-up",
    note: "Contact clicked the link but has not replied yet.",
    createdAt: "2026-03-26T10:05:00Z",
    updatedAt: "2026-03-26T10:05:00Z",
  },
  {
    id: "outreach-task-linkedin-helixworks",
    title: "LinkedIn touch for Mina Patel",
    type: "linkedin",
    priority: "medium",
    status: "open",
    dueAt: "2026-03-27T15:00:00Z",
    ownerName: "Lucia Bianchi",
    contactName: "Mina Patel",
    company: "HelixWorks",
    sequenceId: "outreach-sequence-reengage-q2",
    sequenceName: "Re-engage Q2",
    note: "Sequence requires a human touch before the final re-engage step.",
    createdAt: "2026-03-26T07:50:00Z",
    updatedAt: "2026-03-26T07:50:00Z",
  },
  {
    id: "outreach-task-cleanup-brightpath",
    title: "Validate George Bell email address",
    type: "action_item",
    priority: "high",
    status: "open",
    dueAt: "2026-03-26T17:00:00Z",
    ownerName: "Clara Rossi",
    contactName: "George Bell",
    company: "BrightPath Labs",
    note: "Bounce review required before re-entering any seller workflow.",
    createdAt: "2026-03-25T09:25:00Z",
    updatedAt: "2026-03-25T09:25:00Z",
  },
]

const outreachSequences: OutreachSequence[] = [
  {
    id: "outreach-sequence-expo-warm-intro",
    name: "Expo Warm Intro",
    ownerName: "Clara Rossi",
    status: "active",
    activeContacts: 14,
    completedContacts: 4,
    openRate: 71,
    replyRate: 22,
    description: "Warm follow-up for sellers reconnecting with contacts met around recent events.",
    stopOnReply: true,
    stopOnInterested: true,
    steps: [
      {
        id: "expo-step-1",
        order: 1,
        type: "automatic_email",
        title: "Initial personal intro",
        delayDays: 0,
        templateId: "outreach-template-intro",
      },
      {
        id: "expo-step-2",
        order: 2,
        type: "manual_email",
        title: "Seller follow-up after 2 days",
        delayDays: 2,
        templateId: "outreach-template-follow-up",
        priority: "medium",
      },
      {
        id: "expo-step-3",
        order: 3,
        type: "call",
        title: "Call task instead of another auto-send",
        delayDays: 4,
        priority: "high",
      },
    ],
    createdAt: "2026-03-20T09:00:00Z",
    updatedAt: "2026-03-26T12:28:00Z",
  },
  {
    id: "outreach-sequence-event-follow-up",
    name: "Event Follow-up",
    ownerName: "Daniel Meyer",
    status: "active",
    activeContacts: 22,
    completedContacts: 7,
    openRate: 64,
    replyRate: 17,
    description: "Post-event seller sequence focused on direct replies, not bulk campaign delivery.",
    stopOnReply: true,
    stopOnInterested: true,
    steps: [
      {
        id: "event-step-1",
        order: 1,
        type: "automatic_email",
        title: "Recap and intro",
        delayDays: 0,
        templateId: "outreach-template-intro",
      },
      {
        id: "event-step-2",
        order: 2,
        type: "manual_email",
        title: "Manual response to engaged contacts",
        delayDays: 2,
        templateId: "outreach-template-follow-up",
        priority: "medium",
      },
      {
        id: "event-step-3",
        order: 3,
        type: "task",
        title: "Create seller task for qualification",
        delayDays: 4,
        priority: "medium",
      },
    ],
    createdAt: "2026-03-18T11:00:00Z",
    updatedAt: "2026-03-26T10:05:00Z",
  },
  {
    id: "outreach-sequence-reengage-q2",
    name: "Re-engage Q2",
    ownerName: "Lucia Bianchi",
    status: "draft",
    activeContacts: 8,
    completedContacts: 0,
    openRate: 0,
    replyRate: 0,
    description: "Re-open stalled conversations with a softer seller-owned motion and a mandatory human step.",
    stopOnReply: true,
    stopOnInterested: true,
    steps: [
      {
        id: "reengage-step-1",
        order: 1,
        type: "automatic_email",
        title: "Re-engage email",
        delayDays: 0,
        templateId: "outreach-template-reengage",
      },
      {
        id: "reengage-step-2",
        order: 2,
        type: "linkedin",
        title: "Human touch on LinkedIn",
        delayDays: 3,
        priority: "medium",
      },
      {
        id: "reengage-step-3",
        order: 3,
        type: "call",
        title: "Final call attempt",
        delayDays: 5,
        priority: "high",
      },
    ],
    createdAt: "2026-03-21T13:00:00Z",
    updatedAt: "2026-03-26T07:45:00Z",
  },
]

export async function listOutreachMailboxes() {
  return withOutreachFallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("crm_outreach_mailboxes")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      throw error
    }

    return (data ?? []).map(mapMailboxRow)
  }, outreachMailboxes)
}

export async function listOutreachTemplates() {
  return withOutreachFallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("crm_outreach_templates")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      throw error
    }

    return (data ?? []).map(mapTemplateRow)
  }, outreachTemplates)
}

export async function listOutreachConversations() {
  return withOutreachFallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("crm_outreach_threads")
      .select(`
        id,
        contact_id,
        mailbox_id,
        sequence_id,
        owner_name,
        status,
        last_event,
        unread_count,
        preview,
        last_activity_at,
        created_at,
        updated_at,
        contact:crm_contacts!crm_outreach_threads_contact_id_fkey(
          id,
          first_name,
          last_name,
          company_name
        ),
        sequence:crm_outreach_sequences!crm_outreach_threads_sequence_id_fkey(
          id,
          name
        ),
        messages:crm_outreach_messages(
          id,
          direction,
          subject,
          body,
          event,
          mailbox_id,
          sent_at
        )
      `)
      .order("last_activity_at", { ascending: false })

    if (error) {
      throw error
    }

    return (data ?? []).map(mapConversationRow)
  }, outreachConversations)
}

export async function listOutreachTasks() {
  return withOutreachFallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("crm_outreach_tasks")
      .select(`
        id,
        contact_id,
        sequence_id,
        owner_name,
        title,
        task_type,
        priority,
        status,
        due_at,
        note,
        created_at,
        updated_at,
        contact:crm_contacts!crm_outreach_tasks_contact_id_fkey(
          id,
          first_name,
          last_name,
          company_name
        ),
        sequence:crm_outreach_sequences!crm_outreach_tasks_sequence_id_fkey(
          id,
          name
        )
      `)
      .order("due_at", { ascending: true })

    if (error) {
      throw error
    }

    return (data ?? []).map(mapTaskRow)
  }, outreachTasks)
}

export async function listOutreachSequences() {
  return withOutreachFallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("crm_outreach_sequences")
      .select(`
        id,
        owner_name,
        name,
        status,
        description,
        stop_on_reply,
        stop_on_interested,
        metadata,
        created_at,
        updated_at,
        steps:crm_outreach_sequence_steps(
          id,
          step_order,
          step_type,
          title,
          delay_days,
          template_id,
          priority
        ),
        enrollments:crm_outreach_sequence_contacts(
          status
        )
      `)
      .order("created_at", { ascending: true })

    if (error) {
      throw error
    }

    return (data ?? []).map(mapSequenceRow)
  }, outreachSequences)
}

type JsonRecord = Record<string, unknown>

function cloneFallback<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value)
  }

  return JSON.parse(JSON.stringify(value)) as T
}

async function withOutreachFallback<T>(
  supabaseTask: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  if (!isSupabaseConfigured()) {
    return cloneFallback(fallbackValue)
  }

  try {
    return await supabaseTask()
  } catch {
    return cloneFallback(fallbackValue)
  }
}

function asObject<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function readMetadataNumber(metadata: unknown, key: string, fallback = 0) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return fallback
  }

  const value = (metadata as JsonRecord)[key]
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  return fallback
}

function mapMailboxRow(row: any): OutreachMailbox {
  return {
    id: row.id,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    provider: row.provider,
    email: row.mailbox_email,
    displayName: row.display_name,
    connectionStatus: row.connection_status,
    sendingHealth: row.sending_health,
    dailyLimit: `${row.daily_limit}/day`,
    lastSyncAt: row.last_sync_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapTemplateRow(row: any): OutreachTemplate {
  return {
    id: row.id,
    ownerName: row.owner_name ?? "EtapaHub seller",
    name: row.name,
    category: row.category,
    subject: row.subject,
    plainTextBody: row.plain_text_body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapConversationRow(row: any): OutreachConversation {
  const contact = asObject(row.contact)
  const sequence = asObject(row.sequence)
  const messages = Array.isArray(row.messages) ? [...row.messages] : []

  return {
    id: row.id,
    contactId: row.contact_id ?? undefined,
    contactName: contact ? `${contact.first_name} ${contact.last_name}`.trim() : "Unknown contact",
    company: contact?.company_name ?? "",
    ownerName: row.owner_name,
    mailboxId: row.mailbox_id,
    sequenceId: row.sequence_id ?? undefined,
    sequenceName: sequence?.name ?? undefined,
    status: row.status,
    lastEvent: row.last_event,
    lastActivityAt: row.last_activity_at,
    unreadCount: row.unread_count ?? 0,
    preview: row.preview ?? "",
    messages: messages
      .map((message) => ({
        id: message.id,
        direction: message.direction,
        subject: message.subject,
        body: message.body,
        event: message.event ?? undefined,
        sentAt: message.sent_at,
        mailboxId: message.mailbox_id ?? undefined,
      }))
      .sort((left, right) => new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime()),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapTaskRow(row: any): OutreachTask {
  const contact = asObject(row.contact)
  const sequence = asObject(row.sequence)

  return {
    id: row.id,
    title: row.title,
    type: row.task_type,
    priority: row.priority,
    status: row.status,
    dueAt: row.due_at,
    ownerName: row.owner_name,
    contactName: contact ? `${contact.first_name} ${contact.last_name}`.trim() : "Unknown contact",
    company: contact?.company_name ?? "",
    sequenceId: row.sequence_id ?? undefined,
    sequenceName: sequence?.name ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapSequenceRow(row: any): OutreachSequence {
  const steps = Array.isArray(row.steps) ? [...row.steps] : []
  const enrollments: Array<{ status?: string | null }> = Array.isArray(row.enrollments) ? row.enrollments : []
  const activeEnrollmentCount = enrollments.filter((enrollment) => enrollment.status === "active").length
  const completedEnrollmentCount = enrollments.filter((enrollment) => enrollment.status === "completed").length

  return {
    id: row.id,
    name: row.name,
    ownerName: row.owner_name,
    status: row.status,
    activeContacts: readMetadataNumber(row.metadata, "active_contacts", activeEnrollmentCount),
    completedContacts: readMetadataNumber(row.metadata, "completed_contacts", completedEnrollmentCount),
    openRate: readMetadataNumber(row.metadata, "open_rate"),
    replyRate: readMetadataNumber(row.metadata, "reply_rate"),
    description: row.description ?? "",
    stopOnReply: Boolean(row.stop_on_reply),
    stopOnInterested: Boolean(row.stop_on_interested),
    steps: steps
      .map((step) => ({
        id: step.id,
        order: step.step_order,
        type: step.step_type,
        title: step.title,
        delayDays: step.delay_days,
        templateId: step.template_id ?? undefined,
        priority: step.priority ?? undefined,
      }))
      .sort((left, right) => left.order - right.order),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
