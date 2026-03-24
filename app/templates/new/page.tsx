"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createTemplate } from "@/lib/crm-repository"
import { TemplateEditor } from "@/components/email-ops/template-editor"

export default function NewTemplatePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <TemplateEditor
      mode="create"
      isSubmitting={isSubmitting}
      onSubmit={async (value) => {
        try {
          setIsSubmitting(true)
          const template = await createTemplate({
            name: value.name,
            format: "plain_text",
            subject: value.subject,
            previewText: value.previewText,
            textContent: value.textContent,
          })

          toast.success("Template created")
          router.push(`/templates/${template.id}`)
          router.refresh()
        } catch (error) {
          console.error(error)
          toast.error("Could not create the template")
        } finally {
          setIsSubmitting(false)
        }
      }}
    />
  )
}
