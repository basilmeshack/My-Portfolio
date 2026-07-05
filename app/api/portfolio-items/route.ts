import { NextRequest, NextResponse } from "next/server"
import { getPortfolioItemsFromNeon } from "@/lib/portfolio-repository"
import { hasNeonDatabaseUrl } from "@/lib/neon"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 300

export async function GET(request: NextRequest) {
  try {
    if (!hasNeonDatabaseUrl()) {
      return NextResponse.json(
        { items: [], fallback: true },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          },
        },
      )
    }

    const field = request.nextUrl.searchParams.get("field") || undefined
    const items = await getPortfolioItemsFromNeon(field)

    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    )
  } catch (error: any) {
    console.error("Failed to fetch portfolio items from Neon:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio items" }, { status: 500 })
  }
}
