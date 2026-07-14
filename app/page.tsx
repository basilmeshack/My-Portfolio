import Hero from "@/components/hero"
import PartnerLogos from "@/components/partner-logos"
import AboutCard from "@/components/about-card"
import TechStack from "@/components/tech-stack"
import ExperienceTimeline from "@/components/experience-timeline"
import Skills from "@/components/skills"
import ProfessionalCredentials from "@/components/professional-credentials"
import EducationShowcase from "@/components/education-showcase"
import ProjectsShowcase from "@/components/projects-showcase"
import GitHubCalendar from "@/components/github-calendar"
import ContactForm from "@/components/contact-form"
import ContactInfo from "@/components/contact-info"
import ResumeRequestForm from "@/components/resume-request-form"
import { Briefcase } from "lucide-react"
import { getPublicProfilePresentation } from "@/lib/profile-public"
import { toPlainText } from "@/lib/presentation-text"

export default async function Home() {
  const presentation = await getPublicProfilePresentation()
  const professionalBlurb = toPlainText(presentation?.editable.professionalBlurb) ||
    "Software Engineer specializing in POS systems integration, mobile applications, and API development with a focus on secure payment solutions."

  return (
    <main className="scroll-smooth scroll-snap-type-y mandatory">
      {/* Home Section */}
      <section id="home" className="min-h-screen scroll-mt-16 scroll-snap-start">
        <Hero />
        <PartnerLogos
          fieldType="partners"
          title="Professional"
          description="Throughout my career, I've collaborated with leading organizations across banking, payment processing, telecommunications, and technology sectors."
        />
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen scroll-mt-16 scroll-snap-start py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <h1 className="text-4xl font-bold mb-8 text-center">
            About <span className="text-purple-400">Me</span>
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2"><AboutCard /></div>
            <aside className="space-y-8">
              <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20 backdrop-blur-sm">
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.16em] text-violet-300">Focus area</p>
                <h2 className="mb-4 flex items-center text-2xl font-semibold text-white"><Briefcase className="mr-2 text-violet-400" size={24} /> Professional</h2>
                <p className="whitespace-pre-line leading-7 text-slate-300">{professionalBlurb}</p>
              </section>
              <TechStack />
            </aside>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="min-h-screen scroll-mt-16 scroll-snap-start py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl font-bold mb-12 text-center">
            My <span className="text-purple-400">Experience</span>
          </h1>

          {/* Experience Timeline */}
          <div className="mb-16">
            <ExperienceTimeline />
          </div>

          {/* Technical Skills */}
          <div className="mb-16">
            <Skills />
          </div>

          {/* Professional Credentials & Education */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProfessionalCredentials />
            <EducationShowcase />
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="min-h-screen scroll-mt-16 scroll-snap-start">
        <ProjectsShowcase />
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="mt-16">
            <GitHubCalendar />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen scroll-mt-16 scroll-snap-start py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Get In <span className="text-purple-600">Touch</span>
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ContactInfo />
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Resume Section */}
      <section id="resume" className="min-h-screen scroll-mt-16 scroll-snap-start py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Request My <span className="text-purple-400">Resume</span>
          </h1>
          <ResumeRequestForm />
        </div>
      </section>
    </main>
  )
}
