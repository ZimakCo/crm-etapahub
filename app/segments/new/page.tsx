"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { createSegment } from "@/lib/crm-repository"
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

export default function NewSegmentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [segmentKind, setSegmentKind] = useState("manual")
  const [groupLogic, setGroupLogic] = useState("AND")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const segment = await createSegment({
        name,
        description,
        segmentKind: segmentKind as "manual" | "dynamic" | "campaign" | "event",
        groupLogic: groupLogic as "AND" | "OR",
      })

      toast.success("Segment created")
      router.push(`/segments/${segment.id}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Could not create the segment")
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
              <BreadcrumbLink href="/segments">Segments</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Segment</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
            <Link href="/segments">
              <ArrowLeft className="size-4" />
              Back to Segments
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Create Segment</CardTitle>
              <CardDescription>
                Create a reusable list for campaign batches, newsletter audiences, or event cohorts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Segment name</Label>
                  <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} rows={5} required />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Segment type</Label>
                    <Select value={segmentKind} onValueChange={setSegmentKind}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual batch</SelectItem>
                        <SelectItem value="dynamic">Dynamic audience</SelectItem>
                        <SelectItem value="campaign">Campaign-driven</SelectItem>
                        <SelectItem value="event">Event-driven</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Rule logic</Label>
                    <Select value={groupLogic} onValueChange={setGroupLogic}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                  Manual segments can be populated from contact selection, CSV import and direct membership updates. Dynamic rules can be configured from the segment detail page.
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/segments">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
                    Save Segment
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
