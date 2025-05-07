import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import NeuralBackground from "@/components/neural-background"
import AIAssistant from "@/components/ai-assistant"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Meshack Bwire | Software Engineer",
  description:
    "Professional portfolio of Meshack Bwire, Software Engineer specializing in POS systems and mobile applications",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} text-gray-100`}>
        <NeuralBackground />
        <Header />
        {children}
        <Footer />
        <AIAssistant />
      </body>
    </html>
  )
}
