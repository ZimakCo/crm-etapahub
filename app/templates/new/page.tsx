"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { createTemplate } from "@/lib/crm-repository"
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

export default function NewTemplatePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    previewText: "",
    textContent: "",
  })

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await createTemplate({
        name: formData.name,
        format: "plain_text",
        subject: formData.subject,
        previewText: formData.previewText,
        textContent: formData.textContent,
      })

      toast.success("Template created")
      router.push("/templates")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Could not create the template")
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
              <BreadcrumbLink href="/templates">Templates</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Template</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
            <Link href="/templates">
              <ArrowLeft className="size-4" />
              Back to Templates
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Create Template</CardTitle>
              <CardDescription>
                Manage plain-text email content separately from campaigns, then route it through the right provider lane.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Template name</Label>
                  <Input id="name" value={formData.name} onChange={(event) => updateField("name", event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={formData.subject} onChange={(event) => updateField("subject", event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previewText">Preview text</Label>
                  <Input id="previewText" value={formData.previewText} onChange={(event) => updateField("previewText", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textContent">Plain-text body</Label>
                  <Textarea
                    id="textContent"
                    rows={16}
                    value={formData.textContent}
                    onChange={(event) => updateField("textContent", event.target.value)}
                    placeholder={"Hello {{first_name}},\n\nWe would like to invite you to {{event_name}}.\n\nCTA: {{cta_url}}\n\nBest,\nEtapaHub"}
                    required
                  />
                </div>
                <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                  After saving, assign the template to the preferred provider lane in Settings and use it from the Email Ops area for daily manual list sends.
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/templates">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
                    Save Template
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
