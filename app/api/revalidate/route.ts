import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { invalidatePortfolioCache } from "@/lib/portfolio-repository"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RevalidateRequestBody = {
  paths?: string[]
  tags?: string[]
  keyPrefix?: string
  secret?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = ((await request.json().catch(() => ({}))) || {}) as RevalidateRequestBody

    const configuredSecret = process.env.REVALIDATE_SECRET
    const providedSecret =
      body.secret || request.headers.get("x-revalidate-secret") || request.nextUrl.searchParams.get("secret") || ""

    if (!configuredSecret || providedSecret !== configuredSecret) {
      return NextResponse.json({ error: "Unauthorized revalidation request" }, { status: 401 })
    }

    const defaultPaths = ["/", "/projects", "/about", "/experience", "/contact", "/certifications", "/resume"]
    const defaultTags = ["profile", "projects", "portfolio-items", "assistant-context"]

    const paths = (Array.isArray(body.paths) && body.paths.length > 0 ? body.paths : defaultPaths).filter(Boolean)
    const tags = (Array.isArray(body.tags) && body.tags.length > 0 ? body.tags : defaultTags).filter(Boolean)

    for (const path of paths) {
      revalidatePath(path)
    }

    for (const tag of tags) {
      revalidateTag(tag)
    }

    invalidatePortfolioCache(body.keyPrefix)

    return NextResponse.json({
      ok: true,
      revalidatedPaths: paths,
      revalidatedTags: tags,
      cacheFlushed: body.keyPrefix || "all",
      at: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error during revalidation:", error)
    return NextResponse.json(
      {
        error: "Failed to revalidate",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
