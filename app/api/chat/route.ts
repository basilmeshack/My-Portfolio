import { randomUUID } from "crypto"
import type OpenAI from "openai"
import { NextRequest, NextResponse } from "next/server"
import { getGroqClient } from "@/lib/groq"
import { getAssistantKnowledgeContext } from "@/lib/assistant-knowledge-service"
import { hasNeonDatabaseUrl } from "@/lib/neon"

export const runtime = "nodejs"
export const revalidate = 60

type ChatTurn = {
  role: "user" | "assistant"
  content: string
}

type SessionState = {
  updatedAt: number
  turns: ChatTurn[]
}

const SESSION_COOKIE = "portfolio_chat_session"
const SESSION_TTL_MS = 30 * 60 * 1000
const SESSION_MAX_TURNS = 20
const sessionStore = new Map<string, SessionState>()

const FALLBACK_OWNER_CONTEXT = [
  "Owner Name: Meshack Bwire",
  "Summary: Software Engineer specializing in POS systems, backend services, and mobile applications.",
  "Location: Nairobi, Kenya",
  "Email: bmwandera14@gmail.com",
  "Phone: +254 794 142 204",
  "LinkedIn: https://www.linkedin.com/in/meshack-bwire-b2390a213/",
  "GitHub: https://github.com/bm-ghost",
  "Contact Channels: Primary Email: mailto:bmwandera14@gmail.com | Primary Phone: tel:+254794142204 | LinkedIn: https://www.linkedin.com/in/meshack-bwire-b2390a213/ | GitHub: https://github.com/bm-ghost",
  "Portfolio sections (counts): N/A",
  "Projects:",
  "1. Portfolio Website | Personal portfolio built with Next.js and Tailwind CSS. | tools: Next.js, React, TypeScript, Tailwind CSS | tags: portfolio, web | demo: N/A",
].join("\n")

function cleanupExpiredSessions() {
  const now = Date.now()
  for (const [key, state] of sessionStore.entries()) {
    if (now - state.updatedAt > SESSION_TTL_MS) {
      sessionStore.delete(key)
    }
  }
}

function getSessionId(request: NextRequest): string {
  return request.cookies.get(SESSION_COOKIE)?.value || randomUUID()
}

function getSessionTurns(sessionId: string): ChatTurn[] {
  const state = sessionStore.get(sessionId)
  if (!state) {
    return []
  }

  if (Date.now() - state.updatedAt > SESSION_TTL_MS) {
    sessionStore.delete(sessionId)
    return []
  }

  return state.turns
}

function dedupeTurns(turns: ChatTurn[]): ChatTurn[] {
  return turns.filter((turn, index) => {
    if (index === 0) {
      return true
    }

    const prev = turns[index - 1]
    return !(prev.role === turn.role && prev.content === turn.content)
  })
}

function setSessionTurns(sessionId: string, turns: ChatTurn[]) {
  cleanupExpiredSessions()
  const nextTurns = dedupeTurns(turns).slice(-SESSION_MAX_TURNS)
  sessionStore.set(sessionId, {
    updatedAt: Date.now(),
    turns: nextTurns,
  })
}

async function resolveOwnerContext(query: string): Promise<string> {
  if (!hasNeonDatabaseUrl()) {
    return FALLBACK_OWNER_CONTEXT
  }

  try {
    const ownerContext = await getAssistantKnowledgeContext(query)
    return ownerContext.trim() ? ownerContext : FALLBACK_OWNER_CONTEXT
  } catch (error) {
    console.error("Failed to load assistant context from Neon:", error)
    return FALLBACK_OWNER_CONTEXT
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate request
    if (!request.body) {
      return NextResponse.json({ error: "Request body is missing" }, { status: 400 })
    }

    const body = await request.json().catch(() => null)

    if (!body || !body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    const { messages } = body
    const validatedMessages = messages
      .filter((message: { role: string; content: string }) => {
        return (
          message &&
          typeof message.content === "string" &&
          message.content.trim().length > 0 &&
          (message.role === "user" || message.role === "assistant")
        )
      })
      .slice(-14)

    if (validatedMessages.length === 0) {
      return NextResponse.json({ error: "No valid messages provided" }, { status: 400 })
    }

    const sessionId = getSessionId(request)
    const sessionTurns = getSessionTurns(sessionId)
    const mergedTurns = dedupeTurns([
      ...sessionTurns,
      ...validatedMessages.map((message: { role: string; content: string }) => ({
        role: message.role,
        content: message.content,
      })),
    ]).slice(-SESSION_MAX_TURNS)

    try {
      const latestUserMessage = [...mergedTurns].reverse().find((turn) => turn.role === "user")?.content || ""
      const ownerContext = await resolveOwnerContext(latestUserMessage)
      const groq = getGroqClient()

      const conversation: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `You are the portfolio assistant for the owner. Answer like the owner would, in first person when relevant, with a confident and professional tone.
Rules:
- Be concise, warm, and specific.
- Use first-person voice for portfolio statements (for example: "my projects", "my experience", "my work"), not third-person phrasing like "Meshack's work".
- Use the retrieved database knowledge below as the primary source of truth for anything about Bwire, Meshack, the portfolio, projects, partners, skills, contact details, education, or work history.
- Never invent years, counts, links, employers, or placeholder values.
- If the question is about Bwire or professional topics and the database context does not support the answer, say you do not have that detail yet.
- If the question is outside Bwire's professional scope, you may answer briefly as a general assistant, but do not mix in invented portfolio facts.
- If the user asks about unavailable details, say what is known and invite contact.
- For project questions, mention the most relevant project names and tools.
- For contact questions, present channels as a polished mini contact card with one item per line and explicit links.
- Make links directly clickable by returning full URL schemes such as https://, mailto:, and tel:.
- For contact questions, avoid bland phrasing like "You can reach me through various channels"; use a confident, polished intro and a clean list layout.
- For contact questions, do not use markdown styling characters like ** or __; return clean plain-text labels and links.
- Start contact responses with: "Here is the best way to reach me:".

Owner Context:
${ownerContext}`,
        },
        ...mergedTurns,
      ]

      const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: conversation,
        max_tokens: 450,
        temperature: 0.3,
      })

      const assistantMessage = completion.choices[0].message.content || "I'm not sure how to respond to that."

      setSessionTurns(sessionId, [...mergedTurns, { role: "assistant", content: assistantMessage }])

      const response = NextResponse.json({ message: assistantMessage, sessionId })
      response.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: Math.floor(SESSION_TTL_MS / 1000),
      })

      return response
    } catch (groqError: any) {
      console.error("GROQ API Error:", groqError)

      return NextResponse.json(
        {
          error: "Error communicating with AI service",
          details: groqError.message,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Unhandled error in chat API:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
