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
      <div className="border-b border-white/10 bg-gradient-to-r from-violet-600/20 via-slate-900/30 to-transparent px-6 py-5 sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">A little more about me</p>
        <p className="mt-2 text-lg leading-8 text-white sm:text-xl">{aboutIntro}</p>
      </div>

      <div className="space-y-8 px-6 py-7 sm:px-8">
        {aboutCurrentRole ? <ContentSection title="What I do now" content={aboutCurrentRole} /> : null}

        {aboutHighlights.length ? (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">What I bring</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {aboutHighlights.map((highlight, index) => (
                <li key={index} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
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
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white"><Heart className="h-5 w-5 text-violet-400" /> Beyond work</h2>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => <span key={index} className="rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1.5 text-sm text-violet-100">{interest}</span>)}
            </div>
          </div>
        ) : null}

        <blockquote className="rounded-xl border border-violet-400/20 bg-violet-400/10 p-5">
          <Quote className="mb-2 h-5 w-5 text-violet-300" />
          <p className="text-lg italic leading-7 text-violet-100">“{quote}”</p>
          <footer className="mt-3 text-sm text-violet-300">— {quoteAuthor}</footer>
        </blockquote>
      </div>
    </section>
  )
}

function ContentSection({ title, content, accent = false }: { title: string; content: string; accent?: boolean }) {
  return <div className={accent ? "border-l-2 border-violet-400/70 pl-5" : ""}><h2 className="mb-3 text-lg font-semibold text-white">{title}</h2><p className="whitespace-pre-line leading-7 text-slate-300">{content}</p></div>
}

function ProfileLink({ href, label }: { href: string; label: string }) {
  return <a href={href} className="font-medium text-violet-300 transition hover:text-violet-200" target="_blank" rel="noopener noreferrer">{label} <ExternalLink className="inline h-4 w-4" /></a>
}
