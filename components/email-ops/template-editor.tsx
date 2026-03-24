"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { LoaderCircle, Mail, Tags } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { EmailTemplate } from "@/lib/types"

interface TemplateEditorProps {
  mode: "create" | "edit"
  initialValue?: Partial<EmailTemplate>
  isSubmitting?: boolean
  onSubmit: (value: {
    name: string
    subject: string
    previewText: string
    textContent: string
  }) => Promise<void>
}

const recommendedVariables = [
  "{{first_name}}",
  "{{last_name}}",
  "{{company}}",
  "{{event_name}}",
  "{{event_date}}",
  "{{brochure_url}}",
  "{{cta_url}}",
]

export function TemplateEditor({
  mode,
  initialValue,
  isSubmitting,
  onSubmit,
}: TemplateEditorProps) {
  const [formData, setFormData] = useState({
    name: initialValue?.name ?? "",
    subject: initialValue?.subject ?? "",
    previewText: initialValue?.previewText ?? "",
    textContent: initialValue?.textContent ?? "",
  })

  useEffect(() => {
    setFormData({
      name: initialValue?.name ?? "",
      subject: initialValue?.subject ?? "",
      previewText: initialValue?.previewText ?? "",
      textContent: initialValue?.textContent ?? "",
    })
  }, [
    initialValue?.name,
    initialValue?.previewText,
    initialValue?.subject,
    initialValue?.textContent,
  ])

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit(formData)
  }

  return (
    <main className="min-h-full bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_15rem)] text-foreground">
      <div className="border-b bg-background/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            <Link href="/templates" className="transition-colors hover:text-foreground">
              Templates
            </Link>
            <span className="mx-2 text-border">/</span>
            <span className="font-medium text-foreground">
              {formData.name || (mode === "create" ? "New template" : "Edit template")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/templates">Cancel</Link>
            </Button>
            <Button type="submit" form="template-form" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
              {mode === "create" ? "Save template" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>

      <form
        id="template-form"
        className="mx-auto grid max-w-7xl gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_320px]"
        onSubmit={handleSubmit}
      >
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="template-name">Internal name</Label>
                <Input
                  id="template-name"
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="HPAPI Milan invite"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-preview">Preview text</Label>
                <Input
                  id="template-preview"
                  value={formData.previewText}
                  onChange={(event) => updateField("previewText", event.target.value)}
                  placeholder="Plain-text invite optimised for delivery."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject</Label>
              <Input
                id="template-subject"
                value={formData.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                placeholder="Join us at..."
                required
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
              <div className="space-y-2">
                <Label htmlFor="template-body">Plain-text body</Label>
                <Textarea
                  id="template-body"
                  rows={22}
                  value={formData.textContent}
                  onChange={(event) => updateField("textContent", event.target.value)}
                  className="min-h-[620px] resize-y font-mono text-[15px] leading-7"
                  placeholder={"Dear {{first_name}},\n\nWe would like to invite you...\n\nEvent link: {{cta_url}}\nBrochure: {{brochure_url}}\n\nBest regards,\nEtapaHub"}
                  required
                />
              </div>

              <div className="space-y-4">
                <Card className="border-border/70 bg-muted/25 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="inline-flex items-center gap-2 text-base">
                      <Mail className="size-4" />
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="rounded-xl border bg-background p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Subject
                      </p>
                      <p className="mt-2 font-medium">
                        {formData.subject || "Your template subject"}
                      </p>
                    </div>
                    <div className="rounded-xl border bg-background p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        First lines
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                        {(formData.textContent || "The opening lines of the plain-text email will appear here.")
                          .split("\n")
                          .slice(0, 6)
                          .join("\n")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-muted/25 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="inline-flex items-center gap-2 text-base">
                      <Tags className="size-4" />
                      Suggested Variables
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {recommendedVariables.map((token) => (
                      <span
                        key={token}
                        className="rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground"
                      >
                        {token}
                      </span>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-muted/25 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Workflow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>1. Save the template here.</p>
                    <p>2. Sales builds the manual segment in Audience.</p>
                    <p>3. Operations opens a broadcast and chooses template, audience and sender identity.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </main>
  )
}
