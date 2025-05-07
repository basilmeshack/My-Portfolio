import { NextResponse } from "next/server"
import { getOpenAIClient } from "@/lib/openai"

// Context about Meshack Bwire to help the AI answer questions
const PERSONAL_CONTEXT = `
About Meshack Bwire:
- Meshack Bwire is a Software Engineer specializing in POS (Point of Sale) systems and mobile applications.
- He currently works at Tracom Services Limited as a Software Engineer.
- He has extensive experience in Android development for mobile and POS applications.
- He has developed payment applications for banks like Awash Bank (Ethiopia) and Bunna Bank.
- He has worked on SDKs for CRDB Bank of Tanzania on Nexgo and Telpo POS devices.
- He has implemented Terminal Management System (TMS) functionalities across POS devices.
- He has developed applications for cashless fuel transactions.
- He has experience with Java, Python, Go, C#, JavaScript, SQL, and .NET.
- He is proficient in frameworks like Spring Boot, Flutter, and Angular.
- He has experience with cloud environments like AWS, GCP, and Microsoft Azure.
- He has knowledge of API integration (REST, GraphQL, SOAP).
- He has a Bachelor of Science in Computer Science from The Co-operative University of Kenya (2018-2022).
- He previously worked as a Telecommunications Engineer at Guzzer Technologies.
- He also worked as a Data Engineer (Internship) at African Economic Research Consortium (AERC).
- He is based in Nairobi, Kenya.
- His email is bmwandera14@gmail.com.
- His LinkedIn profile is at linkedin.com/in/meshack-bwire-b2390a213.
- His GitHub profile is at github.com/bm-ghost.

Website Navigation:
- Home page: The main landing page with a hero section and professional network.
- About page: Information about Meshack's background, skills, and interests.
- Experience page: Details about Meshack's work experience, skills, and professional credentials.
- Projects page: Showcase of Meshack's projects, both company and personal.
- Contact page: Contact information and a form to get in touch with Meshack.
- Resume page: Meshack's professional resume with download options.
`

export async function POST(request: Request) {
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

    try {
      // Initialize OpenAI client
      const openai = getOpenAIClient()

      // Create a conversation with system context and user messages
      const conversation = [
        {
          role: "system",
          content: `You are Bwire AI Assistant, a helpful AI assistant for Meshack Bwire's portfolio website. 
          You help visitors learn about Meshack, his skills, experience, and projects. 
          You also help them navigate the website and find information.
          Be friendly, professional, and concise in your responses.
          Here is information about Meshack and the website structure:
          ${PERSONAL_CONTEXT}`,
        },
        ...messages.map((message: { role: string; content: string }) => ({
          role: message.role,
          content: message.content,
        })),
      ]

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Using a more widely available model
        messages: conversation,
        max_tokens: 500,
        temperature: 0.7,
      })

      // Extract the assistant's response
      const assistantMessage = completion.choices[0].message.content

      return NextResponse.json({ message: assistantMessage || "I'm not sure how to respond to that." })
    } catch (openaiError: any) {
      console.error("OpenAI API Error:", openaiError)

      // Return a more specific error message
      return NextResponse.json(
        {
          error: "Error communicating with AI service",
          details: openaiError.message,
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
