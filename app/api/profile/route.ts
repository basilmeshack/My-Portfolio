import { NextResponse } from "next/server"
import { getProfileFromNeon } from "@/lib/portfolio-repository"
import { hasNeonDatabaseUrl } from "@/lib/neon"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    if (!hasNeonDatabaseUrl()) {
      return NextResponse.json(
        { profile: null, fallback: true },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
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
          "Cache-Control": "no-store, max-age=0",
        },
      },
    )
  } catch (error: any) {
    console.error("Failed to fetch profile from Neon:", error)
    return NextResponse.json({ error: "Failed to fetch profile data" }, { status: 500 })
  }
}
