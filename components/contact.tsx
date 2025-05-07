"use client"

import type React from "react"

import { useState } from "react"
import { m } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useInView } from "react-intersection-observer"
import { Mail, Phone, MapPin, Calendar, Send } from "lucide-react"
import { useProfile } from "@/context/profile-context"

// Default data for calendly URL
const calendlyUrl = "https://calendly.com"

export default function Contact() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const { profile, isLoading } = useProfile()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would send the form data to a server or email service
    console.log("Form submitted:", formData)
    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    })
    // Show success message
    alert("Message sent successfully!")
  }

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
    <section id="contact" className="py-20 bg-zinc-900">
      <div className="container mx-auto px-4">
        <m.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <m.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Get in <span className="text-violet-400">Touch</span>
          </m.h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <m.div variants={itemVariants}>
              <Card className="bg-zinc-800 border-zinc-700 h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-violet-400">Contact Information</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Feel free to reach out through any of these channels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start">
                        <div className="bg-violet-500/20 p-3 rounded-full mr-4">
                          <Mail className="h-6 w-6 text-violet-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-zinc-300 mb-1">Email</h3>
                          <p className="text-zinc-400">{profile?.email || "email@example.com"}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-violet-500/20 p-3 rounded-full mr-4">
                          <Phone className="h-6 w-6 text-violet-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-zinc-300 mb-1">Phone</h3>
                          <p className="text-zinc-400">{profile?.phone || "Not available"}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-violet-500/20 p-3 rounded-full mr-4">
                          <MapPin className="h-6 w-6 text-violet-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-zinc-300 mb-1">Location</h3>
                          <p className="text-zinc-400">{profile?.location || "Not available"}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-violet-500/20 p-3 rounded-full mr-4">
                          <Calendar className="h-6 w-6 text-violet-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-zinc-300 mb-1">Schedule a Meeting</h3>
                          <p className="text-zinc-400 mb-2">Book a time slot on my calendar</p>
                          <Button
                            className="bg-violet-600 hover:bg-violet-700"
                            onClick={() => window.open(calendlyUrl, "_blank")}
                          >
                            Schedule Meeting
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </m.div>

            <m.div variants={itemVariants}>
              <Card className="bg-zinc-800 border-zinc-700 h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-violet-400">Send a Message</CardTitle>
                  <CardDescription className="text-zinc-400">I'll get back to you as soon as possible</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-zinc-300">
                          Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          required
                          className="bg-zinc-700 border-zinc-600 text-zinc-200 focus:ring-violet-500 focus:border-violet-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                          Email
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Your email"
                          required
                          className="bg-zinc-700 border-zinc-600 text-zinc-200 focus:ring-violet-500 focus:border-violet-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-zinc-300">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Subject of your message"
                        required
                        className="bg-zinc-700 border-zinc-600 text-zinc-200 focus:ring-violet-500 focus:border-violet-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-zinc-300">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Your message"
                        required
                        className="min-h-[150px] bg-zinc-700 border-zinc-600 text-zinc-200 focus:ring-violet-500 focus:border-violet-500"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </m.div>
          </div>
        </m.div>
      </div>
    </section>
  )
}
