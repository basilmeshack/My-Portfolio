"use client"

import { useQuery } from "@tanstack/react-query"

export interface ClientProfile {
  id: string
  name: string
  description: string
  image?: string
  tags?: string[]
}

export interface PortfolioItem {
  id: string
  name: string
  logo: string
  url: string
  category: string
  field: string
  description?: string
  tags?: string[]
  demoLink?: string
  isCompanyProject?: boolean
  comingSoon?: boolean
}

export function useProfileQuery() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<ClientProfile | null> => {
      const response = await fetch("/api/profile", { cache: "force-cache" })
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const data = await response.json()
      return data?.profile ?? null
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function usePortfolioItemsQuery(fieldType: string) {
  return useQuery({
    queryKey: ["portfolio-items", fieldType],
    queryFn: async (): Promise<PortfolioItem[]> => {
      const response = await fetch(`/api/portfolio-items?field=${encodeURIComponent(fieldType)}`, {
        cache: "force-cache",
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()
      return (data?.items || []) as PortfolioItem[]
    },
    staleTime: 5 * 60 * 1000,
  })
}
