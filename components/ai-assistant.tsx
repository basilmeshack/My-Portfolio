"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Loader2, Sparkles, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface Message {
  role: "user" | "assistant"
  content: string
}

// Suggested questions for users to click on
const suggestedQuestions = [
  "What projects have you worked on?",
  "Tell me about your experience",
  "What skills do you have?",
  "How can I contact you?",
  "What's your background?",
]

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm Bwire AI Assistant. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Show intro bubble after a delay when the page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Hide intro bubble when chat is opened
  useEffect(() => {
    if (isOpen) {
      setShowIntro(false)
    }
  }, [isOpen])

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message to chat
    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Check for navigation commands
      const navigationCheck = checkForNavigation(input)
      if (navigationCheck) {
        setMessages((prev) => [...prev, { role: "assistant", content: navigationCheck.message }])

        // Wait a moment before navigating
        setTimeout(() => {
          router.push(navigationCheck.path)
        }, 1000)

        setIsLoading(false)
        return
      }

      try {
        // Send message to API with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages.filter((msg) => msg.role === "user"), userMessage],
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("API Error Response:", errorData)
          throw new Error(errorData.error || `API responded with status: ${response.status}`)
        }

        const data = await response.json()

        // Add assistant response to chat
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }])
      } catch (apiError) {
        console.error("API Error:", apiError)

        // Fallback to local response for common questions
        const fallbackResponse = getFallbackResponse(input)
        setMessages((prev) => [...prev, { role: "assistant", content: fallbackResponse }])
      }
    } catch (error) {
      console.error("Error in message handling:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting to my knowledge base right now. I can still help with basic questions or website navigation.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Add a fallback response function to handle common questions when the API is unavailable
  const getFallbackResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase()

    if (lowerQuestion.includes("project") || lowerQuestion.includes("work")) {
      return "Meshack has worked on various projects including payment applications for banks like Awash Bank and Bunna Bank, as well as SDKs for CRDB Bank. You can see more details on the Projects page."
    }

    if (lowerQuestion.includes("experience") || lowerQuestion.includes("background")) {
      return "Meshack is a Software Engineer specializing in POS systems and mobile applications. He currently works at Tracom Services Limited and has experience with Java, Python, Go, C#, JavaScript, SQL, and .NET."
    }

    if (lowerQuestion.includes("contact") || lowerQuestion.includes("email") || lowerQuestion.includes("reach")) {
      return "You can contact Meshack via email at bmwandera14@gmail.com or through the contact form on the Contact page."
    }

    if (lowerQuestion.includes("skill") || lowerQuestion.includes("technology")) {
      return "Meshack is proficient in Java, Python, Go, C#, JavaScript, SQL, and .NET. He also has experience with frameworks like Spring Boot, Flutter, and Angular, and cloud environments like AWS, GCP, and Microsoft Azure."
    }

    if (lowerQuestion.includes("education") || lowerQuestion.includes("study") || lowerQuestion.includes("degree")) {
      return "Meshack has a Bachelor of Science in Computer Science from The Co-operative University of Kenya (2018-2022). He also studied Data Science with Python at the National Research Fund - Kenya."
    }

    if (lowerQuestion.includes("location") || lowerQuestion.includes("where") || lowerQuestion.includes("based")) {
      return "Meshack is based in Nairobi, Kenya."
    }

    return "I'm currently having trouble accessing my full knowledge base. Please try asking a different question, or you can navigate through the website to find the information you need."
  }

  const checkForNavigation = (message: string): { path: string; message: string } | null => {
    const lowerMessage = message.toLowerCase()

    // Navigation patterns
    if (lowerMessage.includes("home") || lowerMessage.includes("main page")) {
      return {
        path: "/",
        message: "I'll take you to the home page right away!",
      }
    }

    if (lowerMessage.includes("about") || lowerMessage.includes("about you")) {
      return {
        path: "/about",
        message: "Let me show you the about page where you can learn more about Meshack.",
      }
    }

    if (lowerMessage.includes("project") || lowerMessage.includes("portfolio")) {
      return {
        path: "/projects",
        message: "I'll direct you to the projects page to see Meshack's work.",
      }
    }

    if (lowerMessage.includes("contact") || lowerMessage.includes("get in touch")) {
      return {
        path: "/contact",
        message: "I'll take you to the contact page where you can reach out to Meshack.",
      }
    }

    if (lowerMessage.includes("resume") || lowerMessage.includes("cv")) {
      return {
        path: "/resume",
        message: "Here's Meshack's resume with his professional experience.",
      }
    }

    if (lowerMessage.includes("experience") || lowerMessage.includes("work history")) {
      return {
        path: "/experience",
        message: "Let me show you Meshack's professional experience.",
      }
    }

    return null
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <>
      {/* Intro bubble */}
      <AnimatePresence>
        {showIntro && !isOpen && (
          <motion.div
            className="fixed bottom-20 right-6 bg-gradient-to-r from-purple-600 to-violet-500 text-white p-4 rounded-lg rounded-br-none shadow-lg z-50 max-w-[220px]"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-2">
              <div className="mt-1">
                <motion.div
                  animate={{ rotate: [0, 20, 0, 20, 0] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
                >
                  👋
                </motion.div>
              </div>
              <div>
                <p className="font-medium">Hi! I'm Bwire AI. Want to chat?</p>
                <button
                  onClick={() => setIsOpen(true)}
                  className="mt-2 text-sm bg-white text-purple-600 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors flex items-center"
                >
                  Let's talk <ChevronRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-gradient-to-r from-purple-600 to-violet-500 transform translate-y-1/2 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat toggle button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-violet-500 text-white flex items-center justify-center shadow-lg z-50 hover:bg-purple-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <motion.div
            animate={{
              y: [0, -3, 0],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 3,
            }}
          >
            <MessageSquare size={24} />
          </motion.div>
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-40 flex flex-col overflow-hidden border border-purple-200 dark:border-purple-900"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "60px" : "500px",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Chat header */}
            <div
              className="bg-gradient-to-r from-purple-600 to-violet-500 p-4 text-white font-medium flex items-center justify-between cursor-pointer"
              onClick={toggleMinimize}
            >
              <div className="flex items-center">
                <div className="bg-white/20 p-1.5 rounded-full mr-2">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span>Bwire AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleMinimize} className="text-white/80 hover:text-white">
                  {isMinimized ? (
                    <motion.div initial={{ rotate: 180 }} animate={{ rotate: 0 }} transition={{ duration: 0.3 }}>
                      <ChevronRight size={20} />
                    </motion.div>
                  ) : (
                    <motion.div initial={{ rotate: 0 }} animate={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                      <ChevronRight size={20} />
                    </motion.div>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(false)
                  }}
                  className="text-white/80 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat content - only shown when not minimized */}
            {!isMinimized && (
              <>
                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-zinc-800">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      {message.role === "assistant" && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-violet-500 flex items-center justify-center mr-2 flex-shrink-0">
                          <Sparkles size={14} className="text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-purple-600 to-violet-500 text-white"
                            : "bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200 shadow-sm"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-violet-500 flex items-center justify-center mr-2 flex-shrink-0">
                        <Sparkles size={14} className="text-white" />
                      </div>
                      <div className="bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-2xl p-3 flex items-center shadow-sm">
                        <div className="flex space-x-1">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.1 }}
                            className="h-2 w-2 bg-purple-600 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.2 }}
                            className="h-2 w-2 bg-purple-600 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.3 }}
                            className="h-2 w-2 bg-purple-600 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested questions */}
                {messages.length <= 2 && (
                  <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-t border-gray-100 dark:border-zinc-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setInput(question)
                            handleSendMessage()
                          }}
                          className="text-xs bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat input */}
                <div className="p-3 border-t border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-full pl-4 pr-1 py-1">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-transparent text-gray-800 dark:text-white border-0 focus:outline-none text-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !input.trim()}
                      className="bg-gradient-to-r from-purple-600 to-violet-500 text-white p-2 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
