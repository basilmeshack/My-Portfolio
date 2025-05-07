"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import PocketBase from "pocketbase"
import Image from "next/image"

// Initialize PocketBase client
const pb = new PocketBase("https://remain-faceghost.pockethost.io")

// Type definition for profile data
interface Profile {
  id: string
  name: string
  description: string
  image?: string
  tags?: string[] // This will be used for the typing animation
}

// Fallback data in case the API request fails
const fallbackProfile: Profile = {
  id: "fallback",
  name: "Meshack Bwire",
  description:
    "A proactive and results-driven Software Engineer with extensive experience in POS systems, mobile applications, and API integrations.",
  tags: ["Software Engineer", "POS Systems Specialist", "API Integration Expert", "Mobile App Developer"],
}

export default function Hero() {
  const [text, setText] = useState("")
  const [index, setIndex] = useState(0)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [phrases, setPhrases] = useState<string[]>(fallbackProfile.tags || [])

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        // Fetch profile data from portfolio_images collection with field="profile"
        const records = await pb.collection("portfolio_images").getFullList({
          sort: "-created",
          filter: 'field = "profile"',
        })

        if (records && records.length > 0) {
          const profileData = records[0]

          // Parse tags if they exist
          let tags: string[] = []
          if (profileData.tags) {
            if (Array.isArray(profileData.tags)) {
              tags = profileData.tags
            } else if (typeof profileData.tags === "string") {
              try {
                tags = JSON.parse(profileData.tags)
              } catch (e) {
                tags = profileData.tags.split(",").map((tag: string) => tag.trim())
              }
            }
          }

          setProfile({
            id: profileData.id,
            name: profileData.name || fallbackProfile.name,
            description: profileData.description || fallbackProfile.description,
            image: profileData.image ? pb.files.getUrl(profileData, profileData.image) : undefined,
            tags: tags.length > 0 ? tags : fallbackProfile.tags,
          })

          // Set phrases for typing animation
          if (tags.length > 0) {
            setPhrases(tags)
          }
        } else {
          // Use fallback data if no profile is found
          setProfile(fallbackProfile)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        setProfile(fallbackProfile)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Typing animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % phrases.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [phrases])

  useEffect(() => {
    let i = 0
    const currentPhrase = phrases[index]
    const typingInterval = setInterval(() => {
      if (i <= currentPhrase.length) {
        setText(currentPhrase.substring(0, i))
        i++
      } else {
        clearInterval(typingInterval)
      }
    }, 100)

    return () => clearInterval(typingInterval)
  }, [index, phrases])

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </section>
    )
  }

  return (
    <section className="min-h-screen flex items-center justify-center py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Hi, I'm <span className="text-purple-400">{profile?.name || fallbackProfile.name}</span>
            </motion.h1>

            <motion.div
              className="text-2xl md:text-3xl font-medium mb-6 h-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span className="text-gray-300">I'm a </span>
              <span className="text-purple-400">{text}</span>
              <span className="animate-blink">|</span>
            </motion.div>

            <motion.p
              className="text-gray-300 text-lg mb-8 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {profile?.description || fallbackProfile.description}
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <Link
                href="/about"
                className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
              >
                Learn More <ArrowRight className="ml-2" size={18} />
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 border border-purple-600 text-purple-400 rounded-md hover:bg-purple-900/20 transition-colors"
              >
                Contact Me
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="md:w-1/2 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-purple-600">
              {profile?.image ? (
                <Image
                  src={profile.image || "/placeholder.svg"}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                  }}
                />
              ) : (
                <img
                  src="/placeholder.svg?height=400&width=400"
                  alt={profile?.name || "Profile"}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
