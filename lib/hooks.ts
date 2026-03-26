import useSWR from "swr"
import { listOutreachMailboxes, listOutreachTemplates } from "@/lib/outreach-repository"
import {
  getTemplate,
  getCampaign,
  getMarketingCampaign,
  getCompany,
  getContact,
  getDashboardStats,
  listContactTags,
  listEmailDomains,
  getEvent,
  getInvoice,
  getRegistration,
  getSegment,
  listCampaigns,
  listCompanies,
  listContactActivities,
  listContactCampaignHistory,
  listContactEventParticipations,
  listContactInvoices,
  listContacts,
  listContactsPage,
  listContactsByCompany,
  listContactsByEvent,
  listEventParticipants,
  listEvents,
  listInvoices,
  listPayments,
  listRecentActivities,
  listRegistrations,
  listRegistrationsByCompany,
  listRegistrationsByContact,
  listRegistrationsByEvent,
  listMarketingCampaigns,
  listSenderIdentities,
  listSegments,
  listSuppressions,
  listTemplates,
  listWebhookEndpoints,
} from "@/lib/crm-repository"
import type {
  ContactListQuery,
  ContactFilter,
  ContactSort,
} from "@/lib/types"

export function useContacts(filters?: ContactFilter[], sort?: ContactSort) {
  const { data, error, isLoading, mutate } = useSWR(
    ["contacts", filters, sort],
    () => listContacts(filters, sort)
  )

  return {
    contacts: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useContactsPage(query: ContactListQuery) {
  const { data, error, isLoading, mutate } = useSWR(
    ["contacts-page", query],
    () => listContactsPage(query)
  )

  return {
    result: data ?? {
      contacts: [],
      total: 0,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 50,
      totalPages: 1,
    },
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useContact(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["contact", id] : null,
    () => getContact(id!)
  )

  return {
    contact: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useCampaigns() {
  const { data, error, isLoading, mutate } = useSWR("campaigns", listCampaigns)

  return {
    campaigns: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useBroadcasts() {
  return useCampaigns()
}

export function useCampaign(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["campaign", id] : null,
    () => getCampaign(id!)
  )

  return {
    campaign: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useBroadcast(id: string | null) {
  return useCampaign(id)
}

export function useMarketingCampaigns() {
  const { data, error, isLoading, mutate } = useSWR(
    "marketing-campaigns",
    listMarketingCampaigns
  )

  return {
    campaigns: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useMarketingCampaign(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["marketing-campaign", id] : null,
    () => getMarketingCampaign(id!)
  )

  return {
    campaign: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useSegments() {
  const { data, error, isLoading, mutate } = useSWR("segments", listSegments)

  return {
    segments: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useSegment(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["segment", id] : null,
    () => getSegment(id!)
  )

  return {
    segment: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useEvents() {
  const { data, error, isLoading, mutate } = useSWR("events", listEvents)

  return {
    events: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useEventById(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["event", id] : null,
    () => getEvent(id!)
  )

  return {
    event: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useContactsByEvent(eventId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    eventId ? ["event-contacts", eventId] : null,
    () => listContactsByEvent(eventId!)
  )

  return {
    contacts: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useEventParticipants(eventId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    eventId ? ["event-participants", eventId] : null,
    () => listEventParticipants(eventId!)
  )

  return {
    participants: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useContactsByCompany(companyId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    companyId ? ["company-contacts", companyId] : null,
    () => listContactsByCompany(companyId!)
  )

  return {
    contacts: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR("dashboard-stats", getDashboardStats)

  return {
    stats: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useContactActivities(contactId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    contactId ? ["contact-activities", contactId] : null,
    () => listContactActivities(contactId!)
  )

  return {
    activities: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useContactEventParticipations(contactId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    contactId ? ["contact-events", contactId] : null,
    () => listContactEventParticipations(contactId!)
  )

  return {
    participations: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useContactCampaignHistory(contactId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    contactId ? ["contact-campaigns", contactId] : null,
    () => listContactCampaignHistory(contactId!)
  )

  return {
    campaignHistory: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useRecentActivities() {
  const { data, error, isLoading, mutate } = useSWR("recent-activities", listRecentActivities)

  return {
    activities: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useInvoices() {
  const { data, error, isLoading, mutate } = useSWR("invoices", listInvoices)

  return {
    invoices: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useInvoice(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["invoice", id] : null,
    () => getInvoice(id!)
  )

  return {
    invoice: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function usePayments(invoiceId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    invoiceId ? ["payments", invoiceId] : null,
    () => listPayments(invoiceId!)
  )

  return {
    payments: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useContactInvoices(contactId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    contactId ? ["contact-invoices", contactId] : null,
    () => listContactInvoices(contactId!)
  )

  return {
    invoices: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useRegistrations() {
  const { data, error, isLoading, mutate } = useSWR("registrations", listRegistrations)

  return {
    registrations: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useRegistration(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["registration", id] : null,
    () => getRegistration(id!)
  )

  return {
    registration: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useRegistrationsByEvent(eventId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    eventId ? ["event-registrations", eventId] : null,
    () => listRegistrationsByEvent(eventId!)
  )

  return {
    registrations: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useRegistrationsByCompany(companyId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    companyId ? ["company-registrations", companyId] : null,
    () => listRegistrationsByCompany(companyId!)
  )

  return {
    registrations: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useRegistrationsByContact(contactId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    contactId ? ["contact-registrations", contactId] : null,
    () => listRegistrationsByContact(contactId!)
  )

  return {
    registrations: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useCompanies() {
  const { data, error, isLoading, mutate } = useSWR("companies", listCompanies)

  return {
    companies: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useCompany(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["company", id] : null,
    () => getCompany(id!)
  )

  return {
    company: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useTemplates() {
  const { data, error, isLoading, mutate } = useSWR("templates", listTemplates)

  return {
    templates: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useContactTags() {
  const { data, error, isLoading, mutate } = useSWR("contact-tags", listContactTags)

  return {
    tags: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useTemplate(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["template", id] : null,
    () => getTemplate(id!)
  )

  return {
    template: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useEmailDomains() {
  const { data, error, isLoading, mutate } = useSWR("email-domains", listEmailDomains)

  return {
    domains: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useSenderIdentities() {
  const { data, error, isLoading, mutate } = useSWR("sender-identities", listSenderIdentities)

  return {
    senderIdentities: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useOutreachMailboxes() {
  const { data, error, isLoading, mutate } = useSWR("outreach-mailboxes", listOutreachMailboxes)

  return {
    mailboxes: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useOutreachTemplates() {
  const { data, error, isLoading, mutate } = useSWR("outreach-templates", listOutreachTemplates)

  return {
    templates: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useWebhookEndpoints() {
  const { data, error, isLoading, mutate } = useSWR("webhook-endpoints", listWebhookEndpoints)

  return {
    webhookEndpoints: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useSuppressions() {
  const { data, error, isLoading, mutate } = useSWR("suppressions", listSuppressions)

  return {
    suppressions: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
