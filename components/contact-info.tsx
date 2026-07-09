import { Mail, Phone, MapPin, Linkedin, Github } from "lucide-react"
import { getPublicProfilePresentation } from "@/lib/profile-public"

export default async function ContactInfo() {
  const presentation = await getPublicProfilePresentation()
  const profile = presentation?.profile
  const channels = profile?.contact_channels || []
  const email = channels.find((channel) => channel.channel_type === "email")
  const phone = channels.find((channel) => channel.channel_type === "phone")
  const linkedin = channels.find((channel) => channel.channel_type === "linkedin")
  const github = channels.find((channel) => channel.channel_type === "github")

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-white">Contact Information</h2>

      <div className="space-y-6">
        <div className="flex items-start">
          <div className="h-10 w-10 rounded-full bg-purple-900 flex items-center justify-center mr-4">
            <Mail className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Email</h3>
            <a href={email?.url || `mailto:${profile?.email || ""}`} className="text-purple-400 hover:underline">
              {email?.value || profile?.email || "Not available"}
            </a>
          </div>
        </div>

        <div className="flex items-start">
          <div className="h-10 w-10 rounded-full bg-purple-900 flex items-center justify-center mr-4">
            <Phone className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Phone</h3>
            <a href={phone?.url || `tel:${(profile?.phone || "").replace(/\s+/g, "")}`} className="text-purple-400 hover:underline">
              {phone?.handle || profile?.phone || "Not available"}
            </a>
          </div>
        </div>

        <div className="flex items-start">
          <div className="h-10 w-10 rounded-full bg-purple-900 flex items-center justify-center mr-4">
            <MapPin className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Location</h3>
            <p className="text-gray-300">{profile?.location || "Nairobi, Kenya"}</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="h-10 w-10 rounded-full bg-purple-900 flex items-center justify-center mr-4">
            <Linkedin className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">LinkedIn</h3>
            <a
              href={linkedin?.url || profile?.linkedin_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              {linkedin?.handle || "LinkedIn Profile"}
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
              href={github?.url || profile?.github_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              {github?.handle || "GitHub"}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <h3 className="text-lg font-medium mb-4 text-white">Connect With Me</h3>
        <div className="flex space-x-4">
          <a
            href={linkedin?.url || profile?.linkedin_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 w-10 rounded-full bg-[#0077B5] flex items-center justify-center text-white hover:bg-opacity-80 transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href={github?.url || profile?.github_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 w-10 rounded-full bg-[#333] flex items-center justify-center text-white hover:bg-opacity-80 transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href={email?.url || `mailto:${profile?.email || ""}`}
            className="h-10 w-10 rounded-full bg-[#EA4335] flex items-center justify-center text-white hover:bg-opacity-80 transition-colors"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}
