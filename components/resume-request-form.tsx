"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Send, CheckCircle, Mail } from "lucide-react"

export default function ResumeRequestForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch("/api/email/resume-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || "Unable to send your request right now.")
      }

      setSubmitStatus("success")
      setFormData({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error(error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyles =
    "w-full bg-gray-900/60 border border-gray-700 text-white placeholder:text-gray-500/35 placeholder:transition-opacity focus:placeholder:opacity-20 focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition-all duration-200"

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-br from-purple-900/20 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            Request My Resume
          </h2>

          <p className="text-gray-300">
            Interested in my professional background? Fill out the form below
            and I'll send you my latest CV/Resume.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Your Name <span className="text-red-400">*</span>
              </label>

              <Input
                id="name"
                name="name"
                placeholder="Write your name here"
                value={formData.name}
                onChange={handleChange}
                required
                className={inputStyles}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Your Email <span className="text-red-400">*</span>
              </label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputStyles}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="company"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              Company / Organization
            </label>

            <Input
              id="company"
              name="company"
              placeholder="Your company name"
              value={formData.company}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              Subject <span className="text-red-400">*</span>
            </label>

            <Input
              id="subject"
              name="subject"
              placeholder="Resume Request — Position / Opportunity"
              value={formData.subject}
              onChange={handleChange}
              required
              className={inputStyles}
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              Your Message <span className="text-red-400">*</span>
            </label>

            <Textarea
              id="message"
              name="message"
              placeholder="Tell me about the opportunity or why you're interested in receiving my resume..."
              value={formData.message}
              onChange={handleChange}
              required
              className={`${inputStyles} min-h-[150px] resize-y`}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 text-lg font-medium bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30 transition-all duration-300"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white" />
                Sending Request...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Send Resume Request
              </>
            )}
          </Button>

          {submitStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center rounded-lg border border-green-500/30 bg-green-900/30 p-4 text-green-300"
            >
              <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0" />

              <div>
                <p className="font-medium">
                  Request Sent Successfully!
                </p>

                <p className="mt-1 text-sm text-green-400">
                  I'll review your request and send you my resume shortly.
                </p>
              </div>
            </motion.div>
          )}

          {submitStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-red-500/30 bg-red-900/30 p-4 text-red-300"
            >
              <p className="font-medium">
                Error Sending Request
              </p>

              <p className="mt-1 text-sm text-red-400">
                Please try again later or contact me directly via email.
              </p>
            </motion.div>
          )}
        </form>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-700 pt-6">
          <div className="flex items-start space-x-3 text-sm text-gray-400">
            <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />

            <p>
              Your request will be sent directly to my email. I typically
              respond within <strong className="text-gray-300">0–48 hours</strong>.
              For urgent matters, please include your phone number in your
              message.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
