"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Papa from "papaparse"
import { ArrowLeft, FileUp, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { importContacts } from "@/lib/crm-repository"
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
import type { CreateContactInput } from "@/lib/crm-repository"

function normalizeColumnName(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "")
}

function parseName(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") || parts[0] || "",
  }
}

function mapCsvRecord(record: Record<string, string>): CreateContactInput | null {
  const normalizedRecord = Object.fromEntries(
    Object.entries(record).map(([key, value]) => [normalizeColumnName(key), String(value ?? "").trim()])
  )

  const fullName = normalizedRecord.name || normalizedRecord.fullname || ""
  const parsedName = parseName(fullName)
  const firstName = normalizedRecord.firstname || parsedName.firstName
  const lastName = normalizedRecord.lastname || parsedName.lastName
  const email = normalizedRecord.email

  if (!email || !firstName) {
    return null
  }

  return {
    firstName,
    lastName,
    email,
    company: normalizedRecord.company || normalizedRecord.companyname || "",
    jobTitle: normalizedRecord.jobtitle || normalizedRecord.role || "",
    phone: normalizedRecord.phone || normalizedRecord.mobile || "",
    linkedin: normalizedRecord.linkedin || "",
    country: normalizedRecord.country || "",
    city: normalizedRecord.city || "",
    industry: normalizedRecord.industry || "",
    companySize: normalizedRecord.companysize || "",
  }
}

export default function ImportContactsPage() {
  const router = useRouter()
  const [rawCsv, setRawCsv] = useState("")
  const [fileName, setFileName] = useState("")
  const [batchTag, setBatchTag] = useState("")
  const [segmentName, setSegmentName] = useState("")
  const [leadSource, setLeadSource] = useState("CSV Import")
  const [previewRows, setPreviewRows] = useState<CreateContactInput[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const buildPreview = async (csv: string) => {
    setIsParsing(true)

    try {
      const result = Papa.parse<Record<string, string>>(csv, {
        header: true,
        skipEmptyLines: true,
      })

      if (result.errors.length > 0) {
        throw new Error(result.errors[0]?.message || "Invalid CSV")
      }

      const mappedRows = result.data
        .map(mapCsvRecord)
        .filter(Boolean) as CreateContactInput[]

      setPreviewRows(mappedRows)
      toast.success(`${mappedRows.length} rows parsed`)
    } catch (error) {
      console.error(error)
      toast.error("Could not parse the CSV")
      setPreviewRows([])
    } finally {
      setIsParsing(false)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setFileName(file.name)
    const csv = await file.text()
    setRawCsv(csv)
    await buildPreview(csv)
  }

  const handlePreview = async () => {
    if (!rawCsv.trim()) {
      toast.error("Paste CSV data or upload a file first")
      return
    }

    await buildPreview(rawCsv)
  }

  const handleImport = async () => {
    if (previewRows.length === 0) {
      toast.error("No valid rows to import")
      return
    }

    setIsImporting(true)

    try {
      await importContacts({
        contacts: previewRows,
        batchTag,
        segmentName,
        leadSource,
      })

      toast.success(`${previewRows.length} contacts imported`)
      router.push("/contacts")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Could not import contacts")
    } finally {
      setIsImporting(false)
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
              <BreadcrumbPage>Import</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
            <Link href="/contacts">
              <ArrowLeft className="size-4" />
              Back to Contacts
            </Link>
          </Button>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Import Contacts from CSV</CardTitle>
                <CardDescription>
                  Paste CSV content or upload a file. Supported columns: name, first name, last name, email, company, job title, phone, country, city.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csvFile">CSV file</Label>
                  <Input id="csvFile" type="file" accept=".csv,text/csv" onChange={handleFileChange} />
                  {fileName && <p className="text-xs text-muted-foreground">Loaded: {fileName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rawCsv">Or paste CSV</Label>
                  <Textarea
                    id="rawCsv"
                    value={rawCsv}
                    onChange={(event) => setRawCsv(event.target.value)}
                    rows={14}
                    placeholder={"name,email,company\nMario Rossi,mario@azienda.com,EtapaHub Partner"}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="outline" onClick={handlePreview} disabled={isParsing}>
                    {isParsing && <LoaderCircle className="size-4 animate-spin" />}
                    Preview Import
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Batch Settings</CardTitle>
                <CardDescription>
                  Add the batch tag and optional segment now, so the sales team can track the list later.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batchTag">Batch tag</Label>
                  <Input id="batchTag" value={batchTag} onChange={(event) => setBatchTag(event.target.value)} placeholder="pharma-march-batch-a" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segmentName">Segment name</Label>
                  <Input id="segmentName" value={segmentName} onChange={(event) => setSegmentName(event.target.value)} placeholder="Pharma March Outreach" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadSource">Lead source</Label>
                  <Input id="leadSource" value={leadSource} onChange={(event) => setLeadSource(event.target.value)} />
                </div>
                <div className="rounded-lg border border-border p-4 text-sm">
                  <div className="font-medium">{previewRows.length} valid contacts ready</div>
                  <p className="mt-1 text-muted-foreground">
                    Invalid rows are skipped automatically during preview.
                  </p>
                </div>
                <Button onClick={handleImport} disabled={isImporting || previewRows.length === 0} className="w-full">
                  {isImporting ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Importing
                    </>
                  ) : (
                    <>
                      <FileUp className="size-4" />
                      Import Contacts
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                First {Math.min(previewRows.length, 8)} parsed rows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No preview available yet.</p>
              ) : (
                <div className="space-y-3">
                  {previewRows.slice(0, 8).map((row, index) => (
                    <div key={`${row.email}-${index}`} className="rounded-lg border border-border p-3">
                      <div className="font-medium">{row.firstName} {row.lastName}</div>
                      <div className="text-sm text-muted-foreground">{row.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {row.company || "No company"} {row.jobTitle ? `· ${row.jobTitle}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
