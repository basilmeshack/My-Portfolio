import { NextRequest, NextResponse } from "next/server"
import { refreshAssistantKnowledge } from "@/lib/assistant-knowledge-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RefreshAssistantBody = {
  secret?: string
  syncEmbeddings?: boolean
  limitEmbeddings?: number
}

export async function POST(request: NextRequest) {
  try {
    const body = ((await request.json().catch(() => ({}))) || {}) as RefreshAssistantBody
    const configuredSecret = process.env.ASSISTANT_REFRESH_SECRET || process.env.REVALIDATE_SECRET || ""
    const providedSecret =
      body.secret || request.headers.get("x-assistant-refresh-secret") || request.nextUrl.searchParams.get("secret") || ""

    if (!configuredSecret || configuredSecret !== providedSecret) {
      return NextResponse.json({ error: "Unauthorized assistant refresh request" }, { status: 401 })
    }

    const result = await refreshAssistantKnowledge({
      syncEmbeddings: body.syncEmbeddings,
      limitEmbeddings: body.limitEmbeddings,
    })

    return NextResponse.json({
      ok: true,
      ...result,
      at: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error refreshing assistant knowledge:", error)
    return NextResponse.json(
      {
        error: "Failed to refresh assistant knowledge",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}