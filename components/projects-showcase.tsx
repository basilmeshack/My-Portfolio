"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Search, Lock, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import PocketBase from "pocketbase"

// Initialize PocketBase client
const pb = new PocketBase("https://remain-faceghost.pockethost.io")

// Type definition for project data
interface Project {
  id: string
  name: string
  description: string
  image: string
  tags: string[] // Parsed from JSON string
  demoLink?: string
  url?: string
  category: string
  isCompanyProject: boolean
  comingSoon?: boolean
}

// Fallback projects in case the API request fails
const fallbackProjects: Project[] = [
  {
    id: "1",
    name: "Infinity Wanderlust",
    description: "A travel advisory application that helps users find hotels, restaurants, and attractions.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["TypeScript", "React", "API Integration"],
    demoLink: "https://infinity-wanderlust.vercel.app/",
    url: "https://github.com/BM-Ghost/travel-advisor",
    category: "Personal Projects",
    isCompanyProject: false,
  },
  {
    id: "2",
    name: "Vinwil Ridesharing App",
    description: "A transport application for ridesharing services. Coming soon to PlayStore and iOS App Store.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["Java", "Android", "Transportation"],
    url: "https://github.com/BM-Ghost/Vinwil-Ridesharing-App",
    category: "Personal Projects",
    isCompanyProject: false,
    comingSoon: true,
  },
]

// Function to fetch projects from PocketBase
async function fetchProjects(): Promise<Project[]> {
  try {
    // Fetch all portfolio images with field type "projects"
    const records = await pb.collection("portfolio_images").getFullList({
      sort: "-created",
      filter: 'field = "projects"',
    })

    // Map them to the expected project format
    const projects = records.map((record) => {
      // Parse tags from JSON string or use directly if already an array
      let tags: string[] = []
      if (record.tags) {
        if (Array.isArray(record.tags)) {
          // If tags is already an array, use it directly
          tags = record.tags
        } else if (typeof record.tags === "string") {
          try {
            // Try to parse as JSON
            tags = JSON.parse(record.tags)
          } catch (e) {
            // If parsing fails, try to split by comma
            tags = record.tags.split(",").map((tag: string) => tag.trim())
          }
        }
      }

      return {
        id: record.id,
        name: record.name,
        description: record.description || "",
        image: pb.files.getUrl(record, record.image), // Construct full image URL
        tags,
        demoLink: record.demoLink,
        url: record.url,
        category: record.category,
        isCompanyProject: record.isCompanyProject || false,
        comingSoon: record.comingSoon || false,
      }
    })

    return projects
  } catch (err) {
    console.error("Failed to fetch projects:", err)
    return fallbackProjects
  }
}

export default function ProjectsShowcase() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  // Fetch projects data on component mount
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true)
      try {
        const fetchedProjects = await fetchProjects()
        setProjects(fetchedProjects)
        setFilteredProjects(fetchedProjects)
      } catch (error) {
        console.error("Error loading projects:", error)
        setProjects(fallbackProjects)
        setFilteredProjects(fallbackProjects)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  // Handle search and filter changes
  useEffect(() => {
    let result = [...projects]

    // Apply type filter
    if (activeFilter === "company") {
      result = result.filter((project) => project.isCompanyProject)
    } else if (activeFilter === "personal") {
      result = result.filter((project) => !project.isCompanyProject)
    }

    // Apply search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    setFilteredProjects(result)
  }, [searchQuery, activeFilter, projects])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-center">
        My <span className="text-purple-600">Projects</span>
      </h1>

      <div className="mb-8 space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 border-gray-300 dark:border-gray-700"
          />
        </div>

        <div className="flex justify-center space-x-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("all")}
            className={activeFilter === "all" ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            All Projects
          </Button>
          <Button
            variant={activeFilter === "company" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("company")}
            className={activeFilter === "company" ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            Company Projects
          </Button>
          <Button
            variant={activeFilter === "personal" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("personal")}
            className={activeFilter === "personal" ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            Personal Projects
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No projects found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col overflow-hidden">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {project.isCompanyProject && (
                    <div className="absolute top-2 right-2 bg-gray-900/80 text-white text-xs py-1 px-2 rounded-full flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      <span>Company Project</span>
                    </div>
                  )}
                  {project.comingSoon && (
                    <div className="absolute top-2 right-2 bg-amber-600/90 text-white text-xs py-1 px-2 rounded-full flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span>Coming Soon</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-purple-600">{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-600">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-4 border-t">
                  {!project.isCompanyProject && project.url ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 dark:border-gray-700"
                      onClick={() => window.open(project.url, "_blank")}
                    >
                      <Github className="mr-2 h-4 w-4" />
                      Code
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-500 italic flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Private Repository
                    </div>
                  )}

                  {project.comingSoon ? (
                    <div className="text-sm text-amber-600 italic flex items-center ml-auto">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Coming to App Stores
                    </div>
                  ) : (
                    project.demoLink && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-600 text-purple-600 ml-auto"
                        onClick={() => window.open(project.demoLink, "_blank")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {project.isCompanyProject ? "Visit Site" : "Demo"}
                      </Button>
                    )
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
