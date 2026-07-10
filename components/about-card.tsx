import { ExternalLink } from "lucide-react"
import { getPublicProfilePresentation } from "@/lib/profile-public"

// Strips stray HTML tags (e.g. leftover <p>, </p>) that sometimes end up
// saved directly inside text fields from the CMS/editor, so they render as
// plain text instead of leaking into the page as literal "<p>" strings.
function stripHtmlTags(value?: string | null): string {
  if (!value) return ""
  return value.replace(/<\/?[a-z][^>]*>/gi, "").trim()
}

export default async function AboutCard() {
  const presentation = await getPublicProfilePresentation()

  const profile = presentation?.profile
  const editable = presentation?.editable
  const linkedInChannel = profile?.contact_channels?.find((channel) => channel.channel_type === "linkedin")
  const linkedInUrl = linkedInChannel?.url || profile?.linkedin_url || ""
  const githubChannel = profile?.contact_channels?.find((channel) => channel.channel_type === "github")
  const githubUrl = githubChannel?.url || profile?.github_url || ""

  const aboutIntro = stripHtmlTags(
    editable?.aboutIntro || `My name is ${profile?.full_name || "Meshack Bwire"} from ${profile?.location || "Nairobi, Kenya"}.`
  )
  const aboutCurrentRole = stripHtmlTags(editable?.aboutCurrentRole)
  const aboutHighlights = (editable?.aboutHighlights || []).map(stripHtmlTags)
  const aboutPreviousRole = stripHtmlTags(editable?.aboutPreviousRole)
  const quote = stripHtmlTags(editable?.quote) || "Strive to build things that make a difference!"
  const quoteAuthor = stripHtmlTags(editable?.quoteAuthor) || "Bwire"

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md">
      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-white">{aboutIntro}</p>

        {aboutCurrentRole ? <p className="text-gray-300">{aboutCurrentRole}</p> : null}

        {aboutHighlights.map((highlight, index) => (
          <p key={index} className="text-gray-300">{highlight}</p>
        ))}

        {aboutPreviousRole ? <p className="text-gray-300">{aboutPreviousRole}</p> : null}

        <div className="flex flex-wrap gap-4 text-sm text-zinc-300">
          {linkedInUrl ? (
            <a href={linkedInUrl} className="text-purple-400 hover:text-purple-300 no-underline" target="_blank" rel="noopener noreferrer">
              LinkedIn <ExternalLink className="inline h-4 w-4" />
            </a>
          ) : null}
          {githubUrl ? (
            <a href={githubUrl} className="text-purple-400 hover:text-purple-300 no-underline" target="_blank" rel="noopener noreferrer">
              GitHub <ExternalLink className="inline h-4 w-4" />
            </a>
          ) : null}
        </div>

        <h3 className="text-2xl font-semibold mb-4 flex items-center text-white">
          Apart from coding, some other activities that I love to do!
        </h3>

        <ul className="space-y-2">
          {(editable?.interests || []).map((interest, index) => (
            <li key={index} className="flex items-center">
              <svg className="h-5 w-5 text-purple-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-300">{interest}</span>
            </li>
          ))}
        </ul>

        <blockquote className="border-l-4 border-purple-400 pl-4 italic mt-6">
          <p className="text-purple-400">"{quote}"</p>
          <footer className="text-gray-400">- {quoteAuthor}</footer>
        </blockquote>
      </div>
    </div>
  )
}
