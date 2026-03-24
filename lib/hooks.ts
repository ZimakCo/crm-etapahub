import useSWR from "swr"
import {
  getCampaign,
  getCompany,
  getContact,
  getDashboardStats,
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
  listContactsByCompany,
  listContactsByEvent,
  listEvents,
  listInvoices,
  listPayments,
  listRecentActivities,
  listRegistrations,
  listRegistrationsByCompany,
  listRegistrationsByContact,
  listRegistrationsByEvent,
  listSegments,
  listTemplates,
} from "@/lib/crm-repository"
import type {
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
