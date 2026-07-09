import Link from "next/link"
import { Github, Linkedin, Mail, Phone } from "lucide-react"
import { getPublicProfilePresentation } from "@/lib/profile-public"

export default async function Footer() {
  const presentation = await getPublicProfilePresentation()
  const profile = presentation?.profile
  const channels = profile?.contact_channels || []
  const github = channels.find((channel) => channel.channel_type === "github")
  const linkedin = channels.find((channel) => channel.channel_type === "linkedin")
  const email = channels.find((channel) => channel.channel_type === "email")
  const phone = channels.find((channel) => channel.channel_type === "phone")

  return (
    <footer className="bg-gray-900/80 backdrop-blur-md border-t border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-xl font-bold text-purple-400">
              {profile?.full_name || "Meshack Bwire"}
            </Link>
            <p className="text-gray-400 text-sm mt-1">Software Engineer | POS Systems Specialist</p>
          </div>

          <div className="flex space-x-4">
            <a
              href={github?.url || profile?.github_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href={linkedin?.url || profile?.linkedin_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
            <a
              href={email?.url || `mailto:${profile?.email || ""}`}
              className="text-gray-400 hover:text-purple-400 transition-colors"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
            <a
              href={phone?.url || `tel:${(profile?.phone || "").replace(/\s+/g, "")}`}
              className="text-gray-400 hover:text-purple-400 transition-colors"
              aria-label="Phone"
            >
              <Phone size={20} />
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-2 md:mb-0">
            &copy; {new Date().getFullYear()} Meshack Bwire. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-x-4">
            <Link href="/about" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
              About
            </Link>
            <Link href="/experience" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
              Experience
            </Link>
            <Link href="/projects" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
              Projects
            </Link>
            <Link href="/contact" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
