import type { Campaign, EmailTemplate } from "@/lib/types"

export type ProviderId = Exclude<Campaign["provider"], undefined>

export interface ProviderLaneProfile {
  id: string
  provider: ProviderId
  title: string
  status: "ready" | "warmup" | "manual"
  activeDays: string
  sendWindow: string
  dailyVolume: string
  notes: string
}

export interface SenderIdentity {
  id: string
  provider: ProviderId
  fromName: string
  email: string
  replyTo: string
  domainId: string
  region: string
  status: "active" | "warmup" | "paused"
  volumeBand: string
  purpose: string
}

export interface EmailDomainProfile {
  id: string
  name: string
  provider: ProviderId
  status: "verified" | "warming" | "attention"
  region: string
  tracking: "enabled" | "partial" | "disabled"
  createdAt: string
}

export interface MetricPoint {
  date: string
  delivered: number
  clicked: number
  bounced: number
}

export const providerLanes: ProviderLaneProfile[] = [
  {
    id: "lane-resend-core",
    provider: "resend",
    title: "Resend Core",
    status: "ready",
    activeDays: "Mon-Wed",
    sendWindow: "08:30-13:00 CET",
    dailyVolume: "12k-20k/day",
    notes: "Primary invitation traffic and the cleanest event slices chosen by the sales team.",
  },
  {
    id: "lane-mailgun-scale",
    provider: "mailgun",
    title: "Mailgun Scale",
    status: "ready",
    activeDays: "Tue-Fri",
    sendWindow: "09:00-16:30 CET",
    dailyVolume: "20k-45k/day",
    notes: "Secondary invitation waves, reminders and brochure follow-up where volume matters.",
  },
  {
    id: "lane-kumo-volume",
    provider: "kumomta",
    title: "KumoMTA Volume",
    status: "manual",
    activeDays: "Mon-Sat",
    sendWindow: "08:00-18:00 CET",
    dailyVolume: "50k-120k/day",
    notes: "Overflow and supervised high-volume pushes routed manually by operations.",
  },
]

export const senderIdentities: SenderIdentity[] = [
  {
    id: "sender-resend-irina",
    provider: "resend",
    fromName: "Irina Andres",
    email: "irina@mail.etapa-conferences.com",
    replyTo: "irina@mail.etapa-conferences.com",
    domainId: "domain-mail-etapa",
    region: "Ireland (eu-west-1)",
    status: "active",
    volumeBand: "3k-6k/day",
    purpose: "Primary invitation sender for pharma conferences and top-tier segments.",
  },
  {
    id: "sender-resend-events",
    provider: "resend",
    fromName: "EtapaHub Events",
    email: "events@mail.etapa-conferences.com",
    replyTo: "events@mail.etapa-conferences.com",
    domainId: "domain-mail-etapa",
    region: "Ireland (eu-west-1)",
    status: "active",
    volumeBand: "6k-10k/day",
    purpose: "Default conference invite identity for verified event segments.",
  },
  {
    id: "sender-resend-desk",
    provider: "resend",
    fromName: "Delegate Desk",
    email: "desk@mail.etapa-conferences.com",
    replyTo: "desk@mail.etapa-conferences.com",
    domainId: "domain-mail-etapa",
    region: "Ireland (eu-west-1)",
    status: "warmup",
    volumeBand: "1k-2k/day",
    purpose: "Warm-up identity for smaller city-based segments and test sends.",
  },
  {
    id: "sender-mailgun-programs",
    provider: "mailgun",
    fromName: "Programs Team",
    email: "programs@mg.etapahub.com",
    replyTo: "programs@mg.etapahub.com",
    domainId: "domain-mg-etapa",
    region: "EU Central",
    status: "active",
    volumeBand: "12k-20k/day",
    purpose: "Follow-up broadcasts and second wave outreach after core invitations.",
  },
  {
    id: "sender-mailgun-brochures",
    provider: "mailgun",
    fromName: "Brochure Desk",
    email: "brochure@mg.etapahub.com",
    replyTo: "brochure@mg.etapahub.com",
    domainId: "domain-mg-etapa",
    region: "EU Central",
    status: "active",
    volumeBand: "8k-14k/day",
    purpose: "Brochure and reminder sends where clicks matter more than replies.",
  },
  {
    id: "sender-kumo-ops",
    provider: "kumomta",
    fromName: "Operations Routing",
    email: "ops@relay.etapahub.net",
    replyTo: "ops@relay.etapahub.net",
    domainId: "domain-relay-etapa",
    region: "Romania VPS",
    status: "active",
    volumeBand: "40k-90k/day",
    purpose: "High-volume overflow and manual provider routing managed by operations.",
  },
]

export const emailDomains: EmailDomainProfile[] = [
  {
    id: "domain-mail-etapa",
    name: "mail.etapa-conferences.com",
    provider: "resend",
    status: "verified",
    region: "Ireland (eu-west-1)",
    tracking: "enabled",
    createdAt: "2026-03-02T08:00:00.000Z",
  },
  {
    id: "domain-mg-etapa",
    name: "mg.etapahub.com",
    provider: "mailgun",
    status: "verified",
    region: "EU Central",
    tracking: "enabled",
    createdAt: "2026-02-12T10:30:00.000Z",
  },
  {
    id: "domain-relay-etapa",
    name: "relay.etapahub.net",
    provider: "kumomta",
    status: "warming",
    region: "Romania VPS",
    tracking: "partial",
    createdAt: "2026-03-15T07:15:00.000Z",
  },
]

export const deliveryMetrics: MetricPoint[] = [
  { date: "Mar 10", delivered: 0, clicked: 0, bounced: 0 },
  { date: "Mar 11", delivered: 48, clicked: 0, bounced: 0 },
  { date: "Mar 12", delivered: 49, clicked: 26, bounced: 1 },
  { date: "Mar 13", delivered: 0, clicked: 0, bounced: 0 },
  { date: "Mar 14", delivered: 1, clicked: 1, bounced: 0 },
  { date: "Mar 15", delivered: 0, clicked: 0, bounced: 0 },
  { date: "Mar 16", delivered: 0, clicked: 0, bounced: 0 },
  { date: "Mar 17", delivered: 0, clicked: 0, bounced: 0 },
  { date: "Mar 18", delivered: 0, clicked: 0, bounced: 0 },
  { date: "Mar 19", delivered: 0, clicked: 0, bounced: 0 },
  { date: "Mar 20", delivered: 0, clicked: 0, bounced: 0 },
  { date: "Mar 21", delivered: 0, clicked: 0, bounced: 0 },
  { date: "Mar 22", delivered: 0, clicked: 0, bounced: 0 },
  { date: "Mar 23", delivered: 0, clicked: 0, bounced: 0 },
  { date: "Mar 24", delivered: 0, clicked: 0, bounced: 0 },
]

export function formatProviderLabel(provider?: Campaign["provider"]) {
  switch (provider) {
    case "mailgun":
      return "Mailgun"
    case "kumomta":
      return "KumoMTA"
    case "manual":
      return "Manual"
    default:
      return "Resend"
  }
}

export function getProviderBadgeClass(provider?: Campaign["provider"]) {
  switch (provider) {
    case "mailgun":
      return "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"
    case "kumomta":
      return "border-violet-400/20 bg-violet-500/10 text-violet-200"
    case "manual":
      return "border-zinc-400/20 bg-zinc-500/10 text-zinc-200"
    default:
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
  }
}

export function getProviderStatusBadgeClass(status: ProviderLaneProfile["status"]) {
  switch (status) {
    case "ready":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
    case "warmup":
      return "border-amber-400/20 bg-amber-500/10 text-amber-200"
    default:
      return "border-slate-400/20 bg-slate-500/10 text-slate-200"
  }
}

export function getDomainStatusBadgeClass(status: EmailDomainProfile["status"]) {
  switch (status) {
    case "verified":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
    case "warming":
      return "border-amber-400/20 bg-amber-500/10 text-amber-200"
    default:
      return "border-rose-400/20 bg-rose-500/10 text-rose-200"
  }
}

export function getTrackingBadgeClass(tracking: EmailDomainProfile["tracking"]) {
  switch (tracking) {
    case "enabled":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
    case "partial":
      return "border-amber-400/20 bg-amber-500/10 text-amber-200"
    default:
      return "border-zinc-400/20 bg-zinc-500/10 text-zinc-200"
  }
}

export function getSenderStatusBadgeClass(status: SenderIdentity["status"]) {
  switch (status) {
    case "active":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
    case "warmup":
      return "border-amber-400/20 bg-amber-500/10 text-amber-200"
    default:
      return "border-zinc-400/20 bg-zinc-500/10 text-zinc-200"
  }
}

export function getSenderIdentity(senderId: string | null | undefined) {
  return senderIdentities.find((sender) => sender.id === senderId)
}

export function getSenderByEmail(email: string) {
  return senderIdentities.find((sender) => sender.email.toLowerCase() === email.toLowerCase())
}

export function getDomainById(domainId: string | null | undefined) {
  return emailDomains.find((domain) => domain.id === domainId)
}

export function getDomainByEmail(email: string) {
  const domainName = email.split("@")[1]?.toLowerCase()
  return emailDomains.find((domain) => domain.name.toLowerCase() === domainName)
}

export function getTemplateUsageCount(template: EmailTemplate, campaigns: Campaign[]) {
  return campaigns.filter((campaign) => campaign.templateId === template.id).length
}

export function getTemplateSlug(template: EmailTemplate) {
  return template.name.toLowerCase().replace(/\s+/g, "-")
}

export function getBroadcastOpenRate(campaign: Campaign) {
  if (campaign.deliveredCount === 0) return 0
  return Number(((campaign.openedCount / campaign.deliveredCount) * 100).toFixed(1))
}

export function getBroadcastClickRate(campaign: Campaign) {
  if (campaign.deliveredCount === 0) return 0
  return Number(((campaign.clickedCount / campaign.deliveredCount) * 100).toFixed(1))
}

export function getBroadcastDeliverability(campaign: Campaign) {
  if (campaign.sentCount === 0) return 0
  return Number(((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1))
}

export function extractLinksFromText(text?: string) {
  if (!text) return []

  const matches = text.match(/https?:\/\/[^\s)]+/g) ?? []
  return Array.from(new Set(matches))
}
