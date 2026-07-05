import { NextRequest, NextResponse } from "next/server"
import { getProjectsFromNeon } from "@/lib/portfolio-repository"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 180

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search") || undefined
    const profileId = request.nextUrl.searchParams.get("profileId") || undefined
    const projects = await getProjectsFromNeon(search, profileId)

    return NextResponse.json(
      { projects },
      {
        headers: {
          "Cache-Control": "public, s-maxage=180, stale-while-revalidate=360",
        },
      },
    )
  } catch (error: any) {
    console.error("Failed to fetch projects from Neon:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
