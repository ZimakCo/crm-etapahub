"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateTemplate } from "@/lib/crm-repository"
import { useTemplate } from "@/lib/hooks"
import { TemplateEditor } from "@/components/email-ops/template-editor"
import { Skeleton } from "@/components/ui/skeleton"

export default function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { template, isLoading } = useTemplate(id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading) {
    return (
      <main className="space-y-6 px-6 py-6">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-[720px] w-full rounded-2xl" />
      </main>
    )
  }

  if (!template) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Template not found
      </main>
    )
  }

  return (
    <TemplateEditor
      mode="edit"
      initialValue={template}
      isSubmitting={isSubmitting}
      onSubmit={async (value) => {
        try {
          setIsSubmitting(true)
          await updateTemplate(id, {
            name: value.name,
            subject: value.subject,
            previewText: value.previewText,
            textContent: value.textContent,
            format: "plain_text",
          })

          toast.success("Template updated")
          router.refresh()
        } catch (error) {
          console.error(error)
          toast.error("Could not save the template")
        } finally {
          setIsSubmitting(false)
        }
      }}
    />
  )
}
