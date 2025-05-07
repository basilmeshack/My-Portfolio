"use client"

import { useState } from "react"
import Image from "next/image"
import { m } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useInView } from "react-intersection-observer"
import { MapPin, Mail, Linkedin } from "lucide-react"
import { useProfile } from "@/context/profile-context"

// Mock data for timeline - would be fetched from PocketBase in production
const timelineData = [
  { id: 1, title: "POS Engineer", year: "2015-2018", description: "Built scalable point-of-sale systems" },
  {
    id: 2,
    title: "Data Enthusiast",
    year: "2018-2020",
    description: "Began exploring data analytics and visualization",
  },
  { id: 3, title: "ML Projects", year: "2020-2022", description: "Started implementing machine learning solutions" },
  {
    id: 4,
    title: "AI Aspirant",
    year: "2022-Present",
    description: "Focusing on AI/ML technologies and applications",
  },
]

export default function About() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const { profile, isLoading, error } = useProfile()
  const [timeline] = useState(timelineData)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="about" className="py-20 bg-zinc-900">
      <div className="container mx-auto px-4">
        <m.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <m.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-12 text-center">
            About <span className="text-violet-400">Me</span>
          </m.h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4 bg-red-100/10 rounded-md">{error}. Using fallback data.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <m.div variants={itemVariants} className="md:col-span-1 flex justify-center">
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-violet-500/30">
                  <Image src="/placeholder.svg?height=400&width=400" alt="Profile" fill className="object-cover" />
                </div>
              </m.div>

              <m.div variants={itemVariants} className="md:col-span-2">
                <p className="text-lg text-zinc-300 mb-8">{profile?.summary || "No summary available."}</p>

                {profile && (
                  <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.location && (
                      <div className="flex items-center">
                        <div className="bg-violet-500/20 p-2 rounded-full mr-3">
                          <MapPin className="h-4 w-4 text-violet-400" />
                        </div>
                        <span className="text-zinc-300">{profile.location}</span>
                      </div>
                    )}
                    {profile.email && (
                      <div className="flex items-center">
                        <div className="bg-violet-500/20 p-2 rounded-full mr-3">
                          <Mail className="h-4 w-4 text-violet-400" />
                        </div>
                        <span className="text-zinc-300">{profile.email}</span>
                      </div>
                    )}
                    {profile.linkedin_url && (
                      <div className="flex items-center">
                        <div className="bg-violet-500/20 p-2 rounded-full mr-3">
                          <Linkedin className="h-4 w-4 text-violet-400" />
                        </div>
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-300 hover:text-violet-400 transition-colors"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-4 text-violet-400">My Journey</h3>

                <div className="relative border-l-2 border-violet-500/50 pl-8 space-y-8">
                  {timeline.map((item) => (
                    <m.div key={item.id} variants={itemVariants} className="relative">
                      <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-violet-500"></div>
                      <Card className="bg-zinc-800 border-zinc-700">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-lg font-semibold text-violet-400">{item.title}</h4>
                            <Badge variant="outline" className="bg-zinc-700/50 text-zinc-300 border-zinc-600">
                              {item.year}
                            </Badge>
                          </div>
                          <p className="text-zinc-400">{item.description}</p>
                        </CardContent>
                      </Card>
                    </m.div>
                  ))}
                </div>
              </m.div>
            </div>
          )}
        </m.div>
      </div>
    </section>
  )
}
