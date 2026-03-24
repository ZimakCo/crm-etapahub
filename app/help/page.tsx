"use client"

import Link from "next/link"
import { CircleHelp, FileText, Filter, Mail, Users } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HelpPage() {
  const blocks = [
    {
      title: "Contacts and CSV",
      description: "Import the daily CSV list, keep the batch tag, and enrich the contact manually when needed.",
      href: "/contacts/import",
      icon: Users,
      action: "Open CSV Import",
    },
    {
      title: "Segments",
      description: "Use segments as the resend-style audience containers built from lists, campaigns and event activity.",
      href: "/segments",
      icon: Filter,
      action: "Open Segments",
    },
    {
      title: "Templates",
      description: "Templates are managed separately and later paired with the provider lane that should send them.",
      href: "/templates",
      icon: FileText,
      action: "Open Templates",
    },
    {
      title: "Campaign Batches",
      description: "Campaigns are the daily execution layer: segment + provider lane + chosen template + imported list slice.",
      href: "/campaigns",
      icon: Mail,
      action: "Open Campaigns",
    },
  ]

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Help</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Operational Help</h1>
            <p className="text-sm text-muted-foreground">
              Quick orientation for the CRM workflow used by EtapaHub.
            </p>
          </div>

          <Card className="border-dashed">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Core logic: import the selected list, group it with the right tag/segment, choose the dedicated template and provider lane, then track replies, registrations and billing in one place.
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {blocks.map((block) => (
              <Card key={block.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <block.icon className="size-5 text-muted-foreground" />
                    {block.title}
                  </CardTitle>
                  <CardDescription>{block.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href={block.href}>{block.action}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleHelp className="size-5 text-muted-foreground" />
                What is a Registration?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              A registration is the operational record that connects one event, one main contact, one billing company, the participant count and the related invoice. It sits between the CRM contact record and the billing area.
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
