import { NextRequest, NextResponse } from "next/server"
import {
  authenticateProfileEditor,
  clearProfileEditorSession,
  getEditableCmsData,
  isProfileEditorAuthenticated,
  updateEditableCmsData,
  type EditableCmsData,
} from "@/lib/profile-editor-service"
import { getPortfolioContentVersion } from "@/lib/portfolio-repository"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const authenticated = await isProfileEditorAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const data = await getEditableCmsData()
  return NextResponse.json({ authenticated: true, data })
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { password?: string; logout?: boolean }

  if (body.logout) {
    await clearProfileEditorSession()
    return NextResponse.json({ ok: true, authenticated: false })
  }

  const password = body.password?.trim() || ""
  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 })
  }

  const authenticated = await authenticateProfileEditor(password)
  if (!authenticated) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  const data = await getEditableCmsData()
  return NextResponse.json({ ok: true, authenticated: true, data })
}

export async function PUT(request: NextRequest) {
  const authenticated = await isProfileEditorAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as EditableCmsData & { newPassword?: string } | null

  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  await updateEditableCmsData(body)
  const data = await getEditableCmsData()
  const contentVersion = await getPortfolioContentVersion()
  return NextResponse.json(
    { ok: true, data, contentVersion },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  )
}
