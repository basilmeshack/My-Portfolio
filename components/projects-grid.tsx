"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Search, Lock, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"

// Sample projects data - updated to reflect private company projects and public personal projects
const projectsData = [
  {
    id: 1,
    title: "Awash Bank Payment Application",
    description: "Developed the payment application for Awash Bank of Ethiopia on Ingenico's Axium DX POS devices.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["Java", "Android", "POS", "Payment Processing"],
    demoLink: "https://awashbank.com/",
    isCompanyProject: true,
  },
  {
    id: 2,
    title: "CRDB Bank Nexgo SDK",
    description: "Developed and improved the SDK used by CRDB Bank of Tanzania on Nexgo and Telpo POS devices.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["Java", "Android", "SDK", "POS"],
    demoLink: "https://www.crdbbank.co.tz/",
    isCompanyProject: true,
  },
  {
    id: 3,
    title: "Terminal Management System",
    description:
      "Implemented TMS functionalities across POS devices for multiple banks, enhancing remote management capabilities.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["C", "Linux", "TMS", "POS"],
    isCompanyProject: true,
  },
  {
    id: 4,
    title: "Cashless Fuel Transaction App",
    description:
      "Developed an application for cashless fuel transactions powered by Quantum Technology PLC on Ingenico devices.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["Java", "Android", "Fuel Systems", "Payment Processing"],
    isCompanyProject: true,
  },
  {
    id: 5,
    title: "Bunna Bank Payment System",
    description:
      "Developed and certified a payment application for Bunna Bank's Ingenico DX8000 SDK on BASE24-eps® switch.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["Java", "Android", "Visa", "MasterCard", "Certification"],
    isCompanyProject: true,
  },
  {
    id: 6,
    title: "EDMS Implementation",
    description:
      "Enhanced document retrieval processes through implementation of Electronic Document and Record Management System.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["Azure", "SQL", "Document Management", "Data Digitization"],
    isCompanyProject: true,
  },
  {
    id: 7,
    title: "Infinity Wanderlust",
    description: "A travel advisory application that helps users find hotels, restaurants, and attractions.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["TypeScript", "React", "API Integration"],
    codeLink: "https://github.com/BM-Ghost/travel-advisor",
    demoLink: "https://infinity-wanderlust.vercel.app/",
    isPersonalProject: true,
  },
  {
    id: 8,
    title: "Vinwil Ridesharing App",
    description: "A transport application for ridesharing services. Coming soon to PlayStore and iOS App Store.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["Java", "Android", "Transportation"],
    codeLink: "https://github.com/BM-Ghost/Vinwil-Ridesharing-App",
    comingSoon: true,
    isPersonalProject: true,
  },
]

export default function ProjectsGrid() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProjects, setFilteredProjects] = useState(projectsData)
  const [activeFilter, setActiveFilter] = useState("all")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    filterProjects(query, activeFilter)
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    filterProjects(searchQuery, filter)
  }

  const filterProjects = (query: string, filter: string) => {
    let filtered = projectsData

    // Apply type filter
    if (filter === "company") {
      filtered = filtered.filter((project) => project.isCompanyProject)
    } else if (filter === "personal") {
      filtered = filtered.filter((project) => project.isPersonalProject)
    }

    // Apply search query
    if (query.trim() !== "") {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    setFilteredProjects(filtered)
  }

  return (
    <div>
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

      {filteredProjects.length === 0 ? (
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
                    alt={project.title}
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
                  <CardTitle className="text-xl text-purple-600">{project.title}</CardTitle>
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
                  {project.isPersonalProject && project.codeLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 dark:border-gray-700"
                      onClick={() => window.open(project.codeLink, "_blank")}
                    >
                      <Github className="mr-2 h-4 w-4" />
                      Code
                    </Button>
                  )}

                  {project.isCompanyProject && (
                    <div className="text-sm text-gray-500 italic flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Private Repository
                    </div>
                  )}

                  {project.comingSoon && (
                    <div className="text-sm text-amber-600 italic flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Coming to App Stores
                    </div>
                  )}

                  {project.demoLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-600 text-purple-600 ml-auto"
                      onClick={() => window.open(project.demoLink, "_blank")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {project.isCompanyProject ? "Visit Site" : "Demo"}
                    </Button>
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
