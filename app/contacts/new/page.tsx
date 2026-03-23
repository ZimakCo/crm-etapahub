"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { createContact } from "@/lib/crm-repository"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NewContactPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: "",
    phone: "",
    linkedin: "",
    country: "",
    city: "",
    industry: "",
    companySize: "",
    leadSource: "Manual",
    contactType: "lead",
    ownerName: "",
    notes: "",
    tags: "",
  })

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await createContact({
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        contactType: formData.contactType as "lead" | "client" | "subscriber" | "delegate" | "employee" | "sponsor",
      })

      toast.success("Contact created")
      router.push("/contacts")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Could not create the contact")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/contacts">Contacts</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Contact</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
            <Link href="/contacts">
              <ArrowLeft className="size-4" />
              Back to Contacts
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Add Contact</CardTitle>
              <CardDescription>
                Create a contact record that can be used in campaigns, events, registrations, and billing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" value={formData.firstName} onChange={(event) => updateField("firstName", event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={formData.lastName} onChange={(event) => updateField("lastName", event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(event) => updateField("email", event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={formData.company} onChange={(event) => updateField("company", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job title</Label>
                  <Input id="jobTitle" value={formData.jobTitle} onChange={(event) => updateField("jobTitle", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={formData.phone} onChange={(event) => updateField("phone", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" value={formData.linkedin} onChange={(event) => updateField("linkedin", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Commercial owner</Label>
                  <Input id="ownerName" value={formData.ownerName} onChange={(event) => updateField("ownerName", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={formData.country} onChange={(event) => updateField("country", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={formData.city} onChange={(event) => updateField("city", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" value={formData.industry} onChange={(event) => updateField("industry", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company size</Label>
                  <Input id="companySize" value={formData.companySize} onChange={(event) => updateField("companySize", event.target.value)} placeholder="e.g. 51-200" />
                </div>
                <div className="space-y-2">
                  <Label>Contact type</Label>
                  <Select value={formData.contactType} onValueChange={(value) => updateField("contactType", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="subscriber">Subscriber</SelectItem>
                      <SelectItem value="delegate">Delegate</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="sponsor">Sponsor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lead source</Label>
                  <Select value={formData.leadSource} onValueChange={(value) => updateField("leadSource", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="CSV Import">CSV Import</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" value={formData.tags} onChange={(event) => updateField("tags", event.target.value)} placeholder="vip, pharma, webinar-march" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Internal notes</Label>
                  <Textarea id="notes" value={formData.notes} onChange={(event) => updateField("notes", event.target.value)} rows={5} />
                </div>
                <div className="flex items-center justify-end gap-3 md:col-span-2">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/contacts">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
                    Save Contact
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
