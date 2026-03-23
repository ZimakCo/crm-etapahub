import type { 
  Contact, 
  Activity, 
  Event, 
  EventParticipation, 
  Campaign, 
  Segment,
  DashboardStats,
  SegmentRule,
  SegmentRuleGroup,
  Invoice,
  InvoiceLineItem,
  Payment,
  InvoiceStatus,
  PaymentStatus,
  PaymentMethod,
  Currency,
  Company,
  Registration,
  RegistrationStatus,
  RegistrationTicketType,
  EmailTemplate,
  ContactCampaignHistory,
} from './types'

// Helper to generate random ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// Helper to generate random date within range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
}

// Sample data arrays
const firstNames = ['James', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Daniel', 'Ashley', 'Matthew', 'Jennifer', 'Christopher', 'Amanda', 'Andrew', 'Stephanie', 'Joshua', 'Nicole', 'Ryan', 'Elizabeth', 'Brandon', 'Melissa', 'William', 'Rachel', 'Anthony', 'Lauren', 'Kevin', 'Samantha', 'Thomas', 'Katherine', 'John', 'Rebecca', 'Carlos', 'Maria', 'Hiroshi', 'Yuki', 'Pierre', 'Sophie', 'Hans', 'Anna', 'Marco', 'Giulia']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Mueller', 'Schmidt', 'Tanaka', 'Yamamoto', 'Dubois', 'Bernard', 'Rossi', 'Ferrari']
const companies = ['TechCorp', 'InnovateTech', 'CloudScale', 'DataDriven', 'NextGen Solutions', 'Digital Dynamics', 'SmartSystems', 'FutureTech', 'CyberCore', 'NetWorks Plus', 'Quantum Labs', 'Apex Industries', 'Global Ventures', 'Pioneer Tech', 'Summit Software', 'Horizon Digital', 'Vertex Systems', 'Catalyst Corp', 'Synergy Solutions', 'Prime Technologies', 'Elevate Inc', 'Momentum Labs', 'Fusion Dynamics', 'Clarity Software', 'Amplify Tech']
const jobTitles = ['CEO', 'CTO', 'VP of Engineering', 'VP of Sales', 'Director of Marketing', 'Product Manager', 'Engineering Manager', 'Senior Developer', 'Data Scientist', 'Sales Manager', 'Marketing Manager', 'Head of Growth', 'Chief Revenue Officer', 'VP of Product', 'Director of Operations', 'Head of Partnerships', 'Business Development Manager', 'Customer Success Manager', 'Solutions Architect', 'Technical Lead']
const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Real Estate', 'Energy', 'Consulting', 'Media', 'Telecommunications', 'Transportation', 'Hospitality', 'Legal', 'Insurance']
const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+']
const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia', 'Japan', 'Singapore', 'Netherlands', 'Sweden', 'Spain', 'Italy', 'Brazil', 'India', 'South Korea']
const cities = ['San Francisco', 'New York', 'London', 'Berlin', 'Paris', 'Toronto', 'Sydney', 'Tokyo', 'Singapore', 'Amsterdam', 'Stockholm', 'Madrid', 'Milan', 'Sao Paulo', 'Mumbai', 'Seoul', 'Austin', 'Seattle', 'Boston', 'Chicago']
const leadSources = ['Website', 'LinkedIn', 'Conference', 'Referral', 'Cold Outreach', 'Webinar', 'Content Download', 'Partner', 'Advertisement', 'Trade Show']
const tags = ['VIP', 'Decision Maker', 'Technical', 'Enterprise', 'SMB', 'Startup', 'Hot Lead', 'Nurture', 'Champion', 'Influencer', 'Early Adopter', 'Strategic Account']

// Generate Contacts
export function generateContacts(count: number): Contact[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const company = companies[Math.floor(Math.random() * companies.length)]
    const createdAt = randomDate(new Date('2023-01-01'), new Date())
    const updatedAt = randomDate(new Date(createdAt), new Date())
    const lastActivityAt = randomDate(new Date(updatedAt), new Date())
    
    const contactTags = tags.filter(() => Math.random() > 0.8)
    const segmentNames = ['All Contacts']
    if (Math.random() > 0.5) segmentNames.push('Tech Leaders')
    if (Math.random() > 0.7) segmentNames.push('Conference 2024 Attendees')
    if (Math.random() > 0.8) segmentNames.push('Enterprise Accounts')

    return {
      id: `contact-${i + 1}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      firstName,
      lastName,
      company,
      jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      country: countries[Math.floor(Math.random() * countries.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      industry: industries[Math.floor(Math.random() * industries.length)],
      companySize: companySizes[Math.floor(Math.random() * companySizes.length)],
      leadSource: leadSources[Math.floor(Math.random() * leadSources.length)],
      tags: contactTags,
      segments: segmentNames,
      contactType: ['lead', 'subscriber', 'delegate', 'client'][Math.floor(Math.random() * 4)] as Contact['contactType'],
      ownerName: ['Sales Team', 'Operations', 'Events Desk'][Math.floor(Math.random() * 3)],
      brochureStatus: ['not_requested', 'requested', 'sent'][Math.floor(Math.random() * 3)] as Contact['brochureStatus'],
      hasReplied: Math.random() > 0.7,
      lastReplyAt: Math.random() > 0.7 ? randomDate(new Date(updatedAt), new Date()) : undefined,
      notes: Math.random() > 0.8 ? 'Manual note captured by sales team.' : undefined,
      createdAt,
      updatedAt,
      lastActivityAt,
      emailStatus: ['valid', 'valid', 'valid', 'unknown', 'catch-all', 'spam'][Math.floor(Math.random() * 6)] as Contact['emailStatus'],
      subscriptionStatus: ['subscribed', 'subscribed', 'subscribed', 'unsubscribed', 'bounced', 'complained'][Math.floor(Math.random() * 6)] as Contact['subscriptionStatus'],
    }
  })
}

// Generate Activities for a contact
export function generateActivities(contactId: string, count: number): Activity[] {
  const activityTypes: Array<{ type: Activity['type']; title: string; description: string }> = [
    { type: 'email_sent', title: 'Email Sent', description: 'Campaign email was sent' },
    { type: 'email_opened', title: 'Email Opened', description: 'Opened "Tech Summit 2024 Invitation"' },
    { type: 'email_clicked', title: 'Link Clicked', description: 'Clicked "Register Now" button' },
    { type: 'email_replied', title: 'Email Reply Received', description: 'Replied to outreach email' },
    { type: 'campaign_added', title: 'Added to Campaign', description: 'Added to "Q1 Product Launch" campaign' },
    { type: 'segment_added', title: 'Added to Segment', description: 'Added to "Enterprise Accounts" segment' },
    { type: 'event_registered', title: 'Event Registration', description: 'Registered for Tech Summit 2024' },
    { type: 'event_attended', title: 'Event Attended', description: 'Attended Tech Summit 2024' },
    { type: 'note_added', title: 'Note Added', description: 'Had a great call, interested in enterprise features' },
    { type: 'tag_added', title: 'Tag Added', description: 'Tagged as "VIP"' },
    { type: 'contact_created', title: 'Contact Created', description: 'Contact was added to the system' },
  ]

  return Array.from({ length: count }, (_, i) => {
    const activity = activityTypes[Math.floor(Math.random() * activityTypes.length)]
    return {
      id: `activity-${contactId}-${i + 1}`,
      contactId,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      metadata: {},
      createdAt: randomDate(new Date('2023-06-01'), new Date()),
      createdBy: 'System',
    }
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Generate Events
export function generateEvents(): Event[] {
  return [
    {
      id: 'event-1',
      name: 'Tech Summit 2024',
      type: 'conference',
      date: '2024-09-15',
      location: 'San Francisco, CA',
      description: 'Annual technology conference for industry leaders',
      capacity: 500,
      registeredCount: 423,
      attendedCount: 387,
      status: 'completed',
      createdAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'event-2',
      name: 'Product Launch Webinar',
      type: 'webinar',
      date: '2024-11-20',
      location: 'Virtual',
      description: 'New product features showcase',
      capacity: 1000,
      registeredCount: 756,
      attendedCount: 0,
      status: 'upcoming',
      createdAt: '2024-10-01T00:00:00Z',
    },
    {
      id: 'event-3',
      name: 'Developer Workshop',
      type: 'workshop',
      date: '2024-12-05',
      location: 'New York, NY',
      description: 'Hands-on technical workshop',
      capacity: 50,
      registeredCount: 48,
      attendedCount: 0,
      status: 'upcoming',
      createdAt: '2024-10-15T00:00:00Z',
    },
    {
      id: 'event-4',
      name: 'Enterprise Summit 2024',
      type: 'conference',
      date: '2024-08-10',
      location: 'London, UK',
      description: 'Enterprise technology solutions conference',
      capacity: 300,
      registeredCount: 289,
      attendedCount: 267,
      status: 'completed',
      createdAt: '2024-02-01T00:00:00Z',
    },
    {
      id: 'event-5',
      name: 'Q1 2025 Kickoff',
      type: 'webinar',
      date: '2025-01-15',
      location: 'Virtual',
      description: 'Year kickoff and roadmap presentation',
      capacity: 2000,
      registeredCount: 234,
      attendedCount: 0,
      status: 'upcoming',
      createdAt: '2024-11-01T00:00:00Z',
    },
  ]
}

// Generate Event Participations for a contact
export function generateEventParticipations(contactId: string): EventParticipation[] {
  const events = generateEvents()
  const participations: EventParticipation[] = []
  
  events.forEach((event, i) => {
    if (Math.random() > 0.5) {
      const status = event.status === 'completed' 
        ? (Math.random() > 0.2 ? 'attended' : 'no_show')
        : 'registered'
      
      participations.push({
        id: `participation-${contactId}-${event.id}`,
        contactId,
        eventId: event.id,
        status,
        registeredAt: randomDate(new Date(event.createdAt), new Date(event.date)),
        confirmedAt: status !== 'registered' ? randomDate(new Date(event.createdAt), new Date(event.date)) : undefined,
        attendedAt: status === 'attended' ? event.date : undefined,
      })
    }
  })
  
  return participations
}

// Generate Campaigns
export function generateCampaigns(): Campaign[] {
  return [
    {
      id: 'campaign-1',
      name: 'Tech Summit 2024 Invitation',
      subject: 'You\'re Invited: Tech Summit 2024',
      previewText: 'Join industry leaders for our annual technology conference',
      fromName: 'EtapaHub Events',
      fromEmail: 'events@etapahub.com',
      replyTo: 'events@etapahub.com',
      status: 'sent',
      segmentIds: ['segment-1', 'segment-2'],
      segmentNames: ['Tech Leaders', 'Enterprise Accounts'],
      totalRecipients: 15420,
      sentCount: 15420,
      deliveredCount: 14856,
      openedCount: 8234,
      clickedCount: 2145,
      repliedCount: 156,
      bouncedCount: 564,
      unsubscribedCount: 23,
      scheduledAt: '2024-07-01T09:00:00Z',
      sentAt: '2024-07-01T09:00:00Z',
      completedAt: '2024-07-01T09:45:00Z',
      createdAt: '2024-06-15T00:00:00Z',
      updatedAt: '2024-07-01T09:45:00Z',
    },
    {
      id: 'campaign-2',
      name: 'Product Update - November 2024',
      subject: 'New Features You\'ll Love',
      previewText: 'Check out what we\'ve been building',
      fromName: 'EtapaHub Team',
      fromEmail: 'hello@etapahub.com',
      replyTo: 'hello@etapahub.com',
      status: 'sent',
      segmentIds: ['segment-1'],
      segmentNames: ['All Contacts'],
      totalRecipients: 45230,
      sentCount: 45230,
      deliveredCount: 43567,
      openedCount: 18234,
      clickedCount: 4521,
      repliedCount: 89,
      bouncedCount: 1663,
      unsubscribedCount: 67,
      scheduledAt: '2024-11-01T14:00:00Z',
      sentAt: '2024-11-01T14:00:00Z',
      completedAt: '2024-11-01T15:30:00Z',
      createdAt: '2024-10-25T00:00:00Z',
      updatedAt: '2024-11-01T15:30:00Z',
    },
    {
      id: 'campaign-3',
      name: 'Holiday Season Greetings',
      subject: 'Happy Holidays from EtapaHub',
      previewText: 'Wishing you a wonderful holiday season',
      fromName: 'EtapaHub Team',
      fromEmail: 'hello@etapahub.com',
      replyTo: 'hello@etapahub.com',
      status: 'scheduled',
      segmentIds: ['segment-1'],
      segmentNames: ['All Contacts'],
      totalRecipients: 48500,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      repliedCount: 0,
      bouncedCount: 0,
      unsubscribedCount: 0,
      scheduledAt: '2024-12-20T10:00:00Z',
      createdAt: '2024-11-15T00:00:00Z',
      updatedAt: '2024-11-15T00:00:00Z',
    },
    {
      id: 'campaign-4',
      name: 'Q1 2025 Webinar Series',
      subject: 'Reserve Your Spot: Exclusive Webinar Series',
      previewText: 'Learn from industry experts in our upcoming webinar series',
      fromName: 'EtapaHub Events',
      fromEmail: 'events@etapahub.com',
      replyTo: 'events@etapahub.com',
      status: 'draft',
      segmentIds: ['segment-2', 'segment-3'],
      segmentNames: ['Tech Leaders', 'Webinar Attendees'],
      totalRecipients: 12300,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      repliedCount: 0,
      bouncedCount: 0,
      unsubscribedCount: 0,
      createdAt: '2024-11-20T00:00:00Z',
      updatedAt: '2024-11-20T00:00:00Z',
    },
    {
      id: 'campaign-5',
      name: 'Enterprise Solutions Overview',
      subject: 'Scale Your Business with EtapaHub Enterprise',
      previewText: 'Discover enterprise-grade features for your organization',
      fromName: 'EtapaHub Sales',
      fromEmail: 'sales@etapahub.com',
      replyTo: 'sales@etapahub.com',
      status: 'sent',
      segmentIds: ['segment-4'],
      segmentNames: ['Enterprise Accounts'],
      totalRecipients: 2340,
      sentCount: 2340,
      deliveredCount: 2298,
      openedCount: 1456,
      clickedCount: 567,
      repliedCount: 78,
      bouncedCount: 42,
      unsubscribedCount: 5,
      scheduledAt: '2024-10-15T11:00:00Z',
      sentAt: '2024-10-15T11:00:00Z',
      completedAt: '2024-10-15T11:20:00Z',
      createdAt: '2024-10-01T00:00:00Z',
      updatedAt: '2024-10-15T11:20:00Z',
    },
  ]
}

// Generate Segments
export function generateSegments(): Segment[] {
  return [
    {
      id: 'segment-1',
      name: 'All Contacts',
      description: 'All contacts in the system',
      ruleGroups: [],
      groupLogic: 'AND',
      contactCount: 48500,
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-11-20T00:00:00Z',
      lastCalculatedAt: '2024-11-20T00:00:00Z',
    },
    {
      id: 'segment-2',
      name: 'Tech Leaders',
      description: 'CTOs, VPs of Engineering, and technical decision makers',
      ruleGroups: [
        {
          id: 'group-1',
          logic: 'OR',
          rules: [
            { id: 'rule-1', field: 'jobTitle', fieldType: 'text', operator: 'contains', value: 'CTO' },
            { id: 'rule-2', field: 'jobTitle', fieldType: 'text', operator: 'contains', value: 'VP of Engineering' },
            { id: 'rule-3', field: 'jobTitle', fieldType: 'text', operator: 'contains', value: 'Technical' },
          ],
        },
        {
          id: 'group-2',
          logic: 'AND',
          rules: [
            { id: 'rule-4', field: 'industry', fieldType: 'select', operator: 'equals', value: 'Technology' },
          ],
        },
      ],
      groupLogic: 'AND',
      contactCount: 8234,
      isActive: true,
      createdAt: '2024-03-15T00:00:00Z',
      updatedAt: '2024-11-18T00:00:00Z',
      lastCalculatedAt: '2024-11-18T00:00:00Z',
    },
    {
      id: 'segment-3',
      name: 'Enterprise Accounts',
      description: 'Contacts from companies with 500+ employees',
      ruleGroups: [
        {
          id: 'group-1',
          logic: 'OR',
          rules: [
            { id: 'rule-1', field: 'companySize', fieldType: 'select', operator: 'equals', value: '501-1000' },
            { id: 'rule-2', field: 'companySize', fieldType: 'select', operator: 'equals', value: '1001-5000' },
            { id: 'rule-3', field: 'companySize', fieldType: 'select', operator: 'equals', value: '5000+' },
          ],
        },
      ],
      groupLogic: 'AND',
      contactCount: 12456,
      isActive: true,
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-11-19T00:00:00Z',
      lastCalculatedAt: '2024-11-19T00:00:00Z',
    },
    {
      id: 'segment-4',
      name: 'Conference 2024 Attendees',
      description: 'Contacts who attended Tech Summit 2024',
      ruleGroups: [
        {
          id: 'group-1',
          logic: 'AND',
          rules: [
            { id: 'rule-1', field: 'eventAttended', fieldType: 'select', operator: 'equals', value: 'Tech Summit 2024' },
          ],
        },
      ],
      groupLogic: 'AND',
      contactCount: 387,
      isActive: true,
      createdAt: '2024-09-20T00:00:00Z',
      updatedAt: '2024-09-20T00:00:00Z',
      lastCalculatedAt: '2024-09-20T00:00:00Z',
    },
    {
      id: 'segment-5',
      name: 'Engaged Subscribers',
      description: 'Contacts who opened at least 3 emails in the last 30 days',
      ruleGroups: [
        {
          id: 'group-1',
          logic: 'AND',
          rules: [
            { id: 'rule-1', field: 'emailOpensLast30Days', fieldType: 'number', operator: 'greater_than', value: 2 },
            { id: 'rule-2', field: 'subscriptionStatus', fieldType: 'select', operator: 'equals', value: 'subscribed' },
          ],
        },
      ],
      groupLogic: 'AND',
      contactCount: 15678,
      isActive: true,
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: '2024-11-20T00:00:00Z',
      lastCalculatedAt: '2024-11-20T00:00:00Z',
    },
    {
      id: 'segment-6',
      name: 'US West Coast',
      description: 'Contacts located on the US West Coast',
      ruleGroups: [
        {
          id: 'group-1',
          logic: 'AND',
          rules: [
            { id: 'rule-1', field: 'country', fieldType: 'select', operator: 'equals', value: 'United States' },
          ],
        },
        {
          id: 'group-2',
          logic: 'OR',
          rules: [
            { id: 'rule-2', field: 'city', fieldType: 'text', operator: 'contains', value: 'San Francisco' },
            { id: 'rule-3', field: 'city', fieldType: 'text', operator: 'contains', value: 'Los Angeles' },
            { id: 'rule-4', field: 'city', fieldType: 'text', operator: 'contains', value: 'Seattle' },
            { id: 'rule-5', field: 'city', fieldType: 'text', operator: 'contains', value: 'Portland' },
          ],
        },
      ],
      groupLogic: 'AND',
      contactCount: 6789,
      isActive: true,
      createdAt: '2024-04-15T00:00:00Z',
      updatedAt: '2024-11-15T00:00:00Z',
      lastCalculatedAt: '2024-11-15T00:00:00Z',
    },
  ]
}

// Dashboard Stats
export function getDashboardStats(): DashboardStats {
  return {
    totalContacts: 48523,
    contactsGrowth: 12.5,
    totalCampaigns: 24,
    campaignsThisMonth: 3,
    avgOpenRate: 42.3,
    openRateChange: 3.2,
    avgClickRate: 12.8,
    clickRateChange: -0.5,
    upcomingEvents: 3,
    activeSegments: 6,
  }
}

export function generateContactCampaignHistory(contactId: string): ContactCampaignHistory[] {
  const campaigns = generateCampaigns().filter(c => c.status === 'sent')
  
  return campaigns.map(campaign => {
    const opened = Math.random() > 0.4
    const clicked = opened && Math.random() > 0.7
    const replied = clicked && Math.random() > 0.9
    
    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      sentAt: campaign.sentAt!,
      opened,
      openedAt: opened ? randomDate(new Date(campaign.sentAt!), new Date()) : undefined,
      clicked,
      clickedAt: clicked ? randomDate(new Date(campaign.sentAt!), new Date()) : undefined,
      replied,
      repliedAt: replied ? randomDate(new Date(campaign.sentAt!), new Date()) : undefined,
    }
  })
}

export function generateTemplates(): EmailTemplate[] {
  return [
    {
      id: 'template-1',
      name: 'Event Invitation Plain',
      format: 'plain_text',
      subject: 'Join us at EtapaHub {{event_name}}',
      previewText: 'Short, direct invite with registration CTA',
      textContent: 'Hello {{first_name}},\n\nWe would like to invite you to {{event_name}}.\n\nRegistration link: {{cta_url}}\n\nBest,\nEtapaHub',
      createdAt: '2026-02-01T09:00:00Z',
      updatedAt: '2026-02-01T09:00:00Z',
    },
    {
      id: 'template-2',
      name: 'Brochure Follow-up',
      format: 'plain_text',
      subject: 'Your brochure request for {{event_name}}',
      previewText: 'Short follow-up for brochure requests',
      textContent: 'Hello {{first_name}},\n\nAs requested, here is the brochure for {{event_name}}.\n\nDownload: {{brochure_url}}\n\nRegards,\nEtapaHub Team',
      createdAt: '2026-02-10T11:30:00Z',
      updatedAt: '2026-02-10T11:30:00Z',
    },
  ]
}

// Generate Companies
export function generateCompanies(): Company[] {
  return [
    { id: 'company-1', name: 'AstraZeneca', address: '1 Francis Crick Ave', city: 'Cambridge', country: 'United Kingdom', postalCode: 'CB2 0AA', vatId: 'GB123456789', industry: 'Pharmaceuticals', website: 'https://astrazeneca.com' },
    { id: 'company-2', name: 'Novartis AG', address: 'Lichtstrasse 35', city: 'Basel', country: 'Switzerland', postalCode: '4056', vatId: 'CHE-101.234.567', industry: 'Pharmaceuticals', website: 'https://novartis.com' },
    { id: 'company-3', name: 'Pfizer Inc', address: '235 E 42nd St', city: 'New York', country: 'United States', postalCode: '10017', taxId: '13-5315170', industry: 'Pharmaceuticals', website: 'https://pfizer.com' },
    { id: 'company-4', name: 'Roche Holding AG', address: 'Grenzacherstrasse 124', city: 'Basel', country: 'Switzerland', postalCode: '4070', vatId: 'CHE-100.200.300', industry: 'Pharmaceuticals', website: 'https://roche.com' },
    { id: 'company-5', name: 'Sanofi SA', address: '54 Rue La Boétie', city: 'Paris', country: 'France', postalCode: '75008', vatId: 'FR12345678901', industry: 'Pharmaceuticals', website: 'https://sanofi.com' },
    { id: 'company-6', name: 'Johnson & Johnson', address: 'One Johnson & Johnson Plaza', city: 'New Brunswick', country: 'United States', postalCode: '08933', taxId: '22-1024240', industry: 'Healthcare', website: 'https://jnj.com' },
    { id: 'company-7', name: 'Merck & Co', address: '2000 Galloping Hill Road', city: 'Kenilworth', country: 'United States', postalCode: '07033', taxId: '22-1918501', industry: 'Pharmaceuticals', website: 'https://merck.com' },
    { id: 'company-8', name: 'GlaxoSmithKline', address: '980 Great West Road', city: 'Brentford', country: 'United Kingdom', postalCode: 'TW8 9GS', vatId: 'GB123789456', industry: 'Pharmaceuticals', website: 'https://gsk.com' },
  ]
}

// Generate Registrations
export function generateRegistrations(): Registration[] {
  const contacts = generateContacts(20)
  const events = generateEvents()
  const companies = generateCompanies()
  
  const ticketPrices: Record<RegistrationTicketType, number> = {
    standard: 890,
    vip: 1890,
    speaker: 0,
    sponsor: 4500,
    exhibitor: 3200,
    press: 0,
    staff: 0,
  }

  return [
    {
      id: 'reg-1',
      eventId: 'event-1',
      eventName: events[0].name,
      contactId: 'contact-1',
      contactName: `${contacts[0].firstName} ${contacts[0].lastName}`,
      contactEmail: contacts[0].email,
      companyId: 'company-1',
      company: companies[0],
      ticketType: 'vip',
      ticketPrice: 1290,
      currency: 'EUR',
      quantity: 1,
      totalAmount: 1290,
      status: 'confirmed',
      registeredAt: '2026-01-10T10:00:00Z',
      confirmedAt: '2026-01-15T14:00:00Z',
      invoiceId: 'inv-1',
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-15T14:00:00Z',
    },
    {
      id: 'reg-2',
      eventId: 'event-2',
      eventName: events[1].name,
      contactId: 'contact-2',
      contactName: `${contacts[1].firstName} ${contacts[1].lastName}`,
      contactEmail: contacts[1].email,
      companyId: 'company-2',
      company: companies[1],
      ticketType: 'standard',
      ticketPrice: 890,
      currency: 'EUR',
      quantity: 3,
      totalAmount: 2670,
      status: 'confirmed',
      registeredAt: '2026-01-18T09:00:00Z',
      confirmedAt: '2026-01-20T11:00:00Z',
      invoiceId: 'inv-2',
      additionalAttendees: [
        { name: 'Marie Dupont', email: 'marie.dupont@novartis.com', jobTitle: 'Research Director' },
        { name: 'Hans Weber', email: 'hans.weber@novartis.com', jobTitle: 'Clinical Lead' },
      ],
      adminNotes: 'Group registration - 3 attendees',
      createdAt: '2026-01-18T09:00:00Z',
      updatedAt: '2026-01-20T11:00:00Z',
    },
    {
      id: 'reg-3',
      eventId: 'event-3',
      eventName: events[2].name,
      contactId: 'contact-3',
      contactName: `${contacts[2].firstName} ${contacts[2].lastName}`,
      contactEmail: contacts[2].email,
      companyId: 'company-3',
      company: companies[2],
      ticketType: 'standard',
      ticketPrice: 890,
      currency: 'USD',
      quantity: 1,
      totalAmount: 890,
      status: 'pending',
      registeredAt: '2026-01-28T08:00:00Z',
      invoiceId: 'inv-3',
      adminNotes: 'Awaiting payment confirmation',
      createdAt: '2026-01-28T08:00:00Z',
      updatedAt: '2026-02-01T08:00:00Z',
    },
    {
      id: 'reg-4',
      eventId: 'event-1',
      eventName: events[0].name,
      contactId: 'contact-4',
      contactName: `${contacts[3].firstName} ${contacts[3].lastName}`,
      contactEmail: contacts[3].email,
      companyId: 'company-4',
      company: companies[3],
      ticketType: 'vip',
      ticketPrice: 1890,
      currency: 'CHF',
      quantity: 1,
      totalAmount: 1890,
      status: 'confirmed',
      registeredAt: '2026-02-05T14:00:00Z',
      confirmedAt: '2026-02-10T09:00:00Z',
      invoiceId: 'inv-4',
      createdAt: '2026-02-05T14:00:00Z',
      updatedAt: '2026-02-10T09:00:00Z',
    },
    {
      id: 'reg-5',
      eventId: 'event-4',
      eventName: events[3].name,
      contactId: 'contact-5',
      contactName: `${contacts[4].firstName} ${contacts[4].lastName}`,
      contactEmail: contacts[4].email,
      companyId: 'company-5',
      company: companies[4],
      ticketType: 'exhibitor',
      ticketPrice: 3200,
      currency: 'EUR',
      quantity: 1,
      totalAmount: 3200,
      status: 'pending',
      registeredAt: '2026-02-10T11:00:00Z',
      invoiceId: 'inv-5',
      specialRequirements: 'Booth size: 3x3m, Power outlets: 4',
      adminNotes: 'Exhibitor booth - overdue payment',
      createdAt: '2026-02-10T11:00:00Z',
      updatedAt: '2026-02-15T11:00:00Z',
    },
    {
      id: 'reg-6',
      eventId: 'event-5',
      eventName: events[4].name,
      contactId: 'contact-6',
      contactName: `${contacts[5].firstName} ${contacts[5].lastName}`,
      contactEmail: contacts[5].email,
      companyId: 'company-6',
      company: companies[5],
      ticketType: 'standard',
      ticketPrice: 795,
      currency: 'USD',
      quantity: 2,
      totalAmount: 1590,
      status: 'pending',
      registeredAt: '2026-02-18T10:00:00Z',
      invoiceId: 'inv-6',
      additionalAttendees: [
        { name: 'Lisa Chen', email: 'lisa.chen@jnj.com', jobTitle: 'Product Manager' },
      ],
      adminNotes: 'Draft invoice - awaiting attendee confirmation',
      createdAt: '2026-02-18T10:00:00Z',
      updatedAt: '2026-02-20T10:00:00Z',
    },
    {
      id: 'reg-7',
      eventId: 'event-1',
      eventName: events[0].name,
      contactId: 'contact-7',
      contactName: `${contacts[6].firstName} ${contacts[6].lastName}`,
      contactEmail: contacts[6].email,
      companyId: 'company-7',
      company: companies[6],
      ticketType: 'vip',
      ticketPrice: 1290,
      currency: 'EUR',
      quantity: 1,
      totalAmount: 1290,
      status: 'cancelled',
      registeredAt: '2026-01-03T09:00:00Z',
      confirmedAt: '2026-01-05T10:00:00Z',
      cancelledAt: '2026-01-20T14:00:00Z',
      invoiceId: 'inv-7',
      adminNotes: 'Cancelled - full refund processed',
      createdAt: '2026-01-03T09:00:00Z',
      updatedAt: '2026-01-25T14:00:00Z',
    },
    {
      id: 'reg-8',
      eventId: 'event-2',
      eventName: events[1].name,
      contactId: 'contact-8',
      contactName: `${contacts[7].firstName} ${contacts[7].lastName}`,
      contactEmail: contacts[7].email,
      companyId: 'company-8',
      company: companies[7],
      ticketType: 'sponsor',
      ticketPrice: 4500,
      currency: 'GBP',
      quantity: 1,
      totalAmount: 4500,
      status: 'confirmed',
      registeredAt: '2026-02-25T10:00:00Z',
      confirmedAt: '2026-03-01T10:00:00Z',
      invoiceId: 'inv-8',
      specialRequirements: 'Logo placement, Speaking slot requested',
      adminNotes: 'Gold sponsor - premium package with networking dinner',
      createdAt: '2026-02-25T10:00:00Z',
      updatedAt: '2026-03-01T10:00:00Z',
    },
  ]
}

// Generate Invoices (linked to Registrations)
export function generateInvoices(): Invoice[] {
  const registrations = generateRegistrations()
  
  return registrations.map((reg, index) => {
    const invoiceNum = String(index + 1).padStart(3, '0')
    const lineItems: InvoiceLineItem[] = [
      {
        id: `line-${reg.id}-1`,
        description: `${reg.eventName} - ${reg.ticketType.charAt(0).toUpperCase() + reg.ticketType.slice(1)} Ticket`,
        quantity: reg.quantity,
        unitPrice: reg.ticketPrice,
        totalPrice: reg.totalAmount,
      },
    ]
    
    const subtotal = reg.totalAmount
    const taxRate = reg.company.country === 'Switzerland' ? 0.077 : (reg.company.country === 'United States' ? 0 : 0.20)
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100
    const totalAmount = subtotal + taxAmount
    
    // Determine payment status and amounts based on registration index
    const paidAmounts: Record<string, number> = {
      'reg-1': totalAmount,
      'reg-2': Math.round(totalAmount * 0.5),
      'reg-4': totalAmount,
    }
    const amountPaid = paidAmounts[reg.id] || 0
    
    const statusMap: Record<string, InvoiceStatus> = {
      'reg-1': 'paid',
      'reg-2': 'partially_paid',
      'reg-3': 'issued',
      'reg-4': 'paid',
      'reg-5': 'overdue',
      'reg-6': 'draft',
      'reg-7': 'refunded',
      'reg-8': 'issued',
    }
    
    const paymentStatusMap: Record<string, PaymentStatus> = {
      'reg-1': 'paid',
      'reg-2': 'partially_paid',
      'reg-3': 'unpaid',
      'reg-4': 'paid',
      'reg-5': 'unpaid',
      'reg-6': 'unpaid',
      'reg-7': 'refunded',
      'reg-8': 'unpaid',
    }

    return {
      id: `inv-${index + 1}`,
      invoiceNumber: `INV-2026-${invoiceNum}`,
      invoiceDate: reg.registeredAt.split('T')[0],
      dueDate: new Date(new Date(reg.registeredAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: statusMap[reg.id] || 'draft',
      registrationId: reg.id,
      eventId: reg.eventId,
      eventName: reg.eventName,
      contactId: reg.contactId,
      contactName: reg.contactName,
      contactEmail: reg.contactEmail,
      companyId: reg.companyId,
      company: reg.company,
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      currency: reg.currency,
      amountPaid,
      balanceDue: totalAmount - amountPaid,
      paymentStatus: paymentStatusMap[reg.id] || 'unpaid',
      adminNotes: reg.adminNotes,
      createdAt: reg.createdAt,
      updatedAt: reg.updatedAt,
    }
  })
}

// Generate Payments for an invoice
export function generatePayments(invoiceId: string): Payment[] {
  const paymentMethods: PaymentMethod[] = ['bank_transfer', 'card', 'cash', 'other']
  const currencies: Currency[] = ['EUR', 'USD', 'GBP', 'CHF']
  
  const paymentsMap: Record<string, Payment[]> = {
    'inv-1': [
      {
        id: 'pay-1',
        invoiceId: 'inv-1',
        amount: 1290,
        currency: 'EUR',
        paymentDate: '2026-01-20',
        paymentMethod: 'bank_transfer',
        paymentReference: 'TRF-2026-001234',
        status: 'completed',
        notes: 'Full payment received',
        createdAt: '2026-01-20T14:30:00Z',
        createdBy: 'admin@etapahub.com',
      },
    ],
    'inv-2': [
      {
        id: 'pay-2',
        invoiceId: 'inv-2',
        amount: 1225,
        currency: 'EUR',
        paymentDate: '2026-02-01',
        paymentMethod: 'card',
        paymentReference: 'CARD-7834',
        status: 'completed',
        notes: 'First installment - 50%',
        createdAt: '2026-02-01T11:00:00Z',
        createdBy: 'admin@etapahub.com',
      },
    ],
    'inv-4': [
      {
        id: 'pay-3',
        invoiceId: 'inv-4',
        amount: 1890,
        currency: 'CHF',
        paymentDate: '2026-02-25',
        paymentMethod: 'bank_transfer',
        paymentReference: 'TRF-2026-002567',
        status: 'completed',
        notes: 'Full payment',
        createdAt: '2026-02-25T09:00:00Z',
        createdBy: 'finance@etapahub.com',
      },
    ],
    'inv-7': [
      {
        id: 'pay-4',
        invoiceId: 'inv-7',
        amount: 1290,
        currency: 'EUR',
        paymentDate: '2026-01-10',
        paymentMethod: 'bank_transfer',
        paymentReference: 'TRF-2026-000789',
        status: 'completed',
        notes: 'Initial payment',
        createdAt: '2026-01-10T10:00:00Z',
        createdBy: 'admin@etapahub.com',
      },
      {
        id: 'pay-5',
        invoiceId: 'inv-7',
        amount: -1290,
        currency: 'EUR',
        paymentDate: '2026-01-25',
        paymentMethod: 'bank_transfer',
        paymentReference: 'REF-2026-000789',
        status: 'refunded',
        notes: 'Full refund - event cancelled',
        createdAt: '2026-01-25T14:00:00Z',
        createdBy: 'finance@etapahub.com',
      },
    ],
  }
  
  return paymentsMap[invoiceId] || []
}

// Pre-generate some contacts for use
export const mockContacts = generateContacts(100)
export const mockCampaigns = generateCampaigns()
export const mockSegments = generateSegments()
export const mockEvents = generateEvents()
export const mockDashboardStats = getDashboardStats()
export const mockCompanies = generateCompanies()
export const mockRegistrations = generateRegistrations()
export const mockInvoices = generateInvoices()
export const mockTemplates = generateTemplates()
