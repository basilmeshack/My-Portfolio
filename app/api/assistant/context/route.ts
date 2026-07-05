import { NextResponse } from "next/server"
import { getOwnerAssistantContextFromNeon } from "@/lib/portfolio-repository"
import { hasNeonDatabaseUrl } from "@/lib/neon"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 120

export async function GET() {
  try {
    if (!hasNeonDatabaseUrl()) {
      return NextResponse.json(
        {
          context: {
            ownerName: "Portfolio Owner",
            summary: "",
            location: "",
            email: "",
            phone: "",
            linkedin: "",
            projects: [],
            portfolioByField: {},
          },
          generatedAt: new Date().toISOString(),
          fallback: true,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          },
        },
      )
    }

    const context = await getOwnerAssistantContextFromNeon()

    return NextResponse.json(
      {
        context,
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      },
    )
  } catch (error: any) {
    console.error("Error loading assistant context:", error)
    return NextResponse.json(
      {
        error: "Failed to load assistant context",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
