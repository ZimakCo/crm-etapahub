"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { createTemplate } from "@/lib/crm-repository"
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
    <main className="min-h-full bg-[#050505] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div className="text-sm text-white/60">
          <Link href="/templates" className="hover:text-white">Templates</Link>
          <span className="mx-2 text-white/30">/</span>
          <span className="font-medium text-white">{formData.name || "Untitled Template"}</span>
          <span className="ml-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/55">
            Draft
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]" asChild>
            <Link href="/templates">Cancel</Link>
          </Button>
          <Button
            type="submit"
            form="template-form"
            className="rounded-xl bg-white text-black hover:bg-white/90"
            disabled={isSubmitting}
          >
            {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
            Publish
          </Button>
        </div>
      </div>

      <form
        id="template-form"
        className="grid gap-6 px-6 py-6 xl:grid-cols-[76px_minmax(0,1fr)_420px]"
        onSubmit={handleSubmit}
      >
        <div className="hidden xl:flex xl:flex-col xl:items-center xl:gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-lg font-medium">
            T
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-lg font-medium">
            /
          </div>
        </div>

        <div className="rounded-[36px] border border-white/10 bg-white px-6 py-8 text-black xl:px-10">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="grid gap-5 md:grid-cols-[120px_minmax(0,1fr)_120px_minmax(0,1fr)]">
              <Label className="pt-3 text-3xl font-normal text-black/65">Name</Label>
              <div className="border-b border-black/10 pb-3">
                <Input
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="h-auto border-0 bg-transparent px-0 text-lg text-black shadow-none focus-visible:ring-0"
                  placeholder="Template name"
                  required
                />
              </div>
              <Label className="pt-3 text-3xl font-normal text-black/65">Preview text</Label>
              <div className="border-b border-black/10 pb-3">
                <Input
                  value={formData.previewText}
                  onChange={(event) => updateField("previewText", event.target.value)}
                  className="h-auto border-0 bg-transparent px-0 text-lg text-black shadow-none focus-visible:ring-0"
                  placeholder="Preview text"
                />
              </div>
            </div>

            <div className="border-b border-black/10 pb-3">
              <Input
                value={formData.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                className="h-auto border-0 bg-transparent px-0 text-4xl font-medium tracking-tight text-black shadow-none focus-visible:ring-0"
                placeholder="Template subject"
                required
              />
            </div>

            <Textarea
              rows={22}
              value={formData.textContent}
              onChange={(event) => updateField("textContent", event.target.value)}
              className="min-h-[680px] resize-none border-0 bg-transparent px-0 text-[18px] leading-[1.65] text-black shadow-none focus-visible:ring-0"
              placeholder={"Dear {{{contact.first_name}}}\n\nWrite the plain text template body here...\n\nEvent link: https://...\nBrochure: https://...\n\nBest regards,\nEtapaHub"}
              required
            />
          </div>
        </div>

        <aside className="rounded-[30px] border border-white/10 bg-[#0f1012] p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.18em] text-white/40">Format</p>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">Plain text</p>
                <p className="mt-2 text-sm text-white/50">
                  Delivery-first format aligned with the EtapaHub outbound workflow.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.18em] text-white/40">Recommended variables</p>
              <div className="flex flex-wrap gap-2">
                {["{{{contact.first_name}}}", "{{{contact.last_name}}}", "{{{event.name}}}", "{{{event.date}}}", "{{{brochure_url}}}"].map((token) => (
                  <span key={token} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70">
                    {token}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.18em] text-white/40">Workflow</p>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
                1. Save the template here.
                <br />
                2. Sales builds manual segments inside Audience.
                <br />
                3. Operations creates the broadcast and picks sender identity + segment.
              </div>
            </div>
          </div>
        </aside>
      </form>
    </main>
  )
}
