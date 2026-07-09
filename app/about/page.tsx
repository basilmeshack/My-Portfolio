import AboutCard from "@/components/about-card"
import TechStack from "@/components/tech-stack"
import { Briefcase } from "lucide-react"
import { getPublicProfilePresentation } from "@/lib/profile-public"

export default async function AboutPage() {
  const presentation = await getPublicProfilePresentation()

  return (
    <main className="container mx-auto px-4 py-16 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-center">
        About <span className="text-purple-600">Me</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AboutCard />
        </div>

        <div className="space-y-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Briefcase className="mr-2 text-purple-600" size={24} />
              Professional
            </h2>
            <p className="text-gray-300">
              {presentation?.editable.professionalBlurb ||
                "Software Engineer specializing in POS systems integration, mobile applications, and API development with a focus on secure payment solutions."}
            </p>
          </div>

          <TechStack />
        </div>
      </div>
    </main>
  )
}
