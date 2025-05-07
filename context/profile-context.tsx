"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { pb, type Profile } from "@/lib/pocketbase"

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

        // Use a unique filter to prevent auto-cancellation
        const timestamp = new Date().getTime()
        const records = await pb.collection("profile").getFullList({
          sort: "-created",
          requestKey: `profile-${timestamp}`, // Add a unique request key
        })

        if (isMounted && records.length > 0) {
          setProfile(records[0] as Profile)
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
      // Cancel any pending requests when component unmounts
      pb.cancelAllRequests()
    }
  }, [])

  return <ProfileContext.Provider value={{ profile, isLoading, error }}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  return useContext(ProfileContext)
}
