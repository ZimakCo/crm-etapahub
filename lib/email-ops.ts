import type { Campaign, EmailTemplate } from "@/lib/types"

export type ProviderId = Exclude<Campaign["provider"], undefined>

export interface ProviderLaneProfile {
  id: string
  provider: ProviderId
  title: string
  status: "ready" | "manual" | "warmup"
  activeDays: string
  sendWindow: string
  dailyVolume: string
  fromIdentity: string
  bestFor: string
  notes: string
}

export interface TemplatePlaybook {
  id: string
  templateName: string
  provider: ProviderId
  activeDays: string
  duration: string
  listWorkflow: string
  purpose: string
}

export const providerLanes: ProviderLaneProfile[] = [
  {
    id: "lane-resend-core",
    provider: "resend",
    title: "Resend Core Lane",
    status: "ready",
    activeDays: "Mon-Wed",
    sendWindow: "09:00-13:00 CET",
    dailyVolume: "12k-20k / day",
    fromIdentity: "events@etapahub.com",
    bestFor: "Primary invitation batches and clean curated delegate lists",
    notes: "Use for the strongest plain-text invite templates where reply quality matters more than raw volume.",
  },
  {
    id: "lane-mailgun-followup",
    provider: "mailgun",
    title: "Mailgun Follow-up Lane",
    status: "ready",
    activeDays: "Tue-Fri",
    sendWindow: "10:00-16:00 CET",
    dailyVolume: "25k-40k / day",
    fromIdentity: "hello@etapahub.com",
    bestFor: "Brochure follow-up, warm reminders and operational sends",
    notes: "Good for lighter follow-up traffic and daily brochure/manual nurture lists imported by the team.",
  },
  {
    id: "lane-kumomta-volume",
    provider: "kumomta",
    title: "KumoMTA VPS Lane",
    status: "manual",
    activeDays: "Mon-Sat",
    sendWindow: "08:30-18:00 CET",
    dailyVolume: "50k-120k / day",
    fromIdentity: "ops@etapahub.com",
    bestFor: "Volume overflow, manual routing and controlled high-volume delivery",
    notes: "Keep this lane manual and tightly supervised. Best when the team decides the exact daily CSV slices to release.",
  },
]

export const templatePlaybooks: TemplatePlaybook[] = [
  {
    id: "playbook-invite",
    templateName: "Event Invitation Plain",
    provider: "resend",
    activeDays: "Mon-Wed",
    duration: "3-day invite run",
    listWorkflow: "Import the chosen CSV batch, tag it, build the segment, send the selected slice each day.",
    purpose: "Main event invitations with clean plain-text formatting and reply-friendly identity.",
  },
  {
    id: "playbook-brochure",
    templateName: "Brochure Follow-up",
    provider: "mailgun",
    activeDays: "Tue-Fri",
    duration: "1-2 day follow-up run",
    listWorkflow: "Load brochure-request lists manually each morning and keep them separated by batch tag.",
    purpose: "Fast brochure handling, reminder links and operational follow-up after campaigns or meetings.",
  },
]

export function formatProviderLabel(provider?: Campaign["provider"]) {
  switch (provider) {
    case "mailgun":
      return "Mailgun"
    case "kumomta":
      return "KumoMTA VPS"
    case "manual":
      return "Manual"
    default:
      return "Resend"
  }
}

export function getProviderBadgeClass(provider?: Campaign["provider"]) {
  switch (provider) {
    case "mailgun":
      return "bg-cyan-100 text-cyan-800"
    case "kumomta":
      return "bg-slate-200 text-slate-800"
    case "manual":
      return "bg-zinc-200 text-zinc-800"
    default:
      return "bg-blue-100 text-blue-800"
  }
}

export function getProviderStatusBadgeClass(status: ProviderLaneProfile["status"]) {
  switch (status) {
    case "ready":
      return "bg-emerald-100 text-emerald-800"
    case "warmup":
      return "bg-amber-100 text-amber-800"
    default:
      return "bg-slate-200 text-slate-800"
  }
}

export function getTemplatePlaybook(templateName: string) {
  return templatePlaybooks.find((playbook) => playbook.templateName === templateName)
}

export function getTemplateUsageCount(
  template: EmailTemplate,
  campaigns: Campaign[]
) {
  return campaigns.filter((campaign) => campaign.templateId === template.id).length
}
