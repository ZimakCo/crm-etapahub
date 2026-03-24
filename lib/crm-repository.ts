import {
  generateActivities,
  generateContactCampaignHistory,
  generateEventParticipations,
  generatePayments,
  mockCampaigns,
  mockCompanies,
  mockContacts,
  mockDashboardStats,
  mockEvents,
  mockInvoices,
  mockRegistrations,
  mockSegments,
  mockTemplates,
} from "@/lib/mock-data"
import {
  emailDomains as initialEmailDomains,
  senderIdentities as initialSenderIdentities,
  webhookEndpoints as initialWebhookEndpoints,
} from "@/lib/email-ops"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import type {
  Activity,
  Campaign,
  Company,
  Contact,
  ContactCampaignHistory,
  ContactFilter,
  ContactSort,
  DashboardStats,
  EmailDomainProfile,
  EmailTemplate,
  Event,
  EventParticipation,
  Invoice,
  MarketingCampaign,
  Payment,
  RecentActivityItem,
  Registration,
  Segment,
  SenderIdentity,
  Suppression,
  WebhookEndpoint,
} from "@/lib/types"

export interface CreateContactInput {
  firstName: string
  lastName: string
  email: string
  company?: string
  jobTitle?: string
  phone?: string
  linkedin?: string
  country?: string
  city?: string
  industry?: string
  companySize?: string
  leadSource?: string
  tags?: string[]
  contactType?: Contact["contactType"]
  ownerName?: string
  notes?: string
  segmentIds?: string[]
}

export interface UpdateContactInput {
  firstName?: string
  lastName?: string
  email?: string
  company?: string
  jobTitle?: string
  phone?: string
  linkedin?: string
  country?: string
  city?: string
  industry?: string
  companySize?: string
  leadSource?: string
  tags?: string[]
  contactType?: Contact["contactType"]
  ownerName?: string
  notes?: string
  brochureStatus?: Contact["brochureStatus"]
}

export interface CreateCompanyInput {
  name: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  vatId?: string
  taxId?: string
  industry?: string
  website?: string
  phone?: string
}

export interface ImportContactsInput {
  contacts: CreateContactInput[]
  batchTag?: string
  leadSource?: string
  segmentName?: string
}

export interface CreateSegmentInput {
  name: string
  description: string
  groupLogic?: Segment["groupLogic"]
  isActive?: boolean
  segmentKind?: Segment["segmentKind"]
  contactIds?: string[]
}

export interface CreateEventInput {
  name: string
  type: Event["type"]
  date: string
  location: string
  description: string
  capacity: number
}

export interface AddEventAttendeeInput {
  eventId: string
  contactId: string
  status: EventParticipation["status"]
  notes?: string
}

export interface CreateRegistrationInput {
  eventId: string
  contactId: string
  companyId?: string
  companyName?: string
  ticketType: Registration["ticketType"]
  ticketPrice: number
  currency: Registration["currency"]
  quantity: number
  status: Registration["status"]
  additionalAttendees?: Registration["additionalAttendees"]
  adminNotes?: string
  specialRequirements?: string
}

export interface CreateInvoiceLineItemInput {
  description: string
  quantity: number
  unitPrice: number
}

export interface CreateInvoiceInput {
  registrationId: string
  invoiceNumber?: string
  invoiceDate: string
  dueDate: string
  status?: Invoice["status"]
  taxRate?: number
  currency?: Invoice["currency"]
  lineItems?: CreateInvoiceLineItemInput[]
  adminNotes?: string
  publicNotes?: string
}

export interface RecordPaymentInput {
  invoiceId: string
  amount: number
  currency: Payment["currency"]
  paymentDate: string
  paymentMethod: Payment["paymentMethod"]
  paymentReference?: string
  status: Payment["status"]
  notes?: string
}

export interface CreateCampaignInput {
  name: string
  provider: Campaign["provider"]
  marketingCampaignId?: string
  senderIdentityId?: string
  subject: string
  previewText: string
  fromName: string
  fromEmail: string
  replyTo: string
  status: Campaign["status"]
  notes?: string
  scheduledAt?: string
  segmentIds: string[]
  templateId?: string
  saveAsTemplate?: boolean
  templateName?: string
  templateFormat?: EmailTemplate["format"]
  textContent?: string
  htmlContent?: string
}

export interface CreateTemplateInput {
  name: string
  format: EmailTemplate["format"]
  subject: string
  previewText: string
  textContent?: string
  htmlContent?: string
}

export interface UpdateTemplateInput {
  name?: string
  format?: EmailTemplate["format"]
  subject?: string
  previewText?: string
  textContent?: string
  htmlContent?: string
}

export interface CreateEmailDomainInput {
  name: string
  provider: EmailDomainProfile["provider"]
  status: EmailDomainProfile["status"]
  region: string
  tracking: EmailDomainProfile["tracking"]
  notes?: string
}

export interface UpdateEmailDomainInput extends Partial<CreateEmailDomainInput> {}

export interface CreateSenderIdentityInput {
  provider: SenderIdentity["provider"]
  fromName: string
  email: string
  replyTo: string
  domainId: string
  region: string
  status: SenderIdentity["status"]
  volumeBand: string
  purpose: string
}

export interface UpdateSenderIdentityInput extends Partial<CreateSenderIdentityInput> {}

export interface CreateWebhookEndpointInput {
  provider: WebhookEndpoint["provider"]
  label: string
  url: string
  status: WebhookEndpoint["status"]
  events: string[]
  notes?: string
  lastEventAt?: string
}

export interface UpdateWebhookEndpointInput extends Partial<CreateWebhookEndpointInput> {}

export interface CreateMarketingCampaignInput {
  name: string
  status: MarketingCampaign["status"]
  objective: string
  ownerName?: string
  eventId?: string
  templateId?: string
  notes?: string
}

export interface CreateSuppressionInput {
  contactId?: string
  email: string
  reason: Suppression["reason"]
  sourceProvider?: Suppression["sourceProvider"]
  sourceBroadcastId?: string
  notes?: string
}

const memoryContacts = [...mockContacts]
const memoryCampaigns = mockCampaigns.map((campaign, index) => {
  if (index === 0) {
    return {
      ...campaign,
      marketingCampaignId: "marketing-campaign-pharma-2026",
      marketingCampaignName: "EtapaHub Pharma Summit 2026",
    }
  }

  if (index === 1) {
    return {
      ...campaign,
      marketingCampaignId: "marketing-campaign-brochure-requests",
      marketingCampaignName: "Brochure Follow-up Q1",
    }
  }

  return campaign
})
const memorySegments = [...mockSegments]
const memoryEvents = [...mockEvents]
const memoryCompanies = [...mockCompanies]
const memoryRegistrations = [...mockRegistrations]
const memoryInvoices = [...mockInvoices]
const memoryTemplates = [...mockTemplates]
const memoryMarketingCampaigns: MarketingCampaign[] = [
  {
    id: "marketing-campaign-pharma-2026",
    name: "EtapaHub Pharma Summit 2026",
    slug: "etapahub-pharma-summit-2026",
    status: "active",
    objective: "Drive VIP and delegate registrations for the flagship pharma summit.",
    ownerName: "Events Desk",
    eventId: "50000000-0000-0000-0000-000000000001",
    eventName: "EtapaHub Pharma Summit 2026",
    templateId: "35000000-0000-0000-0000-000000000001",
    templateName: "EtapaHub Pharma Invite",
    notes: "Main invitation program split across seller-built city segments.",
    broadcastCount: 1,
    sentCount: 3,
    deliveredCount: 2,
    clickedCount: 1,
    repliedCount: 1,
    createdAt: "2026-03-08T08:00:00.000Z",
    updatedAt: "2026-03-22T08:00:00.000Z",
  },
  {
    id: "marketing-campaign-brochure-requests",
    name: "Brochure Follow-up Q1",
    slug: "brochure-follow-up-q1",
    status: "active",
    objective: "Follow up brochure requests with delivery-first plain text outreach.",
    ownerName: "Operations",
    templateId: "35000000-0000-0000-0000-000000000002",
    templateName: "Brochure Follow-up",
    notes: "Used for manual seller queues after brochure intent is confirmed.",
    broadcastCount: 1,
    sentCount: 0,
    deliveredCount: 0,
    clickedCount: 0,
    repliedCount: 0,
    createdAt: "2026-03-20T12:00:00.000Z",
    updatedAt: "2026-03-22T12:00:00.000Z",
  },
]
const memoryEmailDomains = [...initialEmailDomains]
const memorySenderIdentities = [...initialSenderIdentities]
const memoryWebhookEndpoints = [...initialWebhookEndpoints]
const memorySuppressions: Suppression[] = [
  {
    id: "suppression-andrea-bounce",
    contactId: "20000000-0000-0000-0000-000000000005",
    contactName: "Andrea Bianchi",
    email: "andrea.bianchi@astrazeneca.com",
    reason: "hard_bounce",
    sourceProvider: "resend",
    sourceBroadcastId: "40000000-0000-0000-0000-000000000001",
    sourceBroadcastName: "Pharma Summit Invite Wave 1",
    status: "active",
    notes: "Hard bounce captured from provider webhook.",
    createdAt: "2026-03-10T08:02:00.000Z",
    updatedAt: "2026-03-10T08:02:00.000Z",
  },
  {
    id: "suppression-sophie-unsub",
    contactId: "20000000-0000-0000-0000-000000000004",
    contactName: "Sophie Meyer",
    email: "sophie.meyer@novartis.com",
    reason: "unsubscribe",
    sourceProvider: "manual",
    status: "active",
    notes: "Manual unsubscribe requested via operations.",
    createdAt: "2026-03-12T15:00:00.000Z",
    updatedAt: "2026-03-12T15:00:00.000Z",
  },
]
const memoryPayments: Payment[] = memoryInvoices.slice(0, 4).flatMap((invoice) => generatePayments(invoice.id))
const memoryActivities = new Map<string, Activity[]>()
const memoryEventParticipations = new Map<string, EventParticipation[]>()
const memoryCampaignHistory = new Map<string, ContactCampaignHistory[]>()

function nowIso() {
  return new Date().toISOString()
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[]))
}

function roundAmount(value: number) {
  return Number(value.toFixed(2))
}

function ensureArray<T>(value: T[] | null | undefined) {
  return Array.isArray(value) ? value : []
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ""
}

function slugify(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function buildInvoiceNumber(invoiceDate: string) {
  const date = new Date(invoiceDate)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `ETP-${year}${month}${day}-${suffix}`
}

function calculateInvoiceAmounts(lineItems: CreateInvoiceLineItemInput[], taxRate: number) {
  const normalizedLineItems = lineItems.map((item) => ({
    ...item,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    totalPrice: roundAmount(Number(item.quantity) * Number(item.unitPrice)),
  }))

  const subtotal = roundAmount(
    normalizedLineItems.reduce((sum, item) => sum + item.totalPrice, 0)
  )
  const taxAmount = roundAmount(subtotal * taxRate)
  const totalAmount = roundAmount(subtotal + taxAmount)

  return {
    lineItems: normalizedLineItems,
    subtotal,
    taxAmount,
    totalAmount,
  }
}

function deriveInvoicePaymentStatus(amountPaid: number, totalAmount: number): Invoice["paymentStatus"] {
  if (amountPaid <= 0) {
    return "unpaid"
  }

  if (amountPaid >= totalAmount) {
    return "paid"
  }

  return "partially_paid"
}

function deriveInvoiceStatus(
  currentStatus: Invoice["status"],
  paymentStatus: Invoice["paymentStatus"]
): Invoice["status"] {
  if (currentStatus === "cancelled" || currentStatus === "refunded") {
    return currentStatus
  }

  if (paymentStatus === "paid") {
    return "paid"
  }

  if (paymentStatus === "partially_paid") {
    return "partially_paid"
  }

  return currentStatus === "draft" ? "draft" : "issued"
}

function toRelativeTime(dateString: string) {
  const diffMs = new Date(dateString).getTime() - Date.now()
  const minutes = Math.round(diffMs / 60000)
  const absMinutes = Math.abs(minutes)
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  if (absMinutes < 60) {
    return formatter.format(minutes, "minute")
  }

  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour")
  }

  const days = Math.round(hours / 24)
  return formatter.format(days, "day")
}

function getMemoryActivities(contactId: string) {
  if (!memoryActivities.has(contactId)) {
    memoryActivities.set(contactId, generateActivities(contactId, 8))
  }
  return memoryActivities.get(contactId)!
}

function getMemoryParticipations(contactId: string) {
  if (!memoryEventParticipations.has(contactId)) {
    const fallback = generateEventParticipations(contactId)
    const fromRegistrations = memoryRegistrations
      .filter((registration) => registration.contactId === contactId)
      .map<EventParticipation>((registration) => ({
        id: makeId("participation"),
        contactId,
        eventId: registration.eventId,
        status: registration.status === "confirmed" ? "confirmed" : "registered",
        registeredAt: registration.registeredAt,
        confirmedAt: registration.confirmedAt,
      }))

    memoryEventParticipations.set(contactId, [...fromRegistrations, ...fallback])
  }

  return memoryEventParticipations.get(contactId)!
}

function getMemoryCampaignHistory(contactId: string) {
  if (!memoryCampaignHistory.has(contactId)) {
    memoryCampaignHistory.set(contactId, generateContactCampaignHistory(contactId))
  }
  return memoryCampaignHistory.get(contactId)!
}

function recountMemorySegmentMemberships() {
  const updatedAt = nowIso()
  memorySegments.forEach((segment) => {
    segment.contactCount = memoryContacts.filter((contact) =>
      contact.segments.includes(segment.name)
    ).length
    segment.lastCalculatedAt = updatedAt
  })
}

function recountMemoryMarketingCampaigns() {
  memoryMarketingCampaigns.forEach((marketingCampaign) => {
    const relatedBroadcasts = memoryCampaigns.filter(
      (broadcast) => broadcast.marketingCampaignId === marketingCampaign.id
    )

    marketingCampaign.broadcastCount = relatedBroadcasts.length
    marketingCampaign.sentCount = relatedBroadcasts.reduce(
      (sum, broadcast) => sum + broadcast.sentCount,
      0
    )
    marketingCampaign.deliveredCount = relatedBroadcasts.reduce(
      (sum, broadcast) => sum + broadcast.deliveredCount,
      0
    )
    marketingCampaign.clickedCount = relatedBroadcasts.reduce(
      (sum, broadcast) => sum + broadcast.clickedCount,
      0
    )
    marketingCampaign.repliedCount = relatedBroadcasts.reduce(
      (sum, broadcast) => sum + broadcast.repliedCount,
      0
    )
    marketingCampaign.updatedAt = relatedBroadcasts[0]?.updatedAt ?? marketingCampaign.updatedAt
  })
}

function ensureCompanySnapshot(row: Record<string, any>): Company {
  const nestedCompany = row.company

  return {
    id: row.company_id ?? nestedCompany?.id ?? makeId("company"),
    name: row.company_name ?? nestedCompany?.name ?? "Unknown company",
    address: nestedCompany?.address ?? "",
    city: nestedCompany?.city ?? "",
    country: nestedCompany?.country ?? "",
    postalCode: nestedCompany?.postal_code ?? "",
    vatId: nestedCompany?.vat_id ?? undefined,
    taxId: nestedCompany?.tax_id ?? undefined,
    industry: nestedCompany?.industry ?? undefined,
    website: nestedCompany?.website ?? undefined,
    phone: nestedCompany?.phone ?? undefined,
  }
}

function mapContactRow(row: Record<string, any>): Contact {
  const segmentLinks = ensureArray<Record<string, any>>(row.segment_links)
  const segments = uniqueValues(
    segmentLinks.map((link: Record<string, any>) => link.segment?.name)
  )

  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    company: row.company_name ?? row.company?.name ?? "",
    companyId: row.company_id ?? undefined,
    jobTitle: row.job_title ?? "",
    phone: row.phone ?? "",
    linkedin: row.linkedin ?? "",
    country: row.country ?? "",
    city: row.city ?? "",
    industry: row.industry ?? "",
    companySize: row.company_size ?? "",
    leadSource: row.lead_source ?? "",
    tags: ensureArray<string>(row.tags),
    segments,
    contactType: row.contact_type ?? undefined,
    ownerName: row.owner_name ?? undefined,
    brochureStatus: row.brochure_status ?? undefined,
    hasReplied: Boolean(row.last_reply_at),
    lastReplyAt: row.last_reply_at ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastActivityAt: row.last_activity_at ?? row.updated_at ?? row.created_at,
    emailStatus: row.email_status ?? "unknown",
    subscriptionStatus: row.subscription_status ?? "subscribed",
  }
}

function mapSegmentRow(row: Record<string, any>): Segment {
  const memberships = ensureArray<Record<string, any>>(row.memberships)
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    ruleGroups: ensureArray(row.rule_groups),
    groupLogic: row.group_logic ?? "AND",
    contactCount: memberships.length,
    isActive: row.is_active ?? true,
    segmentKind: row.segment_kind ?? "manual",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastCalculatedAt: row.last_calculated_at ?? row.updated_at ?? row.created_at,
  }
}

function mapCampaignRow(row: Record<string, any>): Campaign {
  const recipients = ensureArray<Record<string, any>>(row.recipients)
  const segmentLinks = ensureArray<Record<string, any>>(row.campaign_segments)
  const deliveredStatuses = new Set(["sent", "delivered", "opened", "clicked", "replied"])

  return {
    id: row.id,
    name: row.name,
    provider: row.provider ?? "resend",
    marketingCampaignId: row.marketing_campaign_id ?? row.marketing_campaign?.id ?? undefined,
    marketingCampaignName: row.marketing_campaign?.name ?? undefined,
    senderIdentityId: row.sender_identity_id ?? undefined,
    templateId: row.template?.id ?? undefined,
    templateName: row.template?.name ?? undefined,
    templateFormat: row.template?.format ?? undefined,
    subject: row.subject ?? "",
    previewText: row.preview_text ?? "",
    fromName: row.from_name ?? "",
    fromEmail: row.from_email ?? "",
    replyTo: row.reply_to ?? "",
    status: row.status ?? "draft",
    notes: row.notes ?? undefined,
    segmentIds: uniqueValues(segmentLinks.map((link: Record<string, any>) => link.segment?.id)),
    segmentNames: uniqueValues(segmentLinks.map((link: Record<string, any>) => link.segment?.name)),
    totalRecipients: recipients.length,
    sentCount: recipients.filter((recipient: Record<string, any>) => recipient.sent_at || recipient.delivery_status).length,
    deliveredCount: recipients.filter((recipient: Record<string, any>) => deliveredStatuses.has(recipient.delivery_status)).length,
    openedCount: recipients.filter((recipient: Record<string, any>) => Boolean(recipient.opened_at)).length,
    clickedCount: recipients.filter((recipient: Record<string, any>) => Boolean(recipient.clicked_at)).length,
    repliedCount: recipients.filter((recipient: Record<string, any>) => Boolean(recipient.replied_at)).length,
    bouncedCount: recipients.filter((recipient: Record<string, any>) => recipient.delivery_status === "bounced").length,
    unsubscribedCount: recipients.filter((recipient: Record<string, any>) => recipient.delivery_status === "unsubscribed" || recipient.unsubscribed_at).length,
    scheduledAt: row.scheduled_at ?? undefined,
    sentAt: row.sent_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    htmlContent: row.template?.html_content ?? undefined,
    textContent: row.template?.text_content ?? undefined,
  }
}

function mapEventRow(row: Record<string, any>): Event {
  const participants = ensureArray<Record<string, any>>(row.participants)
  const activeParticipants = participants.filter(
    (participant: Record<string, any>) => participant.status !== "cancelled"
  )

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    date: row.date,
    location: row.location ?? "",
    description: row.description ?? "",
    capacity: row.capacity ?? 0,
    registeredCount: activeParticipants.length,
    attendedCount: participants.filter((participant: Record<string, any>) => participant.status === "attended").length,
    status: row.status ?? "upcoming",
    createdAt: row.created_at,
  }
}

function mapRegistrationRow(row: Record<string, any>): Registration {
  return {
    id: row.id,
    eventId: row.event_id,
    eventName: row.event_name,
    contactId: row.contact_id,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    companyId: row.company_id,
    company: ensureCompanySnapshot(row),
    ticketType: row.ticket_type,
    ticketPrice: Number(row.ticket_price ?? 0),
    currency: row.currency,
    quantity: Number(row.quantity ?? 0),
    totalAmount: Number(row.total_amount ?? 0),
    status: row.status,
    registeredAt: row.registered_at,
    confirmedAt: row.confirmed_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    invoiceId: row.invoice_id ?? undefined,
    additionalAttendees: ensureArray(row.additional_attendees),
    adminNotes: row.admin_notes ?? undefined,
    specialRequirements: row.special_requirements ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapInvoiceRow(row: Record<string, any>): Invoice {
  const lineItems = ensureArray<Record<string, any>>(row.line_items)

  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date,
    status: row.status,
    registrationId: row.registration_id,
    eventId: row.event_id,
    eventName: row.event_name,
    contactId: row.contact_id,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    companyId: row.company_id,
    company: ensureCompanySnapshot(row),
    lineItems: lineItems.map((item: Record<string, any>) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity ?? 0),
      unitPrice: Number(item.unit_price ?? 0),
      totalPrice: Number(item.total_price ?? 0),
    })),
    subtotal: Number(row.subtotal ?? 0),
    taxRate: Number(row.tax_rate ?? 0),
    taxAmount: Number(row.tax_amount ?? 0),
    totalAmount: Number(row.total_amount ?? 0),
    currency: row.currency,
    amountPaid: Number(row.amount_paid ?? 0),
    balanceDue: Number(row.balance_due ?? 0),
    paymentStatus: row.payment_status,
    adminNotes: row.admin_notes ?? undefined,
    publicNotes: row.public_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapPaymentRow(row: Record<string, any>): Payment {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    amount: Number(row.amount ?? 0),
    currency: row.currency,
    paymentDate: row.payment_date,
    paymentMethod: row.payment_method,
    paymentReference: row.payment_reference ?? undefined,
    status: row.status ?? "completed",
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by ?? "System",
  }
}

function mapTemplateRow(row: Record<string, any>): EmailTemplate {
  return {
    id: row.id,
    name: row.name,
    format: row.format,
    subject: row.subject ?? "",
    previewText: row.preview_text ?? "",
    textContent: row.text_content ?? undefined,
    htmlContent: row.html_content ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapMarketingCampaignRow(row: Record<string, any>): MarketingCampaign {
  const broadcasts = ensureArray<Record<string, any>>(row.broadcasts)

  return {
    id: row.id,
    name: row.name,
    slug: row.slug ?? slugify(row.name),
    status: row.status ?? "planning",
    objective: row.objective ?? "",
    ownerName: row.owner_name ?? undefined,
    eventId: row.event_id ?? undefined,
    eventName: row.event_name ?? undefined,
    templateId: row.template_id ?? row.template?.id ?? undefined,
    templateName: row.template?.name ?? undefined,
    notes: row.notes ?? undefined,
    broadcastCount: broadcasts.length,
    sentCount: broadcasts.reduce((sum, broadcast) => sum + Number(broadcast.sent_count ?? 0), 0),
    deliveredCount: broadcasts.reduce((sum, broadcast) => sum + Number(broadcast.delivered_count ?? 0), 0),
    clickedCount: broadcasts.reduce((sum, broadcast) => sum + Number(broadcast.clicked_count ?? 0), 0),
    repliedCount: broadcasts.reduce((sum, broadcast) => sum + Number(broadcast.replied_count ?? 0), 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapEmailDomainRow(row: Record<string, any>): EmailDomainProfile {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider,
    status: row.status,
    region: row.region ?? "",
    tracking: row.tracking ?? "enabled",
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapSenderIdentityRow(row: Record<string, any>): SenderIdentity {
  return {
    id: row.id,
    provider: row.provider,
    fromName: row.from_name ?? "",
    email: row.email,
    replyTo: row.reply_to ?? "",
    domainId: row.domain_id,
    region: row.region ?? "",
    status: row.status ?? "active",
    volumeBand: row.volume_band ?? "",
    purpose: row.purpose ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapWebhookEndpointRow(row: Record<string, any>): WebhookEndpoint {
  return {
    id: row.id,
    provider: row.provider,
    label: row.label ?? "",
    url: row.url,
    status: row.status ?? "healthy",
    events: ensureArray<string>(row.events),
    notes: row.notes ?? undefined,
    lastEventAt: row.last_event_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapSuppressionRow(row: Record<string, any>): Suppression {
  return {
    id: row.id,
    contactId: row.contact_id ?? undefined,
    contactName:
      row.contact?.first_name && row.contact?.last_name
        ? `${row.contact.first_name} ${row.contact.last_name}`.trim()
        : undefined,
    email: row.email,
    reason: row.reason,
    sourceProvider: row.source_provider ?? undefined,
    sourceBroadcastId: row.source_broadcast_id ?? undefined,
    sourceBroadcastName: row.source_broadcast?.name ?? undefined,
    status: row.status ?? "active",
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toRecentActivity(activity: Activity, contact?: Contact): RecentActivityItem {
  return {
    id: activity.id,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    timestamp: toRelativeTime(activity.createdAt),
    contact: contact
      ? {
          name: `${contact.firstName} ${contact.lastName}`,
          email: contact.email,
        }
      : undefined,
  }
}

async function withSupabaseFallback<T>(
  label: string,
  supabaseTask: () => Promise<T>,
  fallbackTask: () => T | Promise<T>
) {
  if (!isSupabaseConfigured()) {
    return fallbackTask()
  }

  try {
    return await supabaseTask()
  } catch (error) {
    console.error(`[crm] ${label}`, error)
    return fallbackTask()
  }
}

async function findOrCreateCompanyId(companyName: string) {
  const trimmedName = normalizeText(companyName)

  if (!trimmedName) {
    return { companyId: null as string | null, companyName: "" }
  }

  return withSupabaseFallback(
    "findOrCreateCompanyId",
    async () => {
      const supabase = createClient()
      const { data: existingCompany, error: lookupError } = await supabase
        .from("crm_companies")
        .select("id, name")
        .eq("name", trimmedName)
        .maybeSingle()

      if (lookupError) {
        throw lookupError
      }

      if (existingCompany) {
        return { companyId: existingCompany.id as string, companyName: existingCompany.name as string }
      }

      const { data: createdCompany, error: insertError } = await supabase
        .from("crm_companies")
        .insert({
          name: trimmedName,
        })
        .select("id, name")
        .single()

      if (insertError) {
        throw insertError
      }

      return { companyId: createdCompany.id as string, companyName: createdCompany.name as string }
    },
    () => {
      const existingCompany = memoryCompanies.find((company) => company.name === trimmedName)
      if (existingCompany) {
        return { companyId: existingCompany.id, companyName: existingCompany.name }
      }

      const company: Company = {
        id: makeId("company"),
        name: trimmedName,
        address: "",
        city: "",
        country: "",
        postalCode: "",
      }
      memoryCompanies.push(company)
      return { companyId: company.id, companyName: company.name }
    }
  )
}

async function addContactActivity(contactId: string, activity: Omit<Activity, "id" | "contactId" | "createdAt">) {
  return withSupabaseFallback(
    "addContactActivity",
    async () => {
      const supabase = createClient()
      const { error } = await supabase.from("crm_activities").insert({
        contact_id: contactId,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        metadata: activity.metadata,
        created_by: activity.createdBy,
      })

      if (error) {
        throw error
      }
    },
    () => {
      getMemoryActivities(contactId).unshift({
        id: makeId("activity"),
        contactId,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        metadata: activity.metadata,
        createdAt: nowIso(),
        createdBy: activity.createdBy,
      })
    }
  )
}

async function resolveCompanySnapshot(companyId?: string | null, companyName?: string) {
  if (companyId) {
    const existingCompany = await getCompany(companyId)
    if (existingCompany) {
      return existingCompany
    }
  }

  const resolvedCompany = await findOrCreateCompanyId(companyName ?? "")
  if (resolvedCompany.companyId) {
    const existingCompany = await getCompany(resolvedCompany.companyId)
    if (existingCompany) {
      return existingCompany
    }
  }

  return {
    id: resolvedCompany.companyId ?? makeId("company"),
    name: resolvedCompany.companyName || normalizeText(companyName) || "Unknown company",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  } satisfies Company
}

export async function listContacts(filters?: ContactFilter[], sort?: ContactSort) {
  return withSupabaseFallback(
    "listContacts",
    async () => {
      const supabase = createClient()
      const query = supabase
        .from("crm_contacts")
        .select(`
          *,
          segment_links:crm_segment_contacts(
            segment:crm_segments(id, name)
          )
        `)

      if (sort?.field) {
        const fieldMap: Record<string, string> = {
          firstName: "first_name",
          lastName: "last_name",
          email: "email",
          company: "company_name",
          jobTitle: "job_title",
          lastActivityAt: "last_activity_at",
        }
        const sortField = fieldMap[sort.field] ?? "last_name"
        query.order(sortField, { ascending: sort.direction !== "desc" })
      } else {
        query.order("last_name", { ascending: true })
      }

      const { data, error } = await query
      if (error) {
        throw error
      }

      let contacts = ensureArray(data).map((row) => mapContactRow(row))

      if (filters?.length) {
        contacts = contacts.filter((contact) =>
          filters.every((filter) => {
            const rawValue = (contact as Record<string, any>)[filter.field]
            if (Array.isArray(rawValue)) {
              return rawValue.includes(filter.value)
            }
            return String(rawValue ?? "").toLowerCase().includes(String(filter.value ?? "").toLowerCase())
          })
        )
      }

      return contacts
    },
    () => {
      const contacts = [...memoryContacts]
      if (sort?.field) {
        contacts.sort((left, right) => {
          const leftValue = (left as Record<string, any>)[sort.field]
          const rightValue = (right as Record<string, any>)[sort.field]
          return sort.direction === "desc"
            ? String(rightValue ?? "").localeCompare(String(leftValue ?? ""))
            : String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
        })
      }
      return contacts
    }
  )
}

export async function getContact(id: string) {
  const contacts = await listContacts()
  return contacts.find((contact) => contact.id === id) ?? null
}

export async function listCampaigns() {
  return withSupabaseFallback(
    "listCampaigns",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_campaigns")
        .select(`
          *,
          marketing_campaign:crm_marketing_campaigns(id, name),
          template:crm_templates(id, name, format, text_content, html_content),
          campaign_segments:crm_campaign_segments(
            segment:crm_segments(id, name)
          ),
          recipients:crm_campaign_recipients(
            id,
            delivery_status,
            sent_at,
            opened_at,
            clicked_at,
            replied_at,
            bounced_at,
            unsubscribed_at,
            complained_at
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      return ensureArray(data).map((row) => mapCampaignRow(row))
    },
    () => memoryCampaigns
  )
}

export async function getCampaign(id: string) {
  const campaigns = await listCampaigns()
  return campaigns.find((campaign) => campaign.id === id) ?? null
}

export async function listBroadcastsByMarketingCampaign(marketingCampaignId: string) {
  const broadcasts = await listCampaigns()
  return broadcasts.filter((broadcast) => broadcast.marketingCampaignId === marketingCampaignId)
}

export async function listMarketingCampaigns() {
  return withSupabaseFallback(
    "listMarketingCampaigns",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_marketing_campaigns")
        .select(`
          *,
          template:crm_templates(id, name),
          broadcasts:crm_campaigns(id)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      const broadcasts = await listCampaigns()

      return ensureArray(data).map((row): MarketingCampaign => {
        const relatedBroadcasts = broadcasts.filter(
          (broadcast) => broadcast.marketingCampaignId === row.id
        )

        return {
          ...mapMarketingCampaignRow({
            ...row,
            broadcasts: relatedBroadcasts.map((broadcast) => ({
              id: broadcast.id,
              sent_count: broadcast.sentCount,
              delivered_count: broadcast.deliveredCount,
              clicked_count: broadcast.clickedCount,
              replied_count: broadcast.repliedCount,
            })),
          }),
          templateName: row.template?.name ?? undefined,
        }
      })
    },
    () => {
      recountMemoryMarketingCampaigns()
      return [...memoryMarketingCampaigns].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      )
    }
  )
}

export async function getMarketingCampaign(id: string) {
  const campaigns = await listMarketingCampaigns()
  return campaigns.find((campaign) => campaign.id === id) ?? null
}

export async function createMarketingCampaign(input: CreateMarketingCampaignInput) {
  const event = input.eventId ? await getEvent(input.eventId) : null
  const template = input.templateId ? await getTemplate(input.templateId) : null
  const slug = slugify(input.name)
  const createdAt = nowIso()

  return withSupabaseFallback(
    "createMarketingCampaign",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_marketing_campaigns")
        .insert({
          name: input.name,
          slug,
          status: input.status,
          objective: input.objective,
          owner_name: input.ownerName,
          event_id: event?.id ?? null,
          event_name: event?.name ?? null,
          template_id: template?.id ?? null,
          notes: input.notes,
        })
        .select(`
          *,
          template:crm_templates(id, name),
          broadcasts:crm_campaigns(id)
        `)
        .single()

      if (error) {
        throw error
      }

      return {
        ...mapMarketingCampaignRow(data),
        templateName: template?.name,
      }
    },
    () => {
      const marketingCampaign: MarketingCampaign = {
        id: makeId("marketing-campaign"),
        name: input.name,
        slug,
        status: input.status,
        objective: input.objective,
        ownerName: input.ownerName,
        eventId: event?.id,
        eventName: event?.name,
        templateId: template?.id,
        templateName: template?.name,
        notes: input.notes,
        broadcastCount: 0,
        sentCount: 0,
        deliveredCount: 0,
        clickedCount: 0,
        repliedCount: 0,
        createdAt,
        updatedAt: createdAt,
      }
      memoryMarketingCampaigns.unshift(marketingCampaign)
      return marketingCampaign
    }
  )
}

export async function listSegments() {
  return withSupabaseFallback(
    "listSegments",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_segments")
        .select(`
          *,
          memberships:crm_segment_contacts(contact_id)
        `)
        .order("updated_at", { ascending: false })

      if (error) {
        throw error
      }

      return ensureArray(data).map((row) => mapSegmentRow(row))
    },
    () => memorySegments
  )
}

export async function getSegment(id: string) {
  const segments = await listSegments()
  return segments.find((segment) => segment.id === id) ?? null
}

export async function listEvents() {
  return withSupabaseFallback(
    "listEvents",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_events")
        .select(`
          *,
          participants:crm_event_participants(status)
        `)
        .order("date", { ascending: false })

      if (error) {
        throw error
      }

      return ensureArray(data).map((row) => mapEventRow(row))
    },
    () => memoryEvents
  )
}

export async function getEvent(id: string) {
  const events = await listEvents()
  return events.find((event) => event.id === id) ?? null
}

export async function listContactsByEvent(eventId: string) {
  return withSupabaseFallback(
    "listContactsByEvent",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_event_participants")
        .select(`
          contact:crm_contacts(
            *,
            segment_links:crm_segment_contacts(
              segment:crm_segments(id, name)
            )
          )
        `)
        .eq("event_id", eventId)

      if (error) {
        throw error
      }

      return ensureArray(data)
        .map((row: Record<string, any>) => row.contact)
        .filter(Boolean)
        .map((row: Record<string, any>) => mapContactRow(row))
    },
    () => {
      const registrationContacts = memoryRegistrations
        .filter((registration) => registration.eventId === eventId)
        .map((registration) => memoryContacts.find((contact) => contact.id === registration.contactId))
        .filter(Boolean) as Contact[]

      if (registrationContacts.length > 0) {
        return registrationContacts
      }

      return memoryContacts.slice(0, 6)
    }
  )
}

export async function listContactsByCompany(companyId: string) {
  const [company, contacts] = await Promise.all([getCompany(companyId), listContacts()])

  if (!company) {
    return []
  }

  return contacts.filter(
    (contact) =>
      contact.companyId === companyId ||
      (!contact.companyId && contact.company.toLowerCase() === company.name.toLowerCase())
  )
}

export async function getDashboardStats() {
  return withSupabaseFallback(
    "getDashboardStats",
    async () => {
      const [contacts, campaigns, events, segments] = await Promise.all([
        listContacts(),
        listCampaigns(),
        listEvents(),
        listSegments(),
      ])

      const sentCampaigns = campaigns.filter((campaign) => campaign.status === "sent")
      const average = (values: number[]) =>
        values.length === 0
          ? 0
          : Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(1))

      const openRates = sentCampaigns.map((campaign) =>
        campaign.deliveredCount > 0 ? (campaign.openedCount / campaign.deliveredCount) * 100 : 0
      )
      const clickRates = sentCampaigns.map((campaign) =>
        campaign.openedCount > 0 ? (campaign.clickedCount / campaign.openedCount) * 100 : 0
      )
      const thisMonth = new Date()
      const campaignsThisMonth = campaigns.filter((campaign) => {
        const createdAt = new Date(campaign.createdAt)
        return (
          createdAt.getUTCFullYear() === thisMonth.getUTCFullYear() &&
          createdAt.getUTCMonth() === thisMonth.getUTCMonth()
        )
      }).length

      return {
        totalContacts: contacts.length,
        contactsGrowth: contacts.length > 0 ? 8.4 : 0,
        totalCampaigns: sentCampaigns.length,
        campaignsThisMonth,
        avgOpenRate: average(openRates),
        openRateChange: 2.1,
        avgClickRate: average(clickRates),
        clickRateChange: 0.6,
        upcomingEvents: events.filter((event) => event.status === "upcoming" || event.status === "ongoing").length,
        activeSegments: segments.filter((segment) => segment.isActive).length,
      } satisfies DashboardStats
    },
    () => mockDashboardStats
  )
}

export async function listContactActivities(contactId: string) {
  return withSupabaseFallback(
    "listContactActivities",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_activities")
        .select("*")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      return ensureArray(data).map<Activity>((row: Record<string, any>) => ({
        id: row.id,
        contactId: row.contact_id,
        type: row.type,
        title: row.title,
        description: row.description,
        metadata: row.metadata ?? {},
        createdAt: row.created_at,
        createdBy: row.created_by ?? "System",
      }))
    },
    () => getMemoryActivities(contactId)
  )
}

export async function listContactEventParticipations(contactId: string) {
  return withSupabaseFallback(
    "listContactEventParticipations",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_event_participants")
        .select("*")
        .eq("contact_id", contactId)
        .order("registered_at", { ascending: false })

      if (error) {
        throw error
      }

      return ensureArray(data).map<EventParticipation>((row: Record<string, any>) => ({
        id: row.id,
        contactId: row.contact_id,
        eventId: row.event_id,
        status: row.status,
        registeredAt: row.registered_at,
        confirmedAt: row.confirmed_at ?? undefined,
        attendedAt: row.attended_at ?? undefined,
        notes: row.notes ?? undefined,
      }))
    },
    () => getMemoryParticipations(contactId)
  )
}

export async function listContactCampaignHistory(contactId: string) {
  return withSupabaseFallback(
    "listContactCampaignHistory",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_campaign_recipients")
        .select(`
          campaign:crm_campaigns(name),
          campaign_id,
          sent_at,
          opened_at,
          clicked_at,
          replied_at
        `)
        .eq("contact_id", contactId)
        .order("sent_at", { ascending: false })

      if (error) {
        throw error
      }

      return ensureArray(data).map<ContactCampaignHistory>((row: Record<string, any>) => ({
        campaignId: row.campaign_id,
        campaignName: row.campaign?.name ?? "Campaign",
        sentAt: row.sent_at ?? nowIso(),
        opened: Boolean(row.opened_at),
        openedAt: row.opened_at ?? undefined,
        clicked: Boolean(row.clicked_at),
        clickedAt: row.clicked_at ?? undefined,
        replied: Boolean(row.replied_at),
        repliedAt: row.replied_at ?? undefined,
      }))
    },
    () => getMemoryCampaignHistory(contactId)
  )
}

export async function listRecentActivities() {
  return withSupabaseFallback(
    "listRecentActivities",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_activities")
        .select(`
          *,
          contact:crm_contacts(
            *,
            segment_links:crm_segment_contacts(
              segment:crm_segments(id, name)
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(6)

      if (error) {
        throw error
      }

      return ensureArray(data).map((row: Record<string, any>) =>
        toRecentActivity(
          {
            id: row.id,
            contactId: row.contact_id,
            type: row.type,
            title: row.title,
            description: row.description,
            metadata: row.metadata ?? {},
            createdAt: row.created_at,
            createdBy: row.created_by ?? "System",
          },
          row.contact ? mapContactRow(row.contact) : undefined
        )
      )
    },
    () => {
      const recentActivities = memoryContacts
        .flatMap((contact) =>
          getMemoryActivities(contact.id).slice(0, 2).map((activity) => ({ activity, contact }))
        )
        .sort(
          (left, right) =>
            new Date(right.activity.createdAt).getTime() - new Date(left.activity.createdAt).getTime()
        )
        .slice(0, 6)

      return recentActivities.map(({ activity, contact }) => toRecentActivity(activity, contact))
    }
  )
}

export async function listInvoices() {
  return withSupabaseFallback(
    "listInvoices",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_invoices")
        .select(`
          *,
          company:crm_companies(*),
          line_items:crm_invoice_line_items(*)
        `)
        .order("invoice_date", { ascending: false })

      if (error) {
        throw error
      }

      return ensureArray(data).map((row) => mapInvoiceRow(row))
    },
    () => memoryInvoices
  )
}

export async function getInvoice(id: string) {
  const invoices = await listInvoices()
  return invoices.find((invoice) => invoice.id === id) ?? null
}

export async function listPayments(invoiceId: string) {
  return withSupabaseFallback(
    "listPayments",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_payments")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("payment_date", { ascending: false })

      if (error) {
        throw error
      }

      return ensureArray(data).map((row) => mapPaymentRow(row))
    },
    () => memoryPayments.filter((payment) => payment.invoiceId === invoiceId)
  )
}

export async function listContactInvoices(contactId: string) {
  const invoices = await listInvoices()
  return invoices.filter((invoice) => invoice.contactId === contactId)
}

export async function listRegistrations() {
  return withSupabaseFallback(
    "listRegistrations",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_registrations")
        .select(`
          *,
          company:crm_companies(*)
        `)
        .order("registered_at", { ascending: false })

      if (error) {
        throw error
      }

      return ensureArray(data).map((row) => mapRegistrationRow(row))
    },
    () => memoryRegistrations
  )
}

export async function getRegistration(id: string) {
  const registrations = await listRegistrations()
  return registrations.find((registration) => registration.id === id) ?? null
}

export async function listRegistrationsByEvent(eventId: string) {
  const registrations = await listRegistrations()
  return registrations.filter((registration) => registration.eventId === eventId)
}

export async function listRegistrationsByCompany(companyId: string) {
  const registrations = await listRegistrations()
  return registrations.filter((registration) => registration.companyId === companyId)
}

export async function listRegistrationsByContact(contactId: string) {
  const registrations = await listRegistrations()
  return registrations.filter((registration) => registration.contactId === contactId)
}

export async function listCompanies() {
  return withSupabaseFallback(
    "listCompanies",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_companies")
        .select("*")
        .order("name", { ascending: true })

      if (error) {
        throw error
      }

      return ensureArray(data).map((row: Record<string, any>) => ensureCompanySnapshot(row))
    },
    () => memoryCompanies
  )
}

export async function getCompany(id: string) {
  const companies = await listCompanies()
  return companies.find((company) => company.id === id) ?? null
}

export async function createCompany(input: CreateCompanyInput) {
  const name = normalizeText(input.name)

  if (!name) {
    throw new Error("Company name is required")
  }

  const existingCompany = (await listCompanies()).find(
    (company) => company.name.toLowerCase() === name.toLowerCase()
  )

  if (existingCompany) {
    throw new Error("Company already exists")
  }

  return withSupabaseFallback(
    "createCompany",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_companies")
        .insert({
          name,
          address: normalizeText(input.address),
          city: normalizeText(input.city),
          country: normalizeText(input.country),
          postal_code: normalizeText(input.postalCode),
          vat_id: normalizeText(input.vatId),
          tax_id: normalizeText(input.taxId),
          industry: normalizeText(input.industry),
          website: normalizeText(input.website),
          phone: normalizeText(input.phone),
        })
        .select("*")
        .single()

      if (error) {
        throw error
      }

      return ensureCompanySnapshot(data)
    },
    () => {
      const company: Company = {
        id: makeId("company"),
        name,
        address: normalizeText(input.address),
        city: normalizeText(input.city),
        country: normalizeText(input.country),
        postalCode: normalizeText(input.postalCode),
        vatId: normalizeText(input.vatId) || undefined,
        taxId: normalizeText(input.taxId) || undefined,
        industry: normalizeText(input.industry) || undefined,
        website: normalizeText(input.website) || undefined,
        phone: normalizeText(input.phone) || undefined,
      }

      memoryCompanies.unshift(company)
      return company
    }
  )
}

export async function listTemplates() {
  return withSupabaseFallback(
    "listTemplates",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_templates")
        .select("*")
        .order("updated_at", { ascending: false })

      if (error) {
        throw error
      }

      return ensureArray(data).map((row) => mapTemplateRow(row))
    },
    () => memoryTemplates
  )
}

export async function getTemplate(id: string) {
  const templates = await listTemplates()
  return templates.find((template) => template.id === id) ?? null
}

export async function createTemplate(input: CreateTemplateInput) {
  return withSupabaseFallback(
    "createTemplate",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_templates")
        .insert({
          name: input.name,
          format: input.format,
          subject: input.subject,
          preview_text: input.previewText,
          text_content: input.textContent,
          html_content: input.htmlContent,
        })
        .select("*")
        .single()

      if (error) {
        throw error
      }

      return mapTemplateRow(data)
    },
    () => {
      const template: EmailTemplate = {
        id: makeId("template"),
        name: input.name,
        format: input.format,
        subject: input.subject,
        previewText: input.previewText,
        textContent: input.textContent,
        htmlContent: input.htmlContent,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      }
      memoryTemplates.unshift(template)
      return template
    }
  )
}

export async function updateTemplate(id: string, input: UpdateTemplateInput) {
  const existingTemplate = await getTemplate(id)

  if (!existingTemplate) {
    throw new Error("Template not found")
  }

  return withSupabaseFallback(
    "updateTemplate",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_templates")
        .update({
          name: input.name ?? existingTemplate.name,
          format: input.format ?? existingTemplate.format,
          subject: input.subject ?? existingTemplate.subject,
          preview_text: input.previewText ?? existingTemplate.previewText,
          text_content: input.textContent ?? existingTemplate.textContent,
          html_content: input.htmlContent ?? existingTemplate.htmlContent,
        })
        .eq("id", id)
        .select("*")
        .single()

      if (error) {
        throw error
      }

      return mapTemplateRow(data)
    },
    () => {
      const memoryTemplate = memoryTemplates.find((item) => item.id === id)
      if (!memoryTemplate) {
        throw new Error("Template not found")
      }

      memoryTemplate.name = input.name ?? memoryTemplate.name
      memoryTemplate.format = input.format ?? memoryTemplate.format
      memoryTemplate.subject = input.subject ?? memoryTemplate.subject
      memoryTemplate.previewText = input.previewText ?? memoryTemplate.previewText
      memoryTemplate.textContent = input.textContent ?? memoryTemplate.textContent
      memoryTemplate.htmlContent = input.htmlContent ?? memoryTemplate.htmlContent
      memoryTemplate.updatedAt = nowIso()

      return memoryTemplate
    }
  )
}

export async function listEmailDomains() {
  return withSupabaseFallback(
    "listEmailDomains",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_email_domains")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) {
        throw error
      }

      return ensureArray(data).map((row) => mapEmailDomainRow(row))
    },
    () => memoryEmailDomains
  )
}

export async function createEmailDomain(input: CreateEmailDomainInput) {
  return withSupabaseFallback(
    "createEmailDomain",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_email_domains")
        .insert({
          name: normalizeText(input.name),
          provider: input.provider,
          status: input.status,
          region: normalizeText(input.region),
          tracking: input.tracking,
          notes: normalizeText(input.notes),
        })
        .select("*")
        .single()

      if (error) {
        throw error
      }

      return mapEmailDomainRow(data)
    },
    () => {
      const createdAt = nowIso()
      const domain: EmailDomainProfile = {
        id: makeId("domain"),
        name: normalizeText(input.name),
        provider: input.provider,
        status: input.status,
        region: normalizeText(input.region),
        tracking: input.tracking,
        notes: normalizeText(input.notes) || undefined,
        createdAt,
        updatedAt: createdAt,
      }
      memoryEmailDomains.unshift(domain)
      return domain
    }
  )
}

export async function updateEmailDomain(id: string, input: UpdateEmailDomainInput) {
  const existingDomain = (await listEmailDomains()).find((domain) => domain.id === id)

  if (!existingDomain) {
    throw new Error("Domain not found")
  }

  return withSupabaseFallback(
    "updateEmailDomain",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_email_domains")
        .update({
          name: input.name ?? existingDomain.name,
          provider: input.provider ?? existingDomain.provider,
          status: input.status ?? existingDomain.status,
          region: input.region ?? existingDomain.region,
          tracking: input.tracking ?? existingDomain.tracking,
          notes: input.notes ?? existingDomain.notes,
        })
        .eq("id", id)
        .select("*")
        .single()

      if (error) {
        throw error
      }

      return mapEmailDomainRow(data)
    },
    () => {
      const memoryDomain = memoryEmailDomains.find((domain) => domain.id === id)
      if (!memoryDomain) {
        throw new Error("Domain not found")
      }

      memoryDomain.name = input.name ?? memoryDomain.name
      memoryDomain.provider = input.provider ?? memoryDomain.provider
      memoryDomain.status = input.status ?? memoryDomain.status
      memoryDomain.region = input.region ?? memoryDomain.region
      memoryDomain.tracking = input.tracking ?? memoryDomain.tracking
      memoryDomain.notes = input.notes ?? memoryDomain.notes
      memoryDomain.updatedAt = nowIso()

      return memoryDomain
    }
  )
}

export async function listSenderIdentities() {
  return withSupabaseFallback(
    "listSenderIdentities",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_sender_identities")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) {
        throw error
      }

      return ensureArray(data).map((row) => mapSenderIdentityRow(row))
    },
    () => memorySenderIdentities
  )
}

export async function createSenderIdentity(input: CreateSenderIdentityInput) {
  return withSupabaseFallback(
    "createSenderIdentity",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_sender_identities")
        .insert({
          provider: input.provider,
          from_name: normalizeText(input.fromName),
          email: normalizeText(input.email),
          reply_to: normalizeText(input.replyTo),
          domain_id: input.domainId,
          region: normalizeText(input.region),
          status: input.status,
          volume_band: normalizeText(input.volumeBand),
          purpose: normalizeText(input.purpose),
        })
        .select("*")
        .single()

      if (error) {
        throw error
      }

      return mapSenderIdentityRow(data)
    },
    () => {
      const createdAt = nowIso()
      const sender: SenderIdentity = {
        id: makeId("sender"),
        provider: input.provider,
        fromName: normalizeText(input.fromName),
        email: normalizeText(input.email),
        replyTo: normalizeText(input.replyTo),
        domainId: input.domainId,
        region: normalizeText(input.region),
        status: input.status,
        volumeBand: normalizeText(input.volumeBand),
        purpose: normalizeText(input.purpose),
        createdAt,
        updatedAt: createdAt,
      }
      memorySenderIdentities.unshift(sender)
      return sender
    }
  )
}

export async function updateSenderIdentity(id: string, input: UpdateSenderIdentityInput) {
  const existingSender = (await listSenderIdentities()).find((sender) => sender.id === id)

  if (!existingSender) {
    throw new Error("Sender identity not found")
  }

  return withSupabaseFallback(
    "updateSenderIdentity",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_sender_identities")
        .update({
          provider: input.provider ?? existingSender.provider,
          from_name: input.fromName ?? existingSender.fromName,
          email: input.email ?? existingSender.email,
          reply_to: input.replyTo ?? existingSender.replyTo,
          domain_id: input.domainId ?? existingSender.domainId,
          region: input.region ?? existingSender.region,
          status: input.status ?? existingSender.status,
          volume_band: input.volumeBand ?? existingSender.volumeBand,
          purpose: input.purpose ?? existingSender.purpose,
        })
        .eq("id", id)
        .select("*")
        .single()

      if (error) {
        throw error
      }

      return mapSenderIdentityRow(data)
    },
    () => {
      const memorySender = memorySenderIdentities.find((sender) => sender.id === id)
      if (!memorySender) {
        throw new Error("Sender identity not found")
      }

      memorySender.provider = input.provider ?? memorySender.provider
      memorySender.fromName = input.fromName ?? memorySender.fromName
      memorySender.email = input.email ?? memorySender.email
      memorySender.replyTo = input.replyTo ?? memorySender.replyTo
      memorySender.domainId = input.domainId ?? memorySender.domainId
      memorySender.region = input.region ?? memorySender.region
      memorySender.status = input.status ?? memorySender.status
      memorySender.volumeBand = input.volumeBand ?? memorySender.volumeBand
      memorySender.purpose = input.purpose ?? memorySender.purpose
      memorySender.updatedAt = nowIso()

      return memorySender
    }
  )
}

export async function listWebhookEndpoints() {
  return withSupabaseFallback(
    "listWebhookEndpoints",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_webhook_endpoints")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) {
        throw error
      }

      return ensureArray(data).map((row) => mapWebhookEndpointRow(row))
    },
    () => memoryWebhookEndpoints
  )
}

export async function createWebhookEndpoint(input: CreateWebhookEndpointInput) {
  return withSupabaseFallback(
    "createWebhookEndpoint",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_webhook_endpoints")
        .insert({
          provider: input.provider,
          label: normalizeText(input.label),
          url: normalizeText(input.url),
          status: input.status,
          events: input.events,
          notes: normalizeText(input.notes),
          last_event_at: input.lastEventAt ?? null,
        })
        .select("*")
        .single()

      if (error) {
        throw error
      }

      return mapWebhookEndpointRow(data)
    },
    () => {
      const createdAt = nowIso()
      const endpoint: WebhookEndpoint = {
        id: makeId("webhook"),
        provider: input.provider,
        label: normalizeText(input.label),
        url: normalizeText(input.url),
        status: input.status,
        events: input.events,
        notes: normalizeText(input.notes) || undefined,
        lastEventAt: input.lastEventAt,
        createdAt,
        updatedAt: createdAt,
      }
      memoryWebhookEndpoints.unshift(endpoint)
      return endpoint
    }
  )
}

export async function updateWebhookEndpoint(id: string, input: UpdateWebhookEndpointInput) {
  const existingEndpoint = (await listWebhookEndpoints()).find((endpoint) => endpoint.id === id)

  if (!existingEndpoint) {
    throw new Error("Webhook endpoint not found")
  }

  return withSupabaseFallback(
    "updateWebhookEndpoint",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_webhook_endpoints")
        .update({
          provider: input.provider ?? existingEndpoint.provider,
          label: input.label ?? existingEndpoint.label,
          url: input.url ?? existingEndpoint.url,
          status: input.status ?? existingEndpoint.status,
          events: input.events ?? existingEndpoint.events,
          notes: input.notes ?? existingEndpoint.notes,
          last_event_at: input.lastEventAt ?? existingEndpoint.lastEventAt ?? null,
        })
        .eq("id", id)
        .select("*")
        .single()

      if (error) {
        throw error
      }

      return mapWebhookEndpointRow(data)
    },
    () => {
      const memoryEndpoint = memoryWebhookEndpoints.find((endpoint) => endpoint.id === id)
      if (!memoryEndpoint) {
        throw new Error("Webhook endpoint not found")
      }

      memoryEndpoint.provider = input.provider ?? memoryEndpoint.provider
      memoryEndpoint.label = input.label ?? memoryEndpoint.label
      memoryEndpoint.url = input.url ?? memoryEndpoint.url
      memoryEndpoint.status = input.status ?? memoryEndpoint.status
      memoryEndpoint.events = input.events ?? memoryEndpoint.events
      memoryEndpoint.notes = input.notes ?? memoryEndpoint.notes
      memoryEndpoint.lastEventAt = input.lastEventAt ?? memoryEndpoint.lastEventAt
      memoryEndpoint.updatedAt = nowIso()

      return memoryEndpoint
    }
  )
}

export async function listSuppressions() {
  return withSupabaseFallback(
    "listSuppressions",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_suppressions")
        .select(`
          *,
          contact:crm_contacts(first_name, last_name),
          source_broadcast:crm_campaigns(name)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      return ensureArray(data).map((row) => mapSuppressionRow(row))
    },
    () => [...memorySuppressions].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )
  )
}

export async function createSuppression(input: CreateSuppressionInput) {
  const contacts = await listContacts()
  const contact =
    contacts.find((item) => item.id === input.contactId) ??
    contacts.find((item) => item.email.toLowerCase() === input.email.toLowerCase()) ??
    null
  const sourceBroadcast = input.sourceBroadcastId ? await getCampaign(input.sourceBroadcastId) : null
  const createdAt = nowIso()

  const suppression = await withSupabaseFallback(
    "createSuppression",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_suppressions")
        .insert({
          contact_id: contact?.id ?? null,
          email: input.email,
          reason: input.reason,
          source_provider: input.sourceProvider ?? null,
          source_broadcast_id: input.sourceBroadcastId ?? null,
          status: "active",
          notes: input.notes ?? null,
        })
        .select(`
          *,
          contact:crm_contacts(first_name, last_name),
          source_broadcast:crm_campaigns(name)
        `)
        .single()

      if (error) {
        throw error
      }

      return mapSuppressionRow(data)
    },
    () => {
      const createdSuppression: Suppression = {
        id: makeId("suppression"),
        contactId: contact?.id,
        contactName: contact ? `${contact.firstName} ${contact.lastName}`.trim() : undefined,
        email: input.email,
        reason: input.reason,
        sourceProvider: input.sourceProvider,
        sourceBroadcastId: input.sourceBroadcastId,
        sourceBroadcastName: sourceBroadcast?.name,
        status: "active",
        notes: input.notes,
        createdAt,
        updatedAt: createdAt,
      }
      memorySuppressions.unshift(createdSuppression)
      return createdSuppression
    }
  )

  if (contact?.id) {
    const nextStatus =
      input.reason === "complaint"
        ? "complained"
        : input.reason === "unsubscribe" || input.reason === "manual_block"
          ? "unsubscribed"
          : "bounced"

    await updateContactSubscriptionStatus(contact.id, nextStatus)
  }

  return suppression
}

export async function createContact(input: CreateContactInput) {
  const tagList = uniqueValues(input.tags ?? [])
  const company = await findOrCreateCompanyId(input.company ?? "")
  const createdAt = nowIso()

  const contact = await withSupabaseFallback(
    "createContact",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_contacts")
        .insert({
          email: input.email,
          first_name: input.firstName,
          last_name: input.lastName,
          company_id: company.companyId,
          company_name: company.companyName,
          job_title: input.jobTitle,
          phone: input.phone,
          linkedin: input.linkedin,
          country: input.country,
          city: input.city,
          industry: input.industry,
          company_size: input.companySize,
          lead_source: input.leadSource,
          tags: tagList,
          contact_type: input.contactType ?? "lead",
          owner_name: input.ownerName,
          notes: input.notes,
          email_status: "valid",
          subscription_status: "subscribed",
          last_activity_at: createdAt,
        })
        .select(`
          *,
          segment_links:crm_segment_contacts(
            segment:crm_segments(id, name)
          )
        `)
        .single()

      if (error) {
        throw error
      }

      return mapContactRow(data)
    },
    () => {
      const createdContact: Contact = {
        id: makeId("contact"),
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        company: company.companyName,
        companyId: company.companyId ?? undefined,
        jobTitle: input.jobTitle ?? "",
        phone: input.phone ?? "",
        linkedin: input.linkedin ?? "",
        country: input.country ?? "",
        city: input.city ?? "",
        industry: input.industry ?? "",
        companySize: input.companySize ?? "",
        leadSource: input.leadSource ?? "",
        tags: tagList,
        segments: [],
        contactType: input.contactType ?? "lead",
        ownerName: input.ownerName,
        notes: input.notes,
        createdAt,
        updatedAt: createdAt,
        lastActivityAt: createdAt,
        emailStatus: "valid",
        subscriptionStatus: "subscribed",
      }
      memoryContacts.unshift(createdContact)
      return createdContact
    }
  )

  if (input.segmentIds?.length) {
    await addContactToSegments(contact.id, input.segmentIds)
  }

  await addContactActivity(contact.id, {
    type: "contact_created",
    title: "Contact Created",
    description: `Added ${contact.firstName} ${contact.lastName} to the CRM`,
    metadata: {},
    createdBy: "CRM",
  })

  return contact
}

async function addContactToSegments(contactId: string, segmentIds: string[]) {
  const uniqueSegmentIds = uniqueValues(segmentIds)

  return withSupabaseFallback(
    "addContactToSegments",
    async () => {
      const supabase = createClient()
      const rows = uniqueSegmentIds.map((segmentId) => ({
        contact_id: contactId,
        segment_id: segmentId,
      }))

      const { error } = await supabase
        .from("crm_segment_contacts")
        .upsert(rows, { onConflict: "segment_id,contact_id", ignoreDuplicates: true })

      if (error) {
        throw error
      }
    },
    () => {
      const contact = memoryContacts.find((item) => item.id === contactId)
      if (!contact) {
        return
      }

      const segmentNames = memorySegments
        .filter((segment) => uniqueSegmentIds.includes(segment.id))
        .map((segment) => segment.name)

      contact.segments = uniqueValues([...contact.segments, ...segmentNames])
      recountMemorySegmentMemberships()
    }
  )
}

export async function importContacts(input: ImportContactsInput) {
  let segmentId: string | undefined

  if (input.segmentName) {
    const existingSegments = await listSegments()
    const existingSegment = existingSegments.find(
      (segment) => segment.name.toLowerCase() === input.segmentName!.toLowerCase()
    )

    if (existingSegment) {
      segmentId = existingSegment.id
    } else {
      const createdSegment = await createSegment({
        name: input.segmentName,
        description: `Imported batch ${input.segmentName}`,
        segmentKind: "manual",
      })
      segmentId = createdSegment.id
    }
  }

  const createdContacts: Contact[] = []

  for (const rawContact of input.contacts) {
    const tags = uniqueValues([...(rawContact.tags ?? []), input.batchTag])
    const contact = await createContact({
      ...rawContact,
      leadSource: rawContact.leadSource ?? input.leadSource,
      tags,
      segmentIds: segmentId ? [segmentId] : rawContact.segmentIds,
    })
    createdContacts.push(contact)
  }

  return createdContacts
}

export async function updateContactSubscriptionStatus(
  contactId: string,
  subscriptionStatus: Contact["subscriptionStatus"]
) {
  const updatedAt = nowIso()

  const contact = await withSupabaseFallback(
    "updateContactSubscriptionStatus",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_contacts")
        .update({
          subscription_status: subscriptionStatus,
          last_activity_at: updatedAt,
          updated_at: updatedAt,
        })
        .eq("id", contactId)
        .select(`
          *,
          segment_links:crm_segment_contacts(
            segment:crm_segments(id, name)
          )
        `)
        .single()

      if (error) {
        throw error
      }

      return mapContactRow(data)
    },
    () => {
      const contact = memoryContacts.find((item) => item.id === contactId)
      if (!contact) {
        throw new Error("Contact not found")
      }
      contact.subscriptionStatus = subscriptionStatus
      contact.updatedAt = updatedAt
      contact.lastActivityAt = updatedAt
      return contact
    }
  )

  await addContactActivity(contactId, {
    type: "contact_updated",
    title: "Subscription Updated",
    description: `Subscription status changed to ${subscriptionStatus}`,
    metadata: { subscriptionStatus },
    createdBy: "CRM",
  })

  return contact
}

export async function updateContact(contactId: string, input: UpdateContactInput) {
  const existingContact = await getContact(contactId)

  if (!existingContact) {
    throw new Error("Contact not found")
  }

  const updatedAt = nowIso()
  const company =
    input.company !== undefined
      ? await findOrCreateCompanyId(input.company)
      : {
          companyId: existingContact.companyId ?? null,
          companyName: existingContact.company,
        }
  const tagList = input.tags ? uniqueValues(input.tags) : existingContact.tags

  const contact = await withSupabaseFallback(
    "updateContact",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_contacts")
        .update({
          email: input.email ?? existingContact.email,
          first_name: input.firstName ?? existingContact.firstName,
          last_name: input.lastName ?? existingContact.lastName,
          company_id: company.companyId,
          company_name: company.companyName,
          job_title: input.jobTitle ?? existingContact.jobTitle,
          phone: input.phone ?? existingContact.phone,
          linkedin: input.linkedin ?? existingContact.linkedin,
          country: input.country ?? existingContact.country,
          city: input.city ?? existingContact.city,
          industry: input.industry ?? existingContact.industry,
          company_size: input.companySize ?? existingContact.companySize,
          lead_source: input.leadSource ?? existingContact.leadSource,
          tags: tagList,
          contact_type: input.contactType ?? existingContact.contactType ?? "lead",
          owner_name: input.ownerName ?? existingContact.ownerName,
          notes: input.notes ?? existingContact.notes,
          brochure_status: input.brochureStatus ?? existingContact.brochureStatus,
          last_activity_at: updatedAt,
          updated_at: updatedAt,
        })
        .eq("id", contactId)
        .select(`
          *,
          segment_links:crm_segment_contacts(
            segment:crm_segments(id, name)
          )
        `)
        .single()

      if (error) {
        throw error
      }

      return mapContactRow(data)
    },
    () => {
      const memoryContact = memoryContacts.find((item) => item.id === contactId)
      if (!memoryContact) {
        throw new Error("Contact not found")
      }

      memoryContact.firstName = input.firstName ?? memoryContact.firstName
      memoryContact.lastName = input.lastName ?? memoryContact.lastName
      memoryContact.email = input.email ?? memoryContact.email
      memoryContact.company = company.companyName
      memoryContact.companyId = company.companyId ?? undefined
      memoryContact.jobTitle = input.jobTitle ?? memoryContact.jobTitle
      memoryContact.phone = input.phone ?? memoryContact.phone
      memoryContact.linkedin = input.linkedin ?? memoryContact.linkedin
      memoryContact.country = input.country ?? memoryContact.country
      memoryContact.city = input.city ?? memoryContact.city
      memoryContact.industry = input.industry ?? memoryContact.industry
      memoryContact.companySize = input.companySize ?? memoryContact.companySize
      memoryContact.leadSource = input.leadSource ?? memoryContact.leadSource
      memoryContact.tags = tagList
      memoryContact.contactType = input.contactType ?? memoryContact.contactType
      memoryContact.ownerName = input.ownerName ?? memoryContact.ownerName
      memoryContact.notes = input.notes ?? memoryContact.notes
      memoryContact.brochureStatus = input.brochureStatus ?? memoryContact.brochureStatus
      memoryContact.updatedAt = updatedAt
      memoryContact.lastActivityAt = updatedAt
      return memoryContact
    }
  )

  await addContactActivity(contactId, {
    type: "contact_updated",
    title: "Contact Updated",
    description: `Updated profile for ${contact.firstName} ${contact.lastName}`,
    metadata: {},
    createdBy: "CRM",
  })

  return contact
}

export async function syncContactSegments(contactId: string, segmentIds: string[]) {
  const uniqueSegmentIds = uniqueValues(segmentIds)

  const contact = await withSupabaseFallback(
    "syncContactSegments",
    async () => {
      const supabase = createClient()

      const { error: deleteError } = await supabase
        .from("crm_segment_contacts")
        .delete()
        .eq("contact_id", contactId)

      if (deleteError) {
        throw deleteError
      }

      if (uniqueSegmentIds.length > 0) {
        const { error: insertError } = await supabase
          .from("crm_segment_contacts")
          .insert(
            uniqueSegmentIds.map((segmentId) => ({
              contact_id: contactId,
              segment_id: segmentId,
            }))
          )

        if (insertError) {
          throw insertError
        }
      }

      const refreshed = await getContact(contactId)
      if (!refreshed) {
        throw new Error("Contact not found after updating segments")
      }

      return refreshed
    },
    () => {
      const memoryContact = memoryContacts.find((item) => item.id === contactId)
      if (!memoryContact) {
        throw new Error("Contact not found")
      }

      memoryContact.segments = memorySegments
        .filter((segment) => uniqueSegmentIds.includes(segment.id))
        .map((segment) => segment.name)

      recountMemorySegmentMemberships()
      return memoryContact
    }
  )

  await addContactActivity(contactId, {
    type: "contact_updated",
    title: "Segment Membership Updated",
    description: `Updated segment assignments for ${contact.firstName} ${contact.lastName}`,
    metadata: { segmentIds: uniqueSegmentIds.join(",") },
    createdBy: "CRM",
  })

  return contact
}

export async function createSegment(input: CreateSegmentInput) {
  const createdAt = nowIso()

  const segment = await withSupabaseFallback(
    "createSegment",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_segments")
        .insert({
          name: input.name,
          description: input.description,
          group_logic: input.groupLogic ?? "AND",
          is_active: input.isActive ?? true,
          segment_kind: input.segmentKind ?? "manual",
          rule_groups: [],
          last_calculated_at: createdAt,
        })
        .select(`
          *,
          memberships:crm_segment_contacts(contact_id)
        `)
        .single()

      if (error) {
        throw error
      }

      return mapSegmentRow(data)
    },
    () => {
      const segment: Segment = {
        id: makeId("segment"),
        name: input.name,
        description: input.description,
        ruleGroups: [],
        groupLogic: input.groupLogic ?? "AND",
        contactCount: 0,
        isActive: input.isActive ?? true,
        segmentKind: input.segmentKind ?? "manual",
        createdAt,
        updatedAt: createdAt,
        lastCalculatedAt: createdAt,
      }
      memorySegments.unshift(segment)
      return segment
    }
  )

  if (input.contactIds?.length) {
    for (const contactId of input.contactIds) {
      await addContactToSegments(contactId, [segment.id])
    }
  }

  return segment
}

export async function createEvent(input: CreateEventInput) {
  return withSupabaseFallback(
    "createEvent",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_events")
        .insert({
          name: input.name,
          type: input.type,
          date: input.date,
          location: input.location,
          description: input.description,
          capacity: input.capacity,
          status: new Date(input.date) >= new Date() ? "upcoming" : "completed",
        })
        .select(`
          *,
          participants:crm_event_participants(status)
        `)
        .single()

      if (error) {
        throw error
      }

      return mapEventRow(data)
    },
    () => {
      const event: Event = {
        id: makeId("event"),
        name: input.name,
        type: input.type,
        date: input.date,
        location: input.location,
        description: input.description,
        capacity: input.capacity,
        registeredCount: 0,
        attendedCount: 0,
        status: new Date(input.date) >= new Date() ? "upcoming" : "completed",
        createdAt: nowIso(),
      }
      memoryEvents.unshift(event)
      return event
    }
  )
}

export async function addEventAttendee(input: AddEventAttendeeInput) {
  const registeredAt = nowIso()
  const event = await getEvent(input.eventId)
  const contact = await getContact(input.contactId)

  if (!event || !contact) {
    throw new Error("Event or contact not found")
  }

  await withSupabaseFallback(
    "addEventAttendee",
    async () => {
      const supabase = createClient()
      const { error } = await supabase.from("crm_event_participants").insert({
        event_id: input.eventId,
        contact_id: input.contactId,
        status: input.status,
        registered_at: registeredAt,
        confirmed_at: input.status === "confirmed" ? registeredAt : null,
        attended_at: input.status === "attended" ? registeredAt : null,
        notes: input.notes,
      })

      if (error) {
        throw error
      }
    },
    () => {
      const contactParticipations = getMemoryParticipations(input.contactId)
      contactParticipations.unshift({
        id: makeId("participation"),
        contactId: input.contactId,
        eventId: input.eventId,
        status: input.status,
        registeredAt,
        confirmedAt: input.status === "confirmed" ? registeredAt : undefined,
        attendedAt: input.status === "attended" ? registeredAt : undefined,
        notes: input.notes,
      })
      const memoryEvent = memoryEvents.find((item) => item.id === input.eventId)
      if (memoryEvent) {
        memoryEvent.registeredCount += 1
        if (input.status === "attended") {
          memoryEvent.attendedCount += 1
        }
      }
    }
  )

  await addContactActivity(input.contactId, {
    type: "event_registered",
    title: "Event Registration",
    description: `Added to ${event.name}`,
    metadata: { eventId: event.id, eventName: event.name },
    createdBy: "CRM",
  })

  return true
}

export async function createRegistration(input: CreateRegistrationInput) {
  const registeredAt = nowIso()
  const event = await getEvent(input.eventId)
  const contact = await getContact(input.contactId)

  if (!event || !contact) {
    throw new Error("Event or contact not found")
  }

  const company = await resolveCompanySnapshot(
    input.companyId ?? contact.companyId ?? null,
    input.companyName ?? contact.company
  )
  const quantity = Number(input.quantity)
  const ticketPrice = Number(input.ticketPrice)
  const totalAmount = roundAmount(quantity * ticketPrice)
  const eventParticipationStatus =
    input.status === "confirmed"
      ? "confirmed"
      : input.status === "cancelled"
        ? "cancelled"
        : "registered"

  const registration = await withSupabaseFallback(
    "createRegistration",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_registrations")
        .insert({
          event_id: event.id,
          event_name: event.name,
          contact_id: contact.id,
          contact_name: `${contact.firstName} ${contact.lastName}`.trim(),
          contact_email: contact.email,
          company_id: company.id,
          company_name: company.name,
          ticket_type: input.ticketType,
          ticket_price: ticketPrice,
          currency: input.currency,
          quantity,
          total_amount: totalAmount,
          status: input.status,
          registered_at: registeredAt,
          confirmed_at: input.status === "confirmed" ? registeredAt : null,
          cancelled_at: input.status === "cancelled" ? registeredAt : null,
          additional_attendees: input.additionalAttendees ?? [],
          admin_notes: input.adminNotes,
          special_requirements: input.specialRequirements,
        })
        .select(`
          *,
          company:crm_companies(*)
        `)
        .single()

      if (error) {
        throw error
      }

      const { error: attendeeError } = await supabase.from("crm_event_participants").upsert(
        {
          event_id: event.id,
          contact_id: contact.id,
          status: eventParticipationStatus,
          registered_at: registeredAt,
          confirmed_at: eventParticipationStatus === "confirmed" ? registeredAt : null,
          notes: `Linked registration ${data.id}`,
        },
        { onConflict: "event_id,contact_id" }
      )

      if (attendeeError) {
        throw attendeeError
      }

      return mapRegistrationRow(data)
    },
    () => {
      const createdRegistration: Registration = {
        id: makeId("registration"),
        eventId: event.id,
        eventName: event.name,
        contactId: contact.id,
        contactName: `${contact.firstName} ${contact.lastName}`.trim(),
        contactEmail: contact.email,
        companyId: company.id,
        company,
        ticketType: input.ticketType,
        ticketPrice,
        currency: input.currency,
        quantity,
        totalAmount,
        status: input.status,
        registeredAt,
        confirmedAt: input.status === "confirmed" ? registeredAt : undefined,
        cancelledAt: input.status === "cancelled" ? registeredAt : undefined,
        additionalAttendees: input.additionalAttendees,
        adminNotes: input.adminNotes,
        specialRequirements: input.specialRequirements,
        createdAt: registeredAt,
        updatedAt: registeredAt,
      }
      memoryRegistrations.unshift(createdRegistration)

      const contactParticipations = getMemoryParticipations(contact.id)
      const existingParticipation = contactParticipations.find(
        (item) => item.eventId === event.id
      )

      if (existingParticipation) {
        existingParticipation.status = eventParticipationStatus
        existingParticipation.confirmedAt =
          eventParticipationStatus === "confirmed" ? registeredAt : existingParticipation.confirmedAt
      } else {
        contactParticipations.unshift({
          id: makeId("participation"),
          contactId: contact.id,
          eventId: event.id,
          status: eventParticipationStatus,
          registeredAt,
          confirmedAt: eventParticipationStatus === "confirmed" ? registeredAt : undefined,
          notes: `Linked registration ${createdRegistration.id}`,
        })
      }

      const memoryEvent = memoryEvents.find((item) => item.id === event.id)
      if (memoryEvent) {
        memoryEvent.registeredCount += input.status === "cancelled" ? 0 : 1
      }

      return createdRegistration
    }
  )

  await addContactActivity(contact.id, {
    type: "event_registered",
    title: "Registration Created",
    description: `${registration.eventName} registration created`,
    metadata: { registrationId: registration.id, eventId: registration.eventId },
    createdBy: "CRM",
  })

  return registration
}

export async function updateRegistrationStatus(
  registrationId: string,
  status: Registration["status"]
) {
  const updatedAt = nowIso()
  const existingRegistration = await getRegistration(registrationId)

  if (!existingRegistration) {
    throw new Error("Registration not found")
  }

  const eventParticipantStatus =
    status === "confirmed" ? "confirmed" : status === "cancelled" ? "cancelled" : "registered"

  const registration = await withSupabaseFallback(
    "updateRegistrationStatus",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_registrations")
        .update({
          status,
          confirmed_at: status === "confirmed" ? updatedAt : null,
          cancelled_at: status === "cancelled" ? updatedAt : null,
          updated_at: updatedAt,
        })
        .eq("id", registrationId)
        .select(`
          *,
          company:crm_companies(*)
        `)
        .single()

      if (error) {
        throw error
      }

      const { error: participantError } = await supabase
        .from("crm_event_participants")
        .update({
          status: eventParticipantStatus,
          confirmed_at: status === "confirmed" ? updatedAt : null,
          attended_at: null,
        })
        .eq("event_id", existingRegistration.eventId)
        .eq("contact_id", existingRegistration.contactId)

      if (participantError) {
        throw participantError
      }

      return mapRegistrationRow(data)
    },
    () => {
      const memoryRegistration = memoryRegistrations.find((item) => item.id === registrationId)
      if (!memoryRegistration) {
        throw new Error("Registration not found")
      }

      const wasCancelled = memoryRegistration.status === "cancelled"

      memoryRegistration.status = status
      memoryRegistration.confirmedAt = status === "confirmed" ? updatedAt : undefined
      memoryRegistration.cancelledAt = status === "cancelled" ? updatedAt : undefined
      memoryRegistration.updatedAt = updatedAt

      const contactParticipations = getMemoryParticipations(memoryRegistration.contactId)
      const participation = contactParticipations.find(
        (item) => item.eventId === memoryRegistration.eventId
      )
      if (participation) {
        participation.status = eventParticipantStatus
        participation.confirmedAt = status === "confirmed" ? updatedAt : undefined
      }

      const memoryEvent = memoryEvents.find((item) => item.id === memoryRegistration.eventId)
      if (memoryEvent) {
        if (!wasCancelled && status === "cancelled") {
          memoryEvent.registeredCount = Math.max(memoryEvent.registeredCount - 1, 0)
        }
        if (wasCancelled && status !== "cancelled") {
          memoryEvent.registeredCount += 1
        }
      }

      return memoryRegistration
    }
  )

  await addContactActivity(registration.contactId, {
    type: "contact_updated",
    title: "Registration Updated",
    description: `Registration marked as ${status}`,
    metadata: { registrationId, status },
    createdBy: "CRM",
  })

  return registration
}

export async function createInvoice(input: CreateInvoiceInput) {
  const registration = await getRegistration(input.registrationId)

  if (!registration) {
    throw new Error("Registration not found")
  }

  if (registration.invoiceId) {
    throw new Error("An invoice already exists for this registration")
  }

  const taxRate = Number(input.taxRate ?? 0)
  const lineItems =
    input.lineItems && input.lineItems.length > 0
      ? input.lineItems
      : [
          {
            description: `${registration.eventName} · ${registration.ticketType} registration`,
            quantity: registration.quantity,
            unitPrice: registration.ticketPrice,
          },
        ]
  const calculated = calculateInvoiceAmounts(lineItems, taxRate)
  const invoiceNumber = input.invoiceNumber ?? buildInvoiceNumber(input.invoiceDate)

  const invoice = await withSupabaseFallback(
    "createInvoice",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_invoices")
        .insert({
          invoice_number: invoiceNumber,
          invoice_date: input.invoiceDate,
          due_date: input.dueDate,
          status: input.status ?? "draft",
          registration_id: registration.id,
          event_id: registration.eventId,
          event_name: registration.eventName,
          contact_id: registration.contactId,
          contact_name: registration.contactName,
          contact_email: registration.contactEmail,
          company_id: registration.companyId,
          company_name: registration.company.name,
          subtotal: calculated.subtotal,
          tax_rate: taxRate,
          tax_amount: calculated.taxAmount,
          total_amount: calculated.totalAmount,
          currency: input.currency ?? registration.currency,
          amount_paid: 0,
          balance_due: calculated.totalAmount,
          payment_status: "unpaid",
          admin_notes: input.adminNotes,
          public_notes: input.publicNotes,
        })
        .select(`
          *,
          company:crm_companies(*),
          line_items:crm_invoice_line_items(*)
        `)
        .single()

      if (error) {
        throw error
      }

      const { error: lineItemError } = await supabase.from("crm_invoice_line_items").insert(
        calculated.lineItems.map((item) => ({
          invoice_id: data.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
        }))
      )

      if (lineItemError) {
        throw lineItemError
      }

      const { error: registrationError } = await supabase
        .from("crm_registrations")
        .update({
          invoice_id: data.id,
          updated_at: nowIso(),
        })
        .eq("id", registration.id)

      if (registrationError) {
        throw registrationError
      }

      const refreshed = await getInvoice(String(data.id))
      if (!refreshed) {
        throw new Error("Invoice not found after creation")
      }

      return refreshed
    },
    () => {
      const createdAt = nowIso()
      const createdInvoice: Invoice = {
        id: makeId("invoice"),
        invoiceNumber,
        invoiceDate: input.invoiceDate,
        dueDate: input.dueDate,
        status: input.status ?? "draft",
        registrationId: registration.id,
        eventId: registration.eventId,
        eventName: registration.eventName,
        contactId: registration.contactId,
        contactName: registration.contactName,
        contactEmail: registration.contactEmail,
        companyId: registration.companyId,
        company: registration.company,
        lineItems: calculated.lineItems.map((item) => ({
          id: makeId("line-item"),
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        subtotal: calculated.subtotal,
        taxRate,
        taxAmount: calculated.taxAmount,
        totalAmount: calculated.totalAmount,
        currency: input.currency ?? registration.currency,
        amountPaid: 0,
        balanceDue: calculated.totalAmount,
        paymentStatus: "unpaid",
        adminNotes: input.adminNotes,
        publicNotes: input.publicNotes,
        createdAt,
        updatedAt: createdAt,
      }
      memoryInvoices.unshift(createdInvoice)

      const memoryRegistration = memoryRegistrations.find((item) => item.id === registration.id)
      if (memoryRegistration) {
        memoryRegistration.invoiceId = createdInvoice.id
        memoryRegistration.updatedAt = createdAt
      }

      return createdInvoice
    }
  )

  await addContactActivity(registration.contactId, {
    type: "note_added",
    title: "Invoice Created",
    description: `Created invoice ${invoice.invoiceNumber}`,
    metadata: { invoiceId: invoice.id, registrationId: registration.id },
    createdBy: "CRM",
  })

  return invoice
}

export async function updateInvoiceStatus(invoiceId: string, status: Invoice["status"]) {
  const updatedAt = nowIso()

  return withSupabaseFallback(
    "updateInvoiceStatus",
    async () => {
      const supabase = createClient()
      const nextPaymentStatus = status === "cancelled" ? "cancelled" : undefined
      const { error } = await supabase
        .from("crm_invoices")
        .update({
          status,
          payment_status: nextPaymentStatus,
          updated_at: updatedAt,
        })
        .eq("id", invoiceId)

      if (error) {
        throw error
      }

      const refreshed = await getInvoice(invoiceId)
      if (!refreshed) {
        throw new Error("Invoice not found after update")
      }

      return refreshed
    },
    () => {
      const memoryInvoice = memoryInvoices.find((item) => item.id === invoiceId)
      if (!memoryInvoice) {
        throw new Error("Invoice not found")
      }

      memoryInvoice.status = status
      if (status === "cancelled") {
        memoryInvoice.paymentStatus = "cancelled"
      }
      memoryInvoice.updatedAt = updatedAt
      return memoryInvoice
    }
  )
}

export async function recordPayment(input: RecordPaymentInput) {
  const invoice = await getInvoice(input.invoiceId)

  if (!invoice) {
    throw new Error("Invoice not found")
  }

  const paymentDateIso = new Date(input.paymentDate).toISOString()
  const amount = roundAmount(Number(input.amount))

  const payment = await withSupabaseFallback(
    "recordPayment",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_payments")
        .insert({
          invoice_id: invoice.id,
          amount,
          currency: input.currency,
          payment_date: paymentDateIso,
          payment_method: input.paymentMethod,
          payment_reference: input.paymentReference,
          status: input.status,
          notes: input.notes,
          created_by: "CRM",
        })
        .select("*")
        .single()

      if (error) {
        throw error
      }

      const completedPayments = (await listPayments(invoice.id)).filter(
        (item) => item.status === "completed" || item.status === "refunded"
      )
      const amountPaid = roundAmount(
        completedPayments.reduce((sum, item) => sum + item.amount, 0)
      )
      const balanceDue = roundAmount(Math.max(invoice.totalAmount - amountPaid, 0))
      const paymentStatus = deriveInvoicePaymentStatus(amountPaid, invoice.totalAmount)
      const nextInvoiceStatus = deriveInvoiceStatus(invoice.status, paymentStatus)

      const { error: invoiceError } = await supabase
        .from("crm_invoices")
        .update({
          amount_paid: amountPaid,
          balance_due: balanceDue,
          payment_status: paymentStatus,
          status: nextInvoiceStatus,
          updated_at: nowIso(),
        })
        .eq("id", invoice.id)

      if (invoiceError) {
        throw invoiceError
      }

      return mapPaymentRow(data)
    },
    () => {
      const createdAt = nowIso()
      const createdPayment: Payment = {
        id: makeId("payment"),
        invoiceId: invoice.id,
        amount,
        currency: input.currency,
        paymentDate: paymentDateIso,
        paymentMethod: input.paymentMethod,
        paymentReference: input.paymentReference,
        status: input.status,
        notes: input.notes,
        createdAt,
        createdBy: "CRM",
      }
      memoryPayments.unshift(createdPayment)

      const memoryInvoice = memoryInvoices.find((item) => item.id === invoice.id)
      if (memoryInvoice) {
        const completedPayments = memoryPayments.filter(
          (item) =>
            item.invoiceId === invoice.id &&
            (item.status === "completed" || item.status === "refunded")
        )
        const amountPaid = roundAmount(
          completedPayments.reduce((sum, item) => sum + item.amount, 0)
        )
        const balanceDue = roundAmount(Math.max(memoryInvoice.totalAmount - amountPaid, 0))
        const paymentStatus = deriveInvoicePaymentStatus(amountPaid, memoryInvoice.totalAmount)
        memoryInvoice.amountPaid = amountPaid
        memoryInvoice.balanceDue = balanceDue
        memoryInvoice.paymentStatus = paymentStatus
        memoryInvoice.status = deriveInvoiceStatus(memoryInvoice.status, paymentStatus)
        memoryInvoice.updatedAt = createdAt
      }

      return createdPayment
    }
  )

  await addContactActivity(invoice.contactId, {
    type: "note_added",
    title: "Payment Recorded",
    description: `Recorded ${amount.toFixed(2)} ${input.currency} on ${invoice.invoiceNumber}`,
    metadata: { invoiceId: invoice.id, paymentId: payment.id },
    createdBy: "CRM",
  })

  return payment
}

export async function createCampaign(input: CreateCampaignInput) {
  let templateId = input.templateId
  if (!templateId && input.saveAsTemplate && input.templateName) {
    const createdTemplate = await createTemplate({
      name: input.templateName,
      format: input.templateFormat ?? "plain_text",
      subject: input.subject,
      previewText: input.previewText,
      textContent: input.textContent,
      htmlContent: input.htmlContent,
    })
    templateId = createdTemplate.id
  }

  const contacts = await listContacts()
  const segments = await listSegments()
  const suppressions = await listSuppressions()
  const marketingCampaign = input.marketingCampaignId
    ? await getMarketingCampaign(input.marketingCampaignId)
    : null
  const selectedTemplate = templateId ? await getTemplate(templateId) : null
  const selectedSegmentNames = segments
    .filter((segment) => input.segmentIds.includes(segment.id))
    .map((segment) => segment.name)
  const suppressedEmails = new Set(
    suppressions
      .filter((suppression) => suppression.status === "active")
      .map((suppression) => suppression.email.toLowerCase())
  )

  const recipients = contacts.filter((contact) =>
    contact.subscriptionStatus === "subscribed" &&
    contact.emailStatus !== "invalid" &&
    contact.emailStatus !== "spam" &&
    !suppressedEmails.has(contact.email.toLowerCase()) &&
    contact.segments.some((segmentName) => selectedSegmentNames.includes(segmentName))
  )

  const createdAt = nowIso()

  const campaign = await withSupabaseFallback(
    "createCampaign",
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("crm_campaigns")
        .insert({
          name: input.name,
          marketing_campaign_id: input.marketingCampaignId ?? null,
          template_id: templateId,
          sender_identity_id: input.senderIdentityId,
          provider: input.provider,
          subject: input.subject,
          preview_text: input.previewText,
          from_name: input.fromName,
          from_email: input.fromEmail,
          reply_to: input.replyTo,
          status: input.status,
          notes: input.notes,
          scheduled_at: input.scheduledAt,
        })
        .select(`
          *,
          marketing_campaign:crm_marketing_campaigns(id, name),
          template:crm_templates(id, name, format, text_content, html_content),
          campaign_segments:crm_campaign_segments(
            segment:crm_segments(id, name)
          ),
          recipients:crm_campaign_recipients(
            id,
            delivery_status,
            sent_at,
            opened_at,
            clicked_at,
            replied_at,
            bounced_at,
            unsubscribed_at,
            complained_at
          )
        `)
        .single()

      if (error) {
        throw error
      }

      if (input.segmentIds.length > 0) {
        const { error: segmentError } = await supabase
          .from("crm_campaign_segments")
          .insert(input.segmentIds.map((segmentId) => ({ campaign_id: data.id, segment_id: segmentId })))

        if (segmentError) {
          throw segmentError
        }
      }

      if (recipients.length > 0) {
        const { error: recipientError } = await supabase.from("crm_campaign_recipients").insert(
          recipients.map((contact) => ({
            campaign_id: data.id,
            contact_id: contact.id,
            email: contact.email,
            delivery_status: input.status === "sent" ? "delivered" : "queued",
            sent_at: input.status === "sent" ? createdAt : null,
          }))
        )

        if (recipientError) {
          throw recipientError
        }
      }

      const refreshed = await getCampaign(String(data.id))
      if (!refreshed) {
        throw new Error("Campaign not found after creation")
      }
      return refreshed
    },
    () => {
      const campaign: Campaign = {
        id: makeId("campaign"),
        name: input.name,
        provider: input.provider,
        marketingCampaignId: marketingCampaign?.id,
        marketingCampaignName: marketingCampaign?.name,
        senderIdentityId: input.senderIdentityId,
        templateId,
        templateName: selectedTemplate?.name ?? input.templateName,
        templateFormat: input.templateFormat ?? "plain_text",
        subject: input.subject,
        previewText: input.previewText,
        fromName: input.fromName,
        fromEmail: input.fromEmail,
        replyTo: input.replyTo,
        status: input.status,
        notes: input.notes,
        segmentIds: input.segmentIds,
        segmentNames: selectedSegmentNames,
        totalRecipients: recipients.length,
        sentCount: input.status === "sent" ? recipients.length : 0,
        deliveredCount: input.status === "sent" ? recipients.length : 0,
        openedCount: 0,
        clickedCount: 0,
        repliedCount: 0,
        bouncedCount: 0,
        unsubscribedCount: 0,
        scheduledAt: input.scheduledAt,
        sentAt: input.status === "sent" ? createdAt : undefined,
        completedAt: input.status === "sent" ? createdAt : undefined,
        createdAt,
        updatedAt: createdAt,
        textContent: input.textContent,
        htmlContent: input.htmlContent,
      }
      memoryCampaigns.unshift(campaign)
      recountMemoryMarketingCampaigns()
      recipients.forEach((contact) => {
        getMemoryCampaignHistory(contact.id).unshift({
          campaignId: campaign.id,
          campaignName: campaign.name,
          sentAt: campaign.sentAt ?? createdAt,
          opened: false,
          clicked: false,
          replied: false,
        })
      })
      return campaign
    }
  )

  return campaign
}
