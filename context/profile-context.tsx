"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Profile {
  id: string
  created: string
  updated: string
  full_name: string
  location: string
  phone: string
  email: string
  linkedin_url: string
  github_url?: string
  summary: string
  image?: string
  tags?: string[]
  contact_channels?: Array<{
    id: string
    channel_type: string
    label: string
    handle: string
    value: string
    url: string
    is_public: boolean
    is_primary: boolean
    display_order: number
  }>
}

interface ProfileContextType {
  profile: Profile | null
  isLoading: boolean
  error: string | null
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  isLoading: true,
  error: null,
})

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchProfile() {
      try {
        setIsLoading(true)

        const response = await fetch("/api/profile", { cache: "force-cache" })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (isMounted && data?.profile) {
          setProfile(data.profile as Profile)
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        if (isMounted) {
          setError("Failed to load profile data")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      isMounted = false
    }
  }, [])

  return <ProfileContext.Provider value={{ profile, isLoading, error }}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  return useContext(ProfileContext)
}
