import { NextResponse } from "next/server"
import { getProfileFromNeon } from "@/lib/portfolio-repository"
import { hasNeonDatabaseUrl } from "@/lib/neon"

export const runtime = "nodejs"
export const revalidate = 300

export async function GET() {
  try {
    if (!hasNeonDatabaseUrl()) {
      return NextResponse.json(
        { profile: null, fallback: true },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          },
        },
      )
    }

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
