"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

const webhookEndpoints = [
  {
    id: "wh-provider-events",
    url: "https://crm.etapahub.com/api/webhooks/provider-events",
    provider: "Resend + Mailgun",
    status: "healthy",
    lastEvent: "2 minutes ago",
    events: ["delivered", "bounced", "complained", "unsubscribed"],
  },
  {
    id: "wh-kumo-sync",
    url: "https://crm.etapahub.com/api/webhooks/kumo-sync",
    provider: "KumoMTA",
    status: "warming",
    lastEvent: "18 minutes ago",
    events: ["delivered", "bounced"],
  },
]

function badgeClass(status: string) {
  switch (status) {
    case "healthy":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
    default:
      return "border-amber-400/20 bg-amber-500/10 text-amber-200"
  }
}

export default function WebhooksPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Webhooks</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button className="rounded-xl bg-white text-black hover:bg-white/90">
            <Plus className="size-4" />
            Add endpoint
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[#050505] px-6 py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-semibold tracking-tight">Webhooks</h1>
            <p className="max-w-3xl text-sm text-white/55">
              Provider event endpoints used to update bounced, unsubscribed and complained statuses inside the CRM.
            </p>
          </div>

          <div className="grid gap-4">
            {webhookEndpoints.map((endpoint) => (
              <Card key={endpoint.id} className="border-white/10 bg-[#111214] text-white shadow-none">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{endpoint.provider}</CardTitle>
                    <p className="text-sm text-white/55">{endpoint.url}</p>
                  </div>
                  <Badge variant="outline" className={badgeClass(endpoint.status)}>
                    {endpoint.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">Last event</p>
                      <p className="mt-2 text-lg font-medium">{endpoint.lastEvent}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">Tracked events</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {endpoint.events.map((eventName) => (
                          <Badge key={eventName} variant="outline" className="border-white/10 bg-white/[0.03] text-white/75">
                            {eventName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
