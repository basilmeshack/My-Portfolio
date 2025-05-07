"use client"

import { useState, useEffect } from "react"
import { m } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, ExternalLink, Search } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { getAllProjects, searchProjects, type Project } from "@/lib/projects-service"
import { useProfile } from "@/context/profile-context"

export default function Projects() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const { profile } = useProfile()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch projects data from PocketBase
  useEffect(() => {
    async function fetchProjects() {
      try {
        setIsLoading(true)
        setError(null)
        const projectsData = await getAllProjects()

        if (projectsData.length === 0) {
          setError("No projects found")
        } else {
          setProjects(projectsData)
          setFilteredProjects(projectsData)
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err)
        setError("Failed to load projects data. Using fallback data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Handle search
  useEffect(() => {
    async function handleSearch() {
      if (searchQuery.trim() === "") {
        setFilteredProjects(projects)
      } else {
        setIsLoading(true)
        try {
          const results = await searchProjects(searchQuery)
          setFilteredProjects(results)
        } catch (err) {
          console.error("Error searching projects:", err)
        } finally {
          setIsLoading(false)
        }
      }
    }

    // Debounce search to avoid too many requests
    const debounceTimer = setTimeout(() => {
      handleSearch()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, projects])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  // Parse tools_used string into an array
  const getToolsArray = (toolsString: string): string[] => {
    if (!toolsString) return []
    return typeof toolsString === "string" ? toolsString.split(",").map((tool) => tool.trim()) : toolsString
  }

  return (
    <section id="projects" className="py-20 bg-zinc-950">
      <div className="container mx-auto px-4">
        <m.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <m.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Featured <span className="text-violet-400">Projects</span>
          </m.h2>

          <m.div variants={itemVariants} className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-200"
              />
            </div>
            {error && (
              <div className="text-amber-400 text-sm mt-2 text-center bg-amber-950/30 p-2 rounded-md max-w-md mx-auto">
                {error}
              </div>
            )}
          </m.div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center text-zinc-400 p-4">No projects found matching your search criteria.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <m.div key={project.id} variants={itemVariants}>
                  <Card className="bg-zinc-900 border-zinc-800 h-full flex flex-col overflow-hidden">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={project.image || "/placeholder.svg?height=300&width=600"}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl text-violet-400">{project.title}</CardTitle>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.aiTags &&
                          project.aiTags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                              {tag}
                            </Badge>
                          ))}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-zinc-300 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {getToolsArray(project.tools_used).map((tool, toolIndex) => (
                          <Badge
                            key={toolIndex}
                            variant="outline"
                            className="bg-zinc-800 text-zinc-400 border-zinc-700"
                          >
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-4 border-t border-zinc-800">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        onClick={() => project.github && window.open(project.github, "_blank")}
                      >
                        <Github className="mr-2 h-4 w-4" />
                        Code
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-violet-700 text-violet-400 hover:bg-violet-500/20"
                        onClick={() => project.demo && window.open(project.demo, "_blank")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Demo
                      </Button>
                    </CardFooter>
                  </Card>
                </m.div>
              ))}
            </div>
          )}
        </m.div>
      </div>
    </section>
  )
}
