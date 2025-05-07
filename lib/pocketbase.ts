import PocketBase from "pocketbase"

// Initialize PocketBase
export const pb = new PocketBase("https://remain-faceghost.pockethost.io")

// Profile types
export interface Profile {
  id: string
  collectionId: string
  collectionName: string
  created: string
  updated: string
  full_name: string
  location: string
  phone: string
  email: string
  linkedin_url: string
  summary: string
}

// We'll use the context for data fetching instead of these functions
// Keeping them for reference or direct use if needed
export async function getProfile() {
  try {
    const timestamp = new Date().getTime()
    const records = await pb.collection("profile").getFullList({
      sort: "-created",
      requestKey: `profile-direct-${timestamp}`, // Add a unique request key
    })

    return records.length > 0 ? (records[0] as Profile) : null
  } catch (error) {
    console.error("Error fetching profile:", error)
    return null
  }
}

export async function getAllProfiles() {
  try {
    const timestamp = new Date().getTime()
    const records = await pb.collection("profile").getFullList({
      sort: "-created",
      requestKey: `profiles-all-${timestamp}`, // Add a unique request key
    })

    return records as Profile[]
  } catch (error) {
    console.error("Error fetching profiles:", error)
    return []
  }
}
