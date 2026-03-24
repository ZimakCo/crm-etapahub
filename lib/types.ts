// Contact Types
export interface Contact {
  id: string
  email: string
  firstName: string
  lastName: string
  company: string
  companyId?: string
  jobTitle: string
  phone: string
  linkedin: string
  country: string
  city: string
  industry: string
  companySize: string
  leadSource: string
  tags: string[]
  segments: string[]
  contactType?: 'lead' | 'client' | 'subscriber' | 'delegate' | 'employee' | 'sponsor'
  ownerName?: string
  brochureStatus?: 'not_requested' | 'requested' | 'sent'
  hasReplied?: boolean
  lastReplyAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
  lastActivityAt: string
  emailStatus: 'valid' | 'invalid' | 'unknown' | 'catch-all' | 'spam'
  subscriptionStatus: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained'
}

// Activity Types
export type ActivityType = 
  | 'email_sent'
  | 'email_opened'
  | 'email_clicked'
  | 'email_replied'
  | 'email_bounced'
  | 'campaign_added'
  | 'segment_added'
  | 'segment_removed'
  | 'event_registered'
  | 'event_attended'
  | 'event_no_show'
  | 'note_added'
  | 'tag_added'
  | 'tag_removed'
  | 'contact_created'
  | 'contact_updated'

export interface Activity {
  id: string
  contactId: string
  type: ActivityType
  title: string
  description: string
  metadata: Record<string, string | number | boolean>
  createdAt: string
  createdBy: string
}

// Event Types
export interface Event {
  id: string
  name: string
  type: 'conference' | 'webinar' | 'workshop' | 'meetup' | 'trade_show'
  date: string
  location: string
  description: string
  capacity: number
  registeredCount: number
  attendedCount: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  createdAt: string
}

export interface EventParticipation {
  id: string
  contactId: string
  eventId: string
  status: 'registered' | 'confirmed' | 'attended' | 'no_show' | 'cancelled'
  registeredAt: string
  confirmedAt?: string
  attendedAt?: string
  notes?: string
}

// Registration Types (Links Event -> Contact -> Company -> Invoice)
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'waitlist'
export type RegistrationTicketType = 'standard' | 'vip' | 'speaker' | 'sponsor' | 'exhibitor' | 'press' | 'staff'

export interface Company {
  id: string
  name: string
  address: string
  city: string
  country: string
  postalCode: string
  vatId?: string
  taxId?: string
  industry?: string
  website?: string
  phone?: string
}

export interface Registration {
  id: string
  // Event Link
  eventId: string
  eventName: string
  // Contact Link (the registrant)
  contactId: string
  contactName: string
  contactEmail: string
  // Company Link (for billing)
  companyId: string
  company: Company
  // Registration Details
  ticketType: RegistrationTicketType
  ticketPrice: number
  currency: Currency
  quantity: number // Number of attendees in this registration
  totalAmount: number
  // Status
  status: RegistrationStatus
  registeredAt: string
  confirmedAt?: string
  cancelledAt?: string
  // Invoice Link
  invoiceId?: string
  // Additional attendees for group registrations
  additionalAttendees?: {
    name: string
    email: string
    jobTitle?: string
  }[]
  // Notes
  adminNotes?: string
  specialRequirements?: string
  createdAt: string
  updatedAt: string
}

// Campaign Types
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
export type CampaignProvider = 'resend' | 'mailgun' | 'kumomta' | 'manual'

export interface Campaign {
  id: string
  name: string
  provider?: CampaignProvider
  senderIdentityId?: string
  templateId?: string
  templateName?: string
  templateFormat?: 'plain_text' | 'html'
  subject: string
  previewText: string
  fromName: string
  fromEmail: string
  replyTo: string
  status: CampaignStatus
  notes?: string
  segmentIds: string[]
  segmentNames: string[]
  totalRecipients: number
  sentCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  repliedCount: number
  bouncedCount: number
  unsubscribedCount: number
  scheduledAt?: string
  sentAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  htmlContent?: string
  textContent?: string
}

export interface CampaignStats {
  deliveryRate: number
  openRate: number
  clickRate: number
  replyRate: number
  bounceRate: number
  unsubscribeRate: number
}

// Segment Types
export type SegmentOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty'
  | 'greater_than'
  | 'less_than'
  | 'between'
  | 'in_list'
  | 'not_in_list'

export type SegmentFieldType = 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'boolean'

export interface SegmentRule {
  id: string
  field: string
  fieldType: SegmentFieldType
  operator: SegmentOperator
  value: string | number | string[] | boolean
}

export interface SegmentRuleGroup {
  id: string
  logic: 'AND' | 'OR'
  rules: SegmentRule[]
}

export interface Segment {
  id: string
  name: string
  description: string
  ruleGroups: SegmentRuleGroup[]
  groupLogic: 'AND' | 'OR'
  contactCount: number
  isActive: boolean
  segmentKind?: 'manual' | 'dynamic' | 'campaign' | 'event'
  createdAt: string
  updatedAt: string
  lastCalculatedAt: string
}

export interface EmailTemplate {
  id: string
  name: string
  format: 'plain_text' | 'html'
  subject: string
  previewText: string
  textContent?: string
  htmlContent?: string
  createdAt: string
  updatedAt: string
}

export interface EmailDomainProfile {
  id: string
  name: string
  provider: CampaignProvider
  status: 'verified' | 'warming' | 'attention'
  region: string
  tracking: 'enabled' | 'partial' | 'disabled'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SenderIdentity {
  id: string
  provider: CampaignProvider
  fromName: string
  email: string
  replyTo: string
  domainId: string
  region: string
  status: 'active' | 'warmup' | 'paused'
  volumeBand: string
  purpose: string
  createdAt: string
  updatedAt: string
}

export interface WebhookEndpoint {
  id: string
  provider: CampaignProvider
  label: string
  url: string
  status: 'healthy' | 'warming' | 'error'
  events: string[]
  notes?: string
  lastEventAt?: string
  createdAt: string
  updatedAt: string
}

// Invoice Types
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled' | 'refunded'

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded' | 'cancelled'

export type PaymentMethod = 'bank_transfer' | 'card' | 'cash' | 'other'

export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF'

export interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  status: InvoiceStatus
  // Registration Link (source of the invoice)
  registrationId: string
  // Event Link (via registration)
  eventId: string
  eventName: string
  // Contact Link (the person who registered)
  contactId: string
  contactName: string
  contactEmail: string
  // Company Link (who gets billed - from registration)
  companyId: string
  company: Company
  // Line items
  lineItems: InvoiceLineItem[]
  // Amounts
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  currency: Currency
  amountPaid: number
  balanceDue: number
  paymentStatus: PaymentStatus
  // Notes
  adminNotes?: string
  publicNotes?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  currency: Currency
  paymentDate: string
  paymentMethod: PaymentMethod
  paymentReference?: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  notes?: string
  createdAt: string
  createdBy: string
}

// Dashboard Types
export interface DashboardStats {
  totalContacts: number
  contactsGrowth: number
  totalCampaigns: number
  campaignsThisMonth: number
  avgOpenRate: number
  openRateChange: number
  avgClickRate: number
  clickRateChange: number
  upcomingEvents: number
  activeSegments: number
}

// Filter Types
export interface ContactFilter {
  field: string
  operator: SegmentOperator
  value: string | number | string[] | boolean
}

export interface ContactSort {
  field: string
  direction: 'asc' | 'desc'
}

// Table Column Types
export interface TableColumn {
  id: string
  label: string
  field: keyof Contact | string
  width: number
  sortable: boolean
  filterable: boolean
  visible: boolean
}

export interface ContactCampaignHistory {
  campaignId: string
  campaignName: string
  sentAt: string
  opened: boolean
  openedAt?: string
  clicked: boolean
  clickedAt?: string
  replied: boolean
  repliedAt?: string
}

export interface RecentActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: string
  contact?: {
    name: string
    email: string
  }
}
