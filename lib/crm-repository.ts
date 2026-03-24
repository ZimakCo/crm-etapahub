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
  EmailTemplate,
  Event,
  EventParticipation,
  Invoice,
  Payment,
  RecentActivityItem,
  Registration,
  Segment,
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

const memoryContacts = [...mockContacts]
const memoryCampaigns = [...mockCampaigns]
const memorySegments = [...mockSegments]
const memoryEvents = [...mockEvents]
const memoryCompanies = [...mockCompanies]
const memoryRegistrations = [...mockRegistrations]
const memoryInvoices = [...mockInvoices]
const memoryTemplates = [...mockTemplates]
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
      memorySegments.forEach((segment) => {
        if (uniqueSegmentIds.includes(segment.id)) {
          segment.contactCount += 1
          segment.lastCalculatedAt = nowIso()
        }
      })
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
  const selectedSegmentNames = segments
    .filter((segment) => input.segmentIds.includes(segment.id))
    .map((segment) => segment.name)

  const recipients = contacts.filter((contact) =>
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
          template_id: templateId,
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
        templateId,
        templateName: input.templateName,
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
