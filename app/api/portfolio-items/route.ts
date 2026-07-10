import { NextRequest, NextResponse } from "next/server"
import { getPortfolioItemsFromNeon } from "@/lib/portfolio-repository"
import { hasNeonDatabaseUrl } from "@/lib/neon"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    if (!hasNeonDatabaseUrl()) {
      return NextResponse.json(
        { items: [], fallback: true },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
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
          "Cache-Control": "no-store, max-age=0",
        },
      },
    )
  } catch (error: any) {
    console.error("Failed to fetch portfolio items from Neon:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio items" }, { status: 500 })
  }
}
