"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { createCompany } from "@/lib/crm-repository"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function NewCompanyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    vatId: "",
    taxId: "",
  })

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const company = await createCompany(formData)
      toast.success("Company created")
      router.push(`/companies/${company.id}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Could not create the company")
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
              <BreadcrumbLink href="/companies">Companies</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Company</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
            <Link href="/companies">
              <ArrowLeft className="size-4" />
              Back to Companies
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Create Company</CardTitle>
              <CardDescription>
                Create the account record first, then attach contacts, registrations and invoices to it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company name</Label>
                  <Input
                    id="company-name"
                    value={formData.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-industry">Industry</Label>
                  <Input
                    id="company-industry"
                    value={formData.industry}
                    onChange={(event) => updateField("industry", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <Input
                    id="company-website"
                    value={formData.website}
                    onChange={(event) => updateField("website", event.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input
                    id="company-phone"
                    value={formData.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company-address">Address</Label>
                  <Input
                    id="company-address"
                    value={formData.address}
                    onChange={(event) => updateField("address", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-city">City</Label>
                  <Input
                    id="company-city"
                    value={formData.city}
                    onChange={(event) => updateField("city", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-postal-code">Postal code</Label>
                  <Input
                    id="company-postal-code"
                    value={formData.postalCode}
                    onChange={(event) => updateField("postalCode", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-country">Country</Label>
                  <Input
                    id="company-country"
                    value={formData.country}
                    onChange={(event) => updateField("country", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-vat">VAT ID</Label>
                  <Input
                    id="company-vat"
                    value={formData.vatId}
                    onChange={(event) => updateField("vatId", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-tax">Tax ID</Label>
                  <Input
                    id="company-tax"
                    value={formData.taxId}
                    onChange={(event) => updateField("taxId", event.target.value)}
                  />
                </div>
                <div className="flex items-center justify-end gap-3 md:col-span-2">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/companies">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
                    Save Company
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
