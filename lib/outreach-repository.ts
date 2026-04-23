import type {
  OutreachConversation,
  OutreachMailbox,
  OutreachSequence,
  OutreachTask,
  OutreachTemplate,
} from "@/lib/types"
import { getContact } from "@/lib/crm-repository"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

const OUTREACH_STORAGE_KEYS = {
  mailboxes: "outreach-shadow-mailboxes",
  templates: "outreach-shadow-templates",
  tasks: "outreach-shadow-tasks",
  sequences: "outreach-shadow-sequences",
} as const

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
    contactId: "contact-elena-rossi",
    threadId: "outreach-conversation-cloudripple",
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
    contactId: "contact-marco-sala",
    threadId: "outreach-conversation-nordicforge",
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
    contactId: "contact-lisa-chen",
    threadId: "outreach-conversation-helixworks",
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
    contactId: "contact-andrea-bianchi",
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
    enrollments: [
      {
        contactId: "contact-elena-rossi",
        mailboxId: "outreach-mailbox-clara-rossi",
        status: "active",
        currentStepOrder: 2,
        contactName: "Elena Rossi",
        company: "AstraZeneca",
        mailboxLabel: "Clara Rossi · clara.rossi@etapahub.com",
      },
      {
        contactId: "contact-andrea-bianchi",
        mailboxId: "outreach-mailbox-clara-rossi",
        status: "completed",
        currentStepOrder: 3,
        contactName: "Andrea Bianchi",
        company: "AstraZeneca",
        mailboxLabel: "Clara Rossi · clara.rossi@etapahub.com",
      },
    ],
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
    enrollments: [
      {
        contactId: "contact-marco-sala",
        mailboxId: "outreach-mailbox-daniel-meyer",
        status: "active",
        currentStepOrder: 2,
        contactName: "Marco Sala",
        company: "Novartis AG",
        mailboxLabel: "Daniel Meyer · daniel.meyer@etapahub.com",
      },
      {
        contactId: "contact-sophie-meyer",
        mailboxId: "outreach-mailbox-daniel-meyer",
        status: "completed",
        currentStepOrder: 3,
        contactName: "Sophie Meyer",
        company: "Novartis AG",
        mailboxLabel: "Daniel Meyer · daniel.meyer@etapahub.com",
      },
    ],
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
    enrollments: [
      {
        contactId: "contact-lisa-chen",
        mailboxId: "outreach-mailbox-lucia-bianchi",
        status: "active",
        currentStepOrder: 1,
        contactName: "Lisa Chen",
        company: "Johnson & Johnson",
        mailboxLabel: "Lucia Bianchi · lucia.bianchi@etapahub.com",
      },
    ],
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

    return mergeShadowRecords((data ?? []).map(mapMailboxRow), readShadowRecords(OUTREACH_STORAGE_KEYS.mailboxes))
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

    return mergeShadowRecords((data ?? []).map(mapTemplateRow), readShadowRecords(OUTREACH_STORAGE_KEYS.templates))
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
        thread_id,
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

    return mergeShadowRecords((data ?? []).map(mapTaskRow), readShadowRecords(OUTREACH_STORAGE_KEYS.tasks))
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
          contact_id,
          mailbox_id,
          status,
          current_step_order,
          contact:crm_contacts!crm_outreach_sequence_contacts_contact_id_fkey(
            first_name,
            last_name,
            company_name
          ),
          mailbox:crm_outreach_mailboxes!crm_outreach_sequence_contacts_mailbox_id_fkey(
            display_name,
            mailbox_email
          )
        )
      `)
      .order("created_at", { ascending: true })

    if (error) {
      throw error
    }

    return mergeShadowRecords((data ?? []).map(mapSequenceRow), readShadowRecords(OUTREACH_STORAGE_KEYS.sequences))
  }, outreachSequences)
}

export interface CreateOutreachMailboxInput {
  ownerName: string
  ownerEmail: string
  provider: OutreachMailbox["provider"]
  email: string
  displayName: string
  connectionStatus?: OutreachMailbox["connectionStatus"]
  sendingHealth?: OutreachMailbox["sendingHealth"]
  dailyLimit?: number
}

export interface UpdateOutreachMailboxInput extends Partial<CreateOutreachMailboxInput> {}

export interface CreateOutreachTemplateInput {
  ownerName?: string
  name: string
  category: OutreachTemplate["category"]
  subject: string
  plainTextBody: string
}

export interface UpdateOutreachTemplateInput extends Partial<CreateOutreachTemplateInput> {}

export interface CreateOutreachTaskInput {
  contactId?: string
  threadId?: string
  sequenceId?: string
  ownerName: string
  title: string
  type: OutreachTask["type"]
  priority?: OutreachTask["priority"]
  status?: OutreachTask["status"]
  dueAt: string
  note?: string
}

export interface UpdateOutreachTaskInput extends Partial<CreateOutreachTaskInput> {}

export interface CreateOutreachSequenceInput {
  ownerName: string
  name: string
  status?: OutreachSequence["status"]
  description?: string
  stopOnReply?: boolean
  stopOnInterested?: boolean
  primaryTemplateId?: string
  followUpTemplateId?: string
}

export interface UpdateOutreachSequenceInput extends Partial<CreateOutreachSequenceInput> {}

export async function createOutreachMailbox(input: CreateOutreachMailboxInput) {
  return withOutreachMutationFallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("crm_outreach_mailboxes")
      .insert({
        owner_name: input.ownerName,
        owner_email: input.ownerEmail,
        provider: input.provider,
        mailbox_email: input.email,
        display_name: input.displayName,
        connection_status: input.connectionStatus ?? "paused",
        sending_health: input.sendingHealth ?? "paused",
        daily_limit: Math.max(0, input.dailyLimit ?? 25),
        metadata: {
          mailbox_kind: "seller",
          demo_connection: true,
        },
      })
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return mapMailboxRow(data)
  }, () => {
    const now = nowIso()
    const mailbox: OutreachMailbox = {
      id: createId("outreach-mailbox"),
      ownerName: input.ownerName,
      ownerEmail: input.ownerEmail,
      provider: input.provider,
      email: input.email,
      displayName: input.displayName,
      connectionStatus: input.connectionStatus ?? "paused",
      sendingHealth: input.sendingHealth ?? "paused",
      dailyLimit: `${Math.max(0, input.dailyLimit ?? 25)}/day`,
      createdAt: now,
      updatedAt: now,
    }
    outreachMailboxes.unshift(mailbox)
    upsertShadowRecord(OUTREACH_STORAGE_KEYS.mailboxes, mailbox)
    return cloneFallback(mailbox)
  })
}

export async function updateOutreachMailbox(mailboxId: string, input: UpdateOutreachMailboxInput) {
  return withOutreachMutationFallback(async () => {
    const supabase = createClient()
    const payload: Record<string, unknown> = {}

    if (input.ownerName !== undefined) payload.owner_name = input.ownerName
    if (input.ownerEmail !== undefined) payload.owner_email = input.ownerEmail
    if (input.provider !== undefined) payload.provider = input.provider
    if (input.email !== undefined) payload.mailbox_email = input.email
    if (input.displayName !== undefined) payload.display_name = input.displayName
    if (input.connectionStatus !== undefined) payload.connection_status = input.connectionStatus
    if (input.sendingHealth !== undefined) payload.sending_health = input.sendingHealth
    if (input.dailyLimit !== undefined) payload.daily_limit = Math.max(0, input.dailyLimit)

    const { data, error } = await supabase
      .from("crm_outreach_mailboxes")
      .update(payload)
      .eq("id", mailboxId)
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return mapMailboxRow(data)
  }, () => {
    const mailbox = outreachMailboxes.find((item) => item.id === mailboxId)
    if (!mailbox) {
      throw new Error("Mailbox not found")
    }

    if (input.ownerName !== undefined) mailbox.ownerName = input.ownerName
    if (input.ownerEmail !== undefined) mailbox.ownerEmail = input.ownerEmail
    if (input.provider !== undefined) mailbox.provider = input.provider
    if (input.email !== undefined) mailbox.email = input.email
    if (input.displayName !== undefined) mailbox.displayName = input.displayName
    if (input.connectionStatus !== undefined) mailbox.connectionStatus = input.connectionStatus
    if (input.sendingHealth !== undefined) mailbox.sendingHealth = input.sendingHealth
    if (input.dailyLimit !== undefined) mailbox.dailyLimit = `${Math.max(0, input.dailyLimit)}/day`
    mailbox.updatedAt = nowIso()
    upsertShadowRecord(OUTREACH_STORAGE_KEYS.mailboxes, mailbox)

    return cloneFallback(mailbox)
  })
}

export async function createOutreachTemplate(input: CreateOutreachTemplateInput) {
  return withOutreachMutationFallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("crm_outreach_templates")
      .insert({
        owner_name: input.ownerName ?? null,
        name: input.name,
        category: input.category,
        subject: input.subject,
        plain_text_body: input.plainTextBody,
        metadata: {
          channel: "seller_outreach",
        },
      })
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return mapTemplateRow(data)
  }, () => {
    const now = nowIso()
    const template: OutreachTemplate = {
      id: createId("outreach-template"),
      ownerName: input.ownerName ?? "EtapaHub seller",
      name: input.name,
      category: input.category,
      subject: input.subject,
      plainTextBody: input.plainTextBody,
      createdAt: now,
      updatedAt: now,
    }
    outreachTemplates.unshift(template)
    upsertShadowRecord(OUTREACH_STORAGE_KEYS.templates, template)
    return cloneFallback(template)
  })
}

export async function updateOutreachTemplate(templateId: string, input: UpdateOutreachTemplateInput) {
  return withOutreachMutationFallback(async () => {
    const supabase = createClient()
    const payload: Record<string, unknown> = {}

    if (input.ownerName !== undefined) payload.owner_name = input.ownerName
    if (input.name !== undefined) payload.name = input.name
    if (input.category !== undefined) payload.category = input.category
    if (input.subject !== undefined) payload.subject = input.subject
    if (input.plainTextBody !== undefined) payload.plain_text_body = input.plainTextBody

    const { data, error } = await supabase
      .from("crm_outreach_templates")
      .update(payload)
      .eq("id", templateId)
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return mapTemplateRow(data)
  }, () => {
    const template = outreachTemplates.find((item) => item.id === templateId)
    if (!template) {
      throw new Error("Template not found")
    }

    if (input.ownerName !== undefined) template.ownerName = input.ownerName
    if (input.name !== undefined) template.name = input.name
    if (input.category !== undefined) template.category = input.category
    if (input.subject !== undefined) template.subject = input.subject
    if (input.plainTextBody !== undefined) template.plainTextBody = input.plainTextBody
    template.updatedAt = nowIso()
    upsertShadowRecord(OUTREACH_STORAGE_KEYS.templates, template)

    return cloneFallback(template)
  })
}

export async function createOutreachTask(input: CreateOutreachTaskInput) {
  return withOutreachMutationFallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("crm_outreach_tasks")
      .insert({
        contact_id: input.contactId ?? null,
        thread_id: input.threadId ?? null,
        sequence_id: input.sequenceId ?? null,
        owner_name: input.ownerName,
        title: input.title,
        task_type: input.type,
        priority: input.priority ?? "medium",
        status: input.status ?? "open",
        due_at: input.dueAt,
        note: input.note ?? null,
      })
      .select("id")
      .single()

    if (error) {
      throw error
    }

    return getOutreachTaskById(data.id)
  }, async () => {
    const now = nowIso()
    const context = await resolveTaskContext(input.contactId, input.sequenceId)
    const task: OutreachTask = {
      id: createId("outreach-task"),
      contactId: input.contactId,
      threadId: input.threadId,
      title: input.title,
      type: input.type,
      priority: input.priority ?? "medium",
      status: input.status ?? "open",
      dueAt: input.dueAt,
      ownerName: input.ownerName,
      contactName: context.contactName,
      company: context.company,
      sequenceId: input.sequenceId,
      sequenceName: context.sequenceName,
      note: input.note,
      createdAt: now,
      updatedAt: now,
    }
    outreachTasks.unshift(task)
    upsertShadowRecord(OUTREACH_STORAGE_KEYS.tasks, task)
    return cloneFallback(task)
  })
}

export async function updateOutreachTask(taskId: string, input: UpdateOutreachTaskInput) {
  return withOutreachMutationFallback(async () => {
    const supabase = createClient()
    const payload: Record<string, unknown> = {}

    if (input.contactId !== undefined) payload.contact_id = input.contactId
    if (input.threadId !== undefined) payload.thread_id = input.threadId
    if (input.sequenceId !== undefined) payload.sequence_id = input.sequenceId
    if (input.ownerName !== undefined) payload.owner_name = input.ownerName
    if (input.title !== undefined) payload.title = input.title
    if (input.type !== undefined) payload.task_type = input.type
    if (input.priority !== undefined) payload.priority = input.priority
    if (input.status !== undefined) payload.status = input.status
    if (input.dueAt !== undefined) payload.due_at = input.dueAt
    if (input.note !== undefined) payload.note = input.note

    const { data, error } = await supabase
      .from("crm_outreach_tasks")
      .update(payload)
      .eq("id", taskId)
      .select("id")
      .single()

    if (error) {
      throw error
    }

    return getOutreachTaskById(data.id)
  }, async () => {
    const task = outreachTasks.find((item) => item.id === taskId)
    if (!task) {
      throw new Error("Task not found")
    }

    const context = await resolveTaskContext(input.contactId ?? task.contactId, input.sequenceId ?? task.sequenceId)
    if (input.contactId !== undefined) task.contactId = input.contactId
    if (input.threadId !== undefined) task.threadId = input.threadId
    if (input.title !== undefined) task.title = input.title
    if (input.type !== undefined) task.type = input.type
    if (input.priority !== undefined) task.priority = input.priority
    if (input.status !== undefined) task.status = input.status
    if (input.dueAt !== undefined) task.dueAt = input.dueAt
    if (input.ownerName !== undefined) task.ownerName = input.ownerName
    if (input.sequenceId !== undefined) task.sequenceId = input.sequenceId
    if (input.note !== undefined) task.note = input.note
    task.contactName = context.contactName
    task.company = context.company
    task.sequenceName = context.sequenceName
    task.updatedAt = nowIso()
    upsertShadowRecord(OUTREACH_STORAGE_KEYS.tasks, task)

    return cloneFallback(task)
  })
}

export async function createOutreachSequence(input: CreateOutreachSequenceInput) {
  return withOutreachMutationFallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("crm_outreach_sequences")
      .insert({
        owner_name: input.ownerName,
        name: input.name,
        status: input.status ?? "draft",
        description: input.description ?? "",
        stop_on_reply: input.stopOnReply ?? true,
        stop_on_interested: input.stopOnInterested ?? true,
        metadata: {
          open_rate: 0,
          reply_rate: 0,
          active_contacts: 0,
          completed_contacts: 0,
        },
      })
      .select("id")
      .single()

    if (error) {
      throw error
    }

    const stepRows = buildSequenceSteps(data.id, input.primaryTemplateId, input.followUpTemplateId)
    if (stepRows.length > 0) {
      const { error: stepError } = await supabase.from("crm_outreach_sequence_steps").insert(stepRows)
      if (stepError) {
        throw stepError
      }
    }

    return getOutreachSequenceById(data.id)
  }, () => {
    const now = nowIso()
    const sequenceId = createId("outreach-sequence")
    const sequence: OutreachSequence = {
      id: sequenceId,
      name: input.name,
      ownerName: input.ownerName,
      status: input.status ?? "draft",
      activeContacts: 0,
      completedContacts: 0,
      openRate: 0,
      replyRate: 0,
      description: input.description ?? "",
      stopOnReply: input.stopOnReply ?? true,
      stopOnInterested: input.stopOnInterested ?? true,
      enrollments: [],
      steps: buildFallbackSequenceSteps(sequenceId, input.primaryTemplateId, input.followUpTemplateId),
      createdAt: now,
      updatedAt: now,
    }
    outreachSequences.unshift(sequence)
    upsertShadowRecord(OUTREACH_STORAGE_KEYS.sequences, sequence)
    return cloneFallback(sequence)
  })
}

export async function updateOutreachSequence(sequenceId: string, input: UpdateOutreachSequenceInput) {
  return withOutreachMutationFallback(async () => {
    const supabase = createClient()
    const payload: Record<string, unknown> = {}

    if (input.ownerName !== undefined) payload.owner_name = input.ownerName
    if (input.name !== undefined) payload.name = input.name
    if (input.status !== undefined) payload.status = input.status
    if (input.description !== undefined) payload.description = input.description
    if (input.stopOnReply !== undefined) payload.stop_on_reply = input.stopOnReply
    if (input.stopOnInterested !== undefined) payload.stop_on_interested = input.stopOnInterested

    const { data, error } = await supabase
      .from("crm_outreach_sequences")
      .update(payload)
      .eq("id", sequenceId)
      .select("id")
      .single()

    if (error) {
      throw error
    }

    return getOutreachSequenceById(data.id)
  }, () => {
    const sequence = outreachSequences.find((item) => item.id === sequenceId)
    if (!sequence) {
      throw new Error("Sequence not found")
    }

    if (input.ownerName !== undefined) sequence.ownerName = input.ownerName
    if (input.name !== undefined) sequence.name = input.name
    if (input.status !== undefined) sequence.status = input.status
    if (input.description !== undefined) sequence.description = input.description
    if (input.stopOnReply !== undefined) sequence.stopOnReply = input.stopOnReply
    if (input.stopOnInterested !== undefined) sequence.stopOnInterested = input.stopOnInterested
    sequence.updatedAt = nowIso()
    upsertShadowRecord(OUTREACH_STORAGE_KEYS.sequences, sequence)

    return cloneFallback(sequence)
  })
}

type JsonRecord = Record<string, unknown>

function cloneFallback<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value)
  }

  return JSON.parse(JSON.stringify(value)) as T
}

function readShadowRecords<T extends { id: string }>(storageKey: string): T[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey)
    if (!rawValue) {
      return []
    }

    const parsedValue = JSON.parse(rawValue)
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

function upsertShadowRecord<T extends { id: string }>(storageKey: string, record: T) {
  if (typeof window === "undefined") {
    return
  }

  const nextRecords = mergeShadowRecords(readShadowRecords<T>(storageKey), [record])
  window.localStorage.setItem(storageKey, JSON.stringify(nextRecords))
}

function mergeShadowRecords<T extends { id: string }>(baseRecords: T[], shadowRecords: T[]) {
  const recordsById = new Map<string, T>()

  for (const record of baseRecords) {
    recordsById.set(record.id, record)
  }

  for (const record of shadowRecords) {
    recordsById.set(record.id, record)
  }

  return Array.from(recordsById.values())
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

async function withOutreachMutationFallback<T>(
  supabaseTask: () => Promise<T>,
  fallbackTask: () => Promise<T> | T
): Promise<T> {
  if (!isSupabaseConfigured()) {
    return fallbackTask()
  }

  try {
    return await supabaseTask()
  } catch {
    return fallbackTask()
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

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function nowIso() {
  return new Date().toISOString()
}

async function resolveTaskContext(contactId?: string, sequenceId?: string) {
  const contact = contactId ? await getContact(contactId).catch(() => null) : null
  const sequence = sequenceId ? outreachSequences.find((item) => item.id === sequenceId) : null

  return {
    contactName: contact ? `${contact.firstName} ${contact.lastName}`.trim() : "Unknown contact",
    company: contact?.company ?? "",
    sequenceName: sequence?.name,
  }
}

function buildSequenceSteps(
  sequenceId: string,
  primaryTemplateId?: string,
  followUpTemplateId?: string
): Array<{
  sequence_id: string
  step_order: number
  step_type: "automatic_email" | "manual_email" | "call"
  title: string
  delay_days: number
  template_id: string | null
  priority: "medium" | "high" | null
  metadata: Record<string, never>
}> {
  const resolvedPrimaryTemplateId = primaryTemplateId ?? outreachTemplates[0]?.id ?? null
  const resolvedFollowUpTemplateId =
    followUpTemplateId ??
    outreachTemplates.find((template) => template.category === "follow_up")?.id ??
    resolvedPrimaryTemplateId

  return [
    {
      sequence_id: sequenceId,
      step_order: 1,
      step_type: "automatic_email",
      title: "Initial personal intro",
      delay_days: 0,
      template_id: resolvedPrimaryTemplateId,
      priority: null,
      metadata: {},
    },
    {
      sequence_id: sequenceId,
      step_order: 2,
      step_type: "manual_email",
      title: "Manual follow-up",
      delay_days: 2,
      template_id: resolvedFollowUpTemplateId,
      priority: "medium",
      metadata: {},
    },
    {
      sequence_id: sequenceId,
      step_order: 3,
      step_type: "call",
      title: "Call qualification step",
      delay_days: 4,
      template_id: null,
      priority: "high",
      metadata: {},
    },
  ]
}

function buildFallbackSequenceSteps(
  sequenceId: string,
  primaryTemplateId?: string,
  followUpTemplateId?: string
): OutreachSequence["steps"] {
  return buildSequenceSteps(sequenceId, primaryTemplateId, followUpTemplateId).map((step) => ({
    id: createId("outreach-step"),
    order: step.step_order,
    type: step.step_type,
    title: step.title,
    delayDays: step.delay_days,
    templateId: step.template_id ?? undefined,
    priority: step.priority ?? undefined,
  }))
}

async function getOutreachTaskById(taskId: string) {
  const tasks = await listOutreachTasks()
  const task = tasks.find((item) => item.id === taskId)

  if (!task) {
    throw new Error("Task not found")
  }

  return task
}

async function getOutreachSequenceById(sequenceId: string) {
  const sequences = await listOutreachSequences()
  const sequence = sequences.find((item) => item.id === sequenceId)

  if (!sequence) {
    throw new Error("Sequence not found")
  }

  return sequence
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
    contactId: row.contact_id ?? undefined,
    threadId: row.thread_id ?? undefined,
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
  const enrollments: Array<{
    contact_id: string
    mailbox_id?: string | null
    status: "active" | "paused" | "completed" | "removed"
    current_step_order?: number | null
    contact?: unknown
    mailbox?: unknown
  }> = Array.isArray(row.enrollments) ? row.enrollments : []
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
    enrollments: enrollments.map((enrollment) => {
      const contact = asObject<{
        first_name: string
        last_name: string
        company_name?: string | null
      }>(enrollment.contact as any)
      const mailbox = asObject<{
        display_name: string
        mailbox_email: string
      }>(enrollment.mailbox as any)

      return {
        contactId: enrollment.contact_id,
        mailboxId: enrollment.mailbox_id ?? undefined,
        status: enrollment.status,
        currentStepOrder: enrollment.current_step_order ?? 1,
        contactName: contact ? `${contact.first_name} ${contact.last_name}`.trim() : "Unknown contact",
        company: contact?.company_name ?? "",
        mailboxLabel: mailbox ? `${mailbox.display_name} · ${mailbox.mailbox_email}` : undefined,
      }
    }),
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
