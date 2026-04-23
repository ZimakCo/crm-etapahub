"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function useOutreachRouteState() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const setParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }

      const queryString = params.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return {
    pathname,
    searchParams,
    setParams,
  }
}
