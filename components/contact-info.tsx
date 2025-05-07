"use client"

import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Linkedin, Github } from "lucide-react"

export default function ContactInfo() {
  return (
    <motion.div
      className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-white">Contact Information</h2>

      <div className="space-y-6">
        <div className="flex items-start">
          <div className="h-10 w-10 rounded-full bg-purple-900 flex items-center justify-center mr-4">
            <Mail className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Email</h3>
            <a href="mailto:bmwandera14@gmail.com" className="text-purple-400 hover:underline">
              bmwandera14@gmail.com
            </a>
          </div>
        </div>

        <div className="flex items-start">
          <div className="h-10 w-10 rounded-full bg-purple-900 flex items-center justify-center mr-4">
            <Phone className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Phone</h3>
            <a href="tel:+254794142204" className="text-purple-400 hover:underline">
              +254 794 142 204
            </a>
          </div>
        </div>

        <div className="flex items-start">
          <div className="h-10 w-10 rounded-full bg-purple-900 flex items-center justify-center mr-4">
            <MapPin className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Location</h3>
            <p className="text-gray-300">Nairobi, Kenya</p>
            <p className="text-gray-300">P.O Box 268-50400</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="h-10 w-10 rounded-full bg-purple-900 flex items-center justify-center mr-4">
            <Linkedin className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">LinkedIn</h3>
            <a
              href="https://www.linkedin.com/in/meshack-bwire-b2390a213/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              Meshack Bwire
            </a>
          </div>
        </div>

        <div className="flex items-start">
          <div className="h-10 w-10 rounded-full bg-purple-900 flex items-center justify-center mr-4">
            <Github className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">GitHub</h3>
            <a
              href="https://github.com/bm-ghost"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              bm-ghost
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <h3 className="text-lg font-medium mb-4 text-white">Connect With Me</h3>
        <div className="flex space-x-4">
          <a
            href="https://www.linkedin.com/in/meshack-bwire-b2390a213/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 w-10 rounded-full bg-[#0077B5] flex items-center justify-center text-white hover:bg-opacity-80 transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href="https://github.com/bm-ghost"
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 w-10 rounded-full bg-[#333] flex items-center justify-center text-white hover:bg-opacity-80 transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="mailto:bmwandera14@gmail.com"
            className="h-10 w-10 rounded-full bg-[#EA4335] flex items-center justify-center text-white hover:bg-opacity-80 transition-colors"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </div>
    </motion.div>
  )
}
