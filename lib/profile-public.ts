import "server-only"

import { getPublicProfileAboutData } from "@/lib/profile-editor-service"

export async function getPublicProfilePresentation() {
  const data = await getPublicProfileAboutData()
  if (!data) {
    return null
  }

  return data
}
