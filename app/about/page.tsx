import AboutCard from "@/components/about-card"
import TechStack from "@/components/tech-stack"
import { Briefcase, Sparkles } from "lucide-react"
import { getPublicProfilePresentation } from "@/lib/profile-public"
import { toPlainText } from "@/lib/presentation-text"

export default async function AboutPage() {
  const presentation = await getPublicProfilePresentation()
  const professionalBlurb = toPlainText(presentation?.editable.professionalBlurb) || "Software Engineer specializing in POS systems integration, mobile applications, and API development with a focus on secure payment solutions."

  return (
    <main className="container mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <div className="lg:col-span-2"><AboutCard /></div>
       <aside className="space-y-8">
        <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20 backdrop-blur-sm">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.16em] text-violet-300">Focus area</p>
          <h2 className="mb-4 flex items-center text-2xl font-semibold text-white"><Briefcase className="mr-2 text-violet-400" size={24} /> Professional</h2>
          <p className="whitespace-pre-line leading-7 text-slate-300">{professionalBlurb}</p>
        </section>
        <TechStack />
      </aside>
    </main>
  )
}
