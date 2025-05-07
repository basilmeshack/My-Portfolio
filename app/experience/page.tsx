import ExperienceTimeline from "@/components/experience-timeline"
import Skills from "@/components/skills"
import ProfessionalCredentials from "@/components/professional-credentials"
import EducationShowcase from "@/components/education-showcase"

export default function ExperiencePage() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-center">
        My <span className="text-purple-400">Experience</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <ExperienceTimeline />
        </div>

        <div className="space-y-8">
          <Skills />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <ProfessionalCredentials />
        <EducationShowcase />
      </div>
    </main>
  )
}
