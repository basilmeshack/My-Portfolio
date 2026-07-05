import { NextResponse } from "next/server"
import { getProfileFromNeon } from "@/lib/portfolio-repository"

export const runtime = "nodejs"
export const revalidate = 300

export async function GET() {
  try {
    const profile = await getProfileFromNeon()
    const normalizedProfile = profile
      ? {
          ...profile,
          name: profile.full_name,
          description: profile.summary,
        }
      : null

    return NextResponse.json(
      { profile: normalizedProfile },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    )
  } catch (error: any) {
    console.error("Failed to fetch profile from Neon:", error)
    return NextResponse.json({ error: "Failed to fetch profile data" }, { status: 500 })
  }
}
