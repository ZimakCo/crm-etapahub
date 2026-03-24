"use client"

import Link from "next/link"
import { Cable, Globe, Mail, Users } from "lucide-react"
import {
  emailDomains,
  formatProviderLabel,
  getProviderBadgeClass,
  getProviderStatusBadgeClass,
  getSenderStatusBadgeClass,
  providerLanes,
  senderIdentities,
} from "@/lib/email-ops"
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

export default function SettingsPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto bg-[#050505] px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-semibold tracking-tight">Settings</h1>
            <p className="max-w-3xl text-sm text-white/55">
              Configure the infrastructure behind broadcasts: provider lanes, sender identities and verified domains.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-white/10 bg-[#09090a] text-white shadow-none">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-white/40">Provider lanes</p>
                <p className="mt-2 text-4xl font-semibold">{providerLanes.length}</p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-[#09090a] text-white shadow-none">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-white/40">Sender identities</p>
                <p className="mt-2 text-4xl font-semibold">{senderIdentities.length}</p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-[#09090a] text-white shadow-none">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-white/40">Domains</p>
                <p className="mt-2 text-4xl font-semibold">{emailDomains.length}</p>
              </CardContent>
            </Card>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Cable className="size-5 text-white/45" />
              <h2 className="text-2xl font-semibold">Provider Lanes</h2>
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              {providerLanes.map((lane) => (
                <Card key={lane.id} className="border-white/10 bg-[#111214] text-white shadow-none">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-xl">{lane.title}</CardTitle>
                      <Badge variant="outline" className={getProviderStatusBadgeClass(lane.status)}>
                        {lane.status}
                      </Badge>
                    </div>
                    <Badge variant="outline" className={getProviderBadgeClass(lane.provider)}>
                      {formatProviderLabel(lane.provider)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                        <p className="text-white/40">Active days</p>
                        <p className="mt-2 font-medium">{lane.activeDays}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                        <p className="text-white/40">Send window</p>
                        <p className="mt-2 font-medium">{lane.sendWindow}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                      <p className="text-white/40">Capacity</p>
                      <p className="mt-2 font-medium">{lane.dailyVolume}</p>
                      <p className="mt-2 text-white/50">{lane.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-white/45" />
              <h2 className="text-2xl font-semibold">Sender Identities</h2>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {senderIdentities.map((sender) => (
                <Card key={sender.id} className="border-white/10 bg-[#111214] text-white shadow-none">
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-lg font-medium">{sender.fromName}</p>
                        <p className="text-sm text-white/55">{sender.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={getProviderBadgeClass(sender.provider)}>
                          {formatProviderLabel(sender.provider)}
                        </Badge>
                        <Badge variant="outline" className={getSenderStatusBadgeClass(sender.status)}>
                          {sender.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                        <p className="text-white/40">Region</p>
                        <p className="mt-2 font-medium">{sender.region}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                        <p className="text-white/40">Volume band</p>
                        <p className="mt-2 font-medium">{sender.volumeBand}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-white/60">
                      {sender.purpose}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="size-5 text-white/45" />
              <h2 className="text-2xl font-semibold">Verified Domains</h2>
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              {emailDomains.map((domain) => (
                <Card key={domain.id} className="border-white/10 bg-[#111214] text-white shadow-none">
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-1">
                      <p className="text-lg font-medium">{domain.name}</p>
                      <p className="text-sm text-white/55">{domain.region}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getProviderBadgeClass(domain.provider)}>
                        {formatProviderLabel(domain.provider)}
                      </Badge>
                      <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-white/65">
                        {domain.tracking}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Button className="rounded-xl bg-white text-black hover:bg-white/90" asChild>
              <Link href="/campaigns/new">Create broadcast</Link>
            </Button>
            <Button variant="outline" className="rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]" asChild>
              <Link href="/domains">Open domains</Link>
            </Button>
            <Button variant="outline" className="rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]" asChild>
              <Link href="/templates">Open templates</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
