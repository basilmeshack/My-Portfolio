import { NextRequest, NextResponse } from "next/server"
import {
  authenticateProfileEditor,
  clearProfileEditorSession,
  getEditableCmsData,
  isProfileEditorAuthenticated,
  updateEditableCmsData,
} from "@/lib/profile-editor-service"

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

  const body = (await request.json().catch(() => null)) as
    | ({
        profile: {
          fullName: string
          location: string
          summary: string
          professionalBlurb: string
          aboutIntro: string
          aboutCurrentRole: string
          aboutHighlights: string[]
          aboutPreviousRole: string
          interests: string[]
          quote: string
          quoteAuthor: string
          contactChannels: Array<{
            channelType: "email" | "phone" | "linkedin" | "github" | "meeting"
            label: string
            handle: string
            value: string
            url: string
            displayOrder: number
          }>
        }
        projects: Array<{
          id: number | null
          clientKey: string
          title: string
          description: string
          link: string
          github: string
          demo: string
          imageUrl: string
          tools: string[]
          tags: string[]
        }>
        portfolioItems: Array<{
          id: number | null
          clientKey: string
          projectClientKey: string | null
          fieldType: string
          category: string
          name: string
          description: string
          url: string
          demoLink: string
          imageUrl: string
          isCompanyProject: boolean
          comingSoon: boolean
          tags: string[]
        }>
        experiences: Array<{
          id: number | null
          roleTitle: string
          organization: string
          periodLabel: string
          responsibilitiesHtml: string
          achievementsHtml: string
          displayOrder: number
        }>
        newPassword?: string
      })
    | null

  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  await updateEditableCmsData(body)
  const data = await getEditableCmsData()
  return NextResponse.json({ ok: true, data })
}
