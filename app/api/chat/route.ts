import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { getGroqClient } from "@/lib/groq"
import { getOwnerAssistantPromptFromNeon } from "@/lib/portfolio-repository"

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
      const ownerContext = await getOwnerAssistantPromptFromNeon()
      const groq = getGroqClient()

      const conversation = [
        {
          role: "system",
          content: `You are the portfolio assistant for the owner. Answer like the owner would, in first person when relevant, with a confident and professional tone.
Rules:
- Be concise, warm, and specific.
- Prefer facts from the owner context below.
- If the user asks about unavailable details, say what is known and invite contact.
- For project questions, mention the most relevant project names and tools.
- For contact questions, provide the available contact channels from context.

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
