import { Briefcase, Calendar } from "lucide-react"
import { getPublicExperienceEntries, formatPeriodLabel } from "@/lib/profile-editor-service"

export default async function ExperienceTimeline() {
  const experiences = await getPublicExperienceEntries()

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-white">Professional Experience</h2>

      <div className="relative border-l-2 border-purple-600 pl-8 space-y-12">
        {experiences.map((exp) => (
          <div key={`${exp.id}-${exp.roleTitle}`} className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center">
              <Briefcase className="h-3 w-3 text-white" />
            </div>

            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <h3 className="text-xl font-semibold text-purple-400">{exp.roleTitle}</h3>
                <div className="flex items-center text-gray-400 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatPeriodLabel(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear)}
                </div>
              </div>

              <p className="text-lg font-medium mb-3 text-white">{exp.organization}</p>

              <div className="mb-4">
                <h4 className="font-medium mb-2 text-white">Responsibilities:</h4>
                <div className="prose prose-invert max-w-none prose-p:my-2 prose-li:my-1" dangerouslySetInnerHTML={{ __html: exp.responsibilitiesHtml || "<p>No responsibilities added yet.</p>" }} />
              </div>

              <div>
                <h4 className="font-medium mb-2 text-white">Key Achievements:</h4>
                <div className="prose prose-invert max-w-none prose-p:my-2 prose-li:my-1" dangerouslySetInnerHTML={{ __html: exp.achievementsHtml || "<p>No achievements added yet.</p>" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
