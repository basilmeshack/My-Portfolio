// Projects types
export interface Project {
  id: string
  created: string
  updated: string
  title: string
  description: string
  tools_used: string
  link: string
  profile: string
  image?: string
  github?: string
  demo?: string
  aiTags?: string[]
}

// Fallback data in case the API request fails
export const fallbackProjectsData: Project[] = [
  {
    id: "1",
    created: "",
    updated: "",
    title: "Predictive Inventory System",
    description:
      "An ML-powered inventory management system that predicts stock needs based on historical data and seasonal trends.",
    tools_used: "Python,TensorFlow,React,Node.js",
    link: "https://example.com/inventory",
    profile: "",
    image: "/placeholder.svg?height=300&width=600",
    github: "https://github.com/example/inventory",
    demo: "https://demo.example.com/inventory",
    aiTags: ["Predictive Analytics", "Time Series Forecasting"],
  },
  {
    id: "2",
    created: "",
    updated: "",
    title: "Customer Behavior Analysis",
    description:
      "A data visualization platform that analyzes customer purchase patterns and provides actionable insights.",
    tools_used: "Python,Pandas,D3.js,Flask",
    link: "https://example.com/behavior",
    profile: "",
    image: "/placeholder.svg?height=300&width=600",
    github: "https://github.com/example/behavior",
    demo: "https://demo.example.com/behavior",
    aiTags: ["Data Mining", "Clustering"],
  },
  {
    id: "3",
    created: "",
    updated: "",
    title: "Smart POS Assistant",
    description:
      "An AI-powered assistant for point-of-sale systems that provides recommendations and automates routine tasks.",
    tools_used: "JavaScript,Node.js,NLP,Express",
    link: "https://example.com/pos",
    profile: "",
    image: "/placeholder.svg?height=300&width=600",
    github: "https://github.com/example/pos",
    demo: "https://demo.example.com/pos",
    aiTags: ["NLP", "Recommendation Systems"],
  },
]

// Function to get all projects
export async function getAllProjects(): Promise<Project[]> {
  try {
    const response = await fetch("/api/projects", { cache: "force-cache" })
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data = await response.json()
    const records = data?.projects as Project[]

    if (!records || records.length === 0) {
      console.warn("No projects found in the database. Using fallback data.")
      return fallbackProjectsData
    }

    return records
  } catch (error) {
    console.error("Error fetching projects:", error)
    return fallbackProjectsData
  }
}

// Function to search projects
export async function searchProjects(query: string): Promise<Project[]> {
  try {
    const response = await fetch(`/api/projects?search=${encodeURIComponent(query)}`, { cache: "force-cache" })
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data = await response.json()
    const records = data?.projects as Project[]

    if (!records || records.length === 0) {
      // If no results, search in fallback data
      const lowercaseQuery = query.toLowerCase()
      return fallbackProjectsData.filter(
        (project) =>
          project.title.toLowerCase().includes(lowercaseQuery) ||
          project.description.toLowerCase().includes(lowercaseQuery) ||
          project.tools_used.toLowerCase().includes(lowercaseQuery),
      )
    }

    return records
  } catch (error) {
    console.error("Error searching projects:", error)
    // Search in fallback data
    const lowercaseQuery = query.toLowerCase()
    return fallbackProjectsData.filter(
      (project) =>
        project.title.toLowerCase().includes(lowercaseQuery) ||
        project.description.toLowerCase().includes(lowercaseQuery) ||
        project.tools_used.toLowerCase().includes(lowercaseQuery),
    )
  }
}

// Function to get a single project by ID
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const projects = await getAllProjects()
    const project = projects.find((p) => p.id === id)
    return project || null
  } catch (error) {
    console.error(`Error fetching project with ID ${id}:`, error)
    // Look in fallback data
    const project = fallbackProjectsData.find((p) => p.id === id)
    return project || null
  }
}

// Function to get projects by profile ID
export async function getProjectsByProfile(profileId: string): Promise<Project[]> {
  try {
    const response = await fetch(`/api/projects?profileId=${encodeURIComponent(profileId)}`, { cache: "force-cache" })
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data = await response.json()
    const records = data?.projects as Project[]
    return records || []
  } catch (error) {
    console.error(`Error fetching projects for profile ${profileId}:`, error)
    return fallbackProjectsData
  }
}
