"use client"

import Link from "next/link"
import { CircleHelp, FileText, Filter, Mail, MessagesSquare } from "lucide-react"
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
      title: "Campaigns",
      description: "Create the parent initiative first: objective, owner, linked event and default template.",
      href: "/campaigns",
      icon: Mail,
      action: "Open Campaigns",
    },
    {
      title: "Segments",
      description: "Use segments as the seller-managed audience slices that broadcasts will target directly.",
      href: "/segments",
      icon: Filter,
      action: "Open Segments",
    },
    {
      title: "Templates",
      description: "Templates stay in the CRM and are reused across campaigns and broadcast waves.",
      href: "/templates",
      icon: FileText,
      action: "Open Templates",
    },
    {
      title: "Broadcasts",
      description: "Broadcasts are the real sends: one parent campaign, one segment, one sender identity and one template snapshot.",
      href: "/broadcasts",
      icon: Mail,
      action: "Open Broadcasts",
    },
    {
      title: "Outreach",
      description: "Mailbox-connected 1:1 outreach workspace for threads, reply sync, follow-up tasks and automatic sequences.",
      href: "/outreach",
      icon: MessagesSquare,
      action: "Open Outreach",
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
              Core logic: sales builds the right segment in the database, operations plans the parent campaign, then creates one or more broadcasts with the correct sender identity. Suppressions stay global across all providers.
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessagesSquare className="size-5 text-muted-foreground" />
                How do we mark a contact as in communication?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Use three fields together: owner for the EtapaHub staff member, outreach status for the commercial stage, and last reply for proof of an active thread. The new Outreach page shows that logic in a client-friendly way.
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
