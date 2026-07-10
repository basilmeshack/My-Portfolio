import { NextRequest, NextResponse } from "next/server"
import { getProjectsFromNeon } from "@/lib/portfolio-repository"
import { hasNeonDatabaseUrl } from "@/lib/neon"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    if (!hasNeonDatabaseUrl()) {
      return NextResponse.json(
        { projects: [], fallback: true },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        },
      )
    }

    const search = request.nextUrl.searchParams.get("search") || undefined
    const profileId = request.nextUrl.searchParams.get("profileId") || undefined
    const projects = await getProjectsFromNeon(search, profileId)

    return NextResponse.json(
      { projects },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    )
  } catch (error: any) {
    console.error("Failed to fetch projects from Neon:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
