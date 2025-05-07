import ProjectsShowcase from "@/components/projects-showcase"
import GitHubCalendar from "@/components/github-calendar"

export default function ProjectsPage() {
  return (
    <main>
      <ProjectsShowcase />

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="mt-16">
          <GitHubCalendar />
        </div>
      </div>
    </main>
  )
}
