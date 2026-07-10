import { NextResponse } from "next/server"
import { getPortfolioContentVersion } from "@/lib/portfolio-repository"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

// This is intentionally tiny and uncached. Open portfolio pages poll it to
// learn that an Edit Bwire save happened in any browser or app instance.
export async function GET() {
  const version = await getPortfolioContentVersion()

  return NextResponse.json(
    { version },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  )
}
