import { CheckCircle2, ExternalLink, Heart, Quote } from "lucide-react"
import { getPublicProfilePresentation } from "@/lib/profile-public"
import { toPlainText } from "@/lib/presentation-text"

export default async function AboutCard() {
  const presentation = await getPublicProfilePresentation()
  const profile = presentation?.profile
  const editable = presentation?.editable
  const linkedInChannel = profile?.contact_channels?.find((channel) => channel.channel_type === "linkedin")
  const githubChannel = profile?.contact_channels?.find((channel) => channel.channel_type === "github")
  const linkedInUrl = linkedInChannel?.url || profile?.linkedin_url || ""
  const githubUrl = githubChannel?.url || profile?.github_url || ""
  const aboutIntro = toPlainText(editable?.aboutIntro || `My name is ${profile?.full_name || "Meshack Bwire"} from ${profile?.location || "Nairobi, Kenya"}.`)
  const aboutCurrentRole = toPlainText(editable?.aboutCurrentRole)
  const aboutHighlights = (editable?.aboutHighlights || []).map(toPlainText).filter(Boolean)
  const aboutPreviousRole = toPlainText(editable?.aboutPreviousRole)
  const interests = (editable?.interests || []).map(toPlainText).filter(Boolean)
  const quote = toPlainText(editable?.quote) || "Strive to build things that make a difference!"
  const quoteAuthor = toPlainText(editable?.quoteAuthor) || "Bwire"

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl shadow-black/20 backdrop-blur-sm">
      {/* Hero header */}
      <div className="relative border-b border-white/10 bg-gradient-to-br from-violet-600/25 via-slate-900/40 to-slate-900/10 px-6 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-300">A little more about me</p>
        <p className="mt-3 max-w-2xl text-xl leading-8 text-white sm:text-2xl">{aboutIntro}</p>
      </div>

      <div className="space-y-10 px-6 py-8 sm:px-8">
        {aboutCurrentRole ? <ContentSection title="What I do now" content={aboutCurrentRole} /> : null}

        {aboutHighlights.length ? (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">What I bring</h2>
            <ul className="space-y-3">
              {aboutHighlights.map((highlight, index) => (
                <li
                  key={index}
                  className="flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300 transition hover:border-violet-400/30 hover:bg-white/[0.05]"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-400" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {aboutPreviousRole ? <ContentSection title="My journey" content={aboutPreviousRole} accent /> : null}

        {(linkedInUrl || githubUrl) ? (
          <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-white/10 pt-6 text-sm">
            {linkedInUrl ? <ProfileLink href={linkedInUrl} label="LinkedIn" /> : null}
            {githubUrl ? <ProfileLink href={githubUrl} label="GitHub" /> : null}
          </div>
        ) : null}

        {interests.length ? (
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Heart className="h-5 w-5 text-violet-400" /> Beyond work
            </h2>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <span key={index} className="rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1.5 text-sm text-violet-100">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <blockquote className="relative overflow-hidden rounded-xl border border-violet-400/20 bg-gradient-to-r from-violet-400/10 to-transparent p-6">
          <Quote className="mb-2 h-5 w-5 text-violet-300" />
          <p className="text-lg italic leading-7 text-violet-100">"{quote}"</p>
          <footer className="mt-3 text-sm text-violet-300">— {quoteAuthor}</footer>
        </blockquote>
      </div>
    </section>
  )
}

function ContentSection({ title, content, accent = false }: { title: string; content: string; accent?: boolean }) {
  return (
    <div className={accent ? "border-l-2 border-violet-400/70 pl-5" : ""}>
      <h2 className="mb-3 text-lg font-semibold text-white">{title}</h2>
      <p className="whitespace-pre-line leading-7 text-slate-300">{content}</p>
    </div>
  )
}

function ProfileLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="font-medium text-violet-300 transition hover:text-violet-200" target="_blank" rel="noopener noreferrer">
      {label} <ExternalLink className="inline h-4 w-4" />
    </a>
  )
}
