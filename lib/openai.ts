import OpenAI from "openai"

// This file should only be imported in server components or API routes
export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not defined in environment variables")
  }

  return new OpenAI({
    apiKey,
  })
}
