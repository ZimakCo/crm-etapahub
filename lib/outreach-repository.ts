import type { OutreachMailbox, OutreachTemplate } from "@/lib/types"

const outreachMailboxes: OutreachMailbox[] = [
  {
    id: "outreach-mailbox-clara-rossi",
    ownerName: "Clara Rossi",
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
]

export async function listOutreachMailboxes() {
  return outreachMailboxes
}

export async function listOutreachTemplates() {
  return outreachTemplates
}
