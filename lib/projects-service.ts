import { pb } from "@/lib/pocketbase"

// Projects types
export interface Project {
  id: string
  collectionId: string
  collectionName: string
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

// Fallback data in case the PocketBase request fails
export const fallbackProjectsData: Project[] = [
  {
    id: "1",
    collectionId: "",
    collectionName: "",
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
    collectionId: "",
    collectionName: "",
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
    collectionId: "",
    collectionName: "",
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

// Function to safely check if a collection exists
async function collectionExists(collectionName: string): Promise<boolean> {
  try {
    // Try to get a single record to check if collection exists
    await pb.collection(collectionName).getList(1, 1)
    return true
  } catch (error: any) {
    // Check if the error is because the collection doesn't exist
    if (error?.status === 404 || error?.message?.includes("not found")) {
      console.warn(`Collection '${collectionName}' does not exist.`)
      return false
    }
    // For other errors, assume the collection might exist but there's another issue
    return true
  }
}

// Function to get all projects
export async function getAllProjects(): Promise<Project[]> {
  try {
    // Check if projects collection exists
    const exists = await collectionExists("projects")
    if (!exists) {
      console.warn("Projects collection does not exist. Using fallback data.")
      return fallbackProjectsData
    }

    const timestamp = new Date().getTime()
    const records = await pb.collection("projects").getFullList({
      sort: "-created",
      requestKey: `projects-${timestamp}`,
    })

    if (!records || records.length === 0) {
      console.warn("No projects found in the database. Using fallback data.")
      return fallbackProjectsData
    }

    return records.map((project: any) => {
      // Parse tools_used as an array if it's a string
      const toolsUsed =
        typeof project.tools_used === "string"
          ? project.tools_used.split(",").map((tool: string) => tool.trim())
          : project.tools_used || []

      // Parse aiTags if available
      const aiTags = project.ai_tags
        ? typeof project.ai_tags === "string"
          ? project.ai_tags.split(",").map((tag: string) => tag.trim())
          : project.ai_tags
        : []

      return {
        id: project.id,
        collectionId: project.collectionId,
        collectionName: project.collectionName,
        created: project.created,
        updated: project.updated,
        title: project.title || "Untitled Project",
        description: project.description || "No description available",
        tools_used: project.tools_used || "",
        link: project.link || "",
        profile: project.profile || "",
        image: project.image || "/placeholder.svg?height=300&width=600",
        github: project.github || "https://github.com",
        demo: project.demo || project.link || "https://demo.com",
        aiTags: aiTags,
      }
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return fallbackProjectsData
  }
}

// Function to search projects
export async function searchProjects(query: string): Promise<Project[]> {
  try {
    // Check if projects collection exists
    const exists = await collectionExists("projects")
    if (!exists) {
      console.warn("Projects collection does not exist. Using fallback data for search.")
      // Search in fallback data
      const lowercaseQuery = query.toLowerCase()
      return fallbackProjectsData.filter(
        (project) =>
          project.title.toLowerCase().includes(lowercaseQuery) ||
          project.description.toLowerCase().includes(lowercaseQuery) ||
          project.tools_used.toLowerCase().includes(lowercaseQuery),
      )
    }

    const timestamp = new Date().getTime()
    const records = await pb.collection("projects").getList(1, 50, {
      filter: `title ~ "${query}" || description ~ "${query}" || tools_used ~ "${query}"`,
      sort: "-created",
      requestKey: `projects-search-${timestamp}`,
    })

    if (!records || !records.items || records.items.length === 0) {
      // If no results, search in fallback data
      const lowercaseQuery = query.toLowerCase()
      return fallbackProjectsData.filter(
        (project) =>
          project.title.toLowerCase().includes(lowercaseQuery) ||
          project.description.toLowerCase().includes(lowercaseQuery) ||
          project.tools_used.toLowerCase().includes(lowercaseQuery),
      )
    }

    return records.items.map((project: any) => {
      // Parse tools_used as an array if it's a string
      const toolsUsed =
        typeof project.tools_used === "string"
          ? project.tools_used.split(",").map((tool: string) => tool.trim())
          : project.tools_used || []

      // Parse aiTags if available
      const aiTags = project.ai_tags
        ? typeof project.ai_tags === "string"
          ? project.ai_tags.split(",").map((tag: string) => tag.trim())
          : project.ai_tags
        : []

      return {
        id: project.id,
        collectionId: project.collectionId,
        collectionName: project.collectionName,
        created: project.created,
        updated: project.updated,
        title: project.title || "Untitled Project",
        description: project.description || "No description available",
        tools_used: project.tools_used || "",
        link: project.link || "",
        profile: project.profile || "",
        image: project.image || "/placeholder.svg?height=300&width=600",
        github: project.github || "https://github.com",
        demo: project.demo || project.link || "https://demo.com",
        aiTags: aiTags,
      }
    })
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
    // Check if projects collection exists
    const exists = await collectionExists("projects")
    if (!exists) {
      console.warn("Projects collection does not exist. Using fallback data for project lookup.")
      // Look in fallback data
      const project = fallbackProjectsData.find((p) => p.id === id)
      return project || null
    }

    const timestamp = new Date().getTime()
    const record = await pb.collection("projects").getOne(id, {
      requestKey: `project-${timestamp}-${id}`,
    })

    if (!record) {
      // If not found, look in fallback data
      const project = fallbackProjectsData.find((p) => p.id === id)
      return project || null
    }

    // Parse tools_used as an array if it's a string
    const toolsUsed =
      typeof record.tools_used === "string"
        ? record.tools_used.split(",").map((tool: string) => tool.trim())
        : record.tools_used || []

    // Parse aiTags if available
    const aiTags = record.ai_tags
      ? typeof record.ai_tags === "string"
        ? record.ai_tags.split(",").map((tag: string) => tag.trim())
        : record.ai_tags
      : []

    return {
      id: record.id,
      collectionId: record.collectionId,
      collectionName: record.collectionName,
      created: record.created,
      updated: record.updated,
      title: record.title || "Untitled Project",
      description: record.description || "No description available",
      tools_used: record.tools_used || "",
      link: record.link || "",
      profile: record.profile || "",
      image: record.image || "/placeholder.svg?height=300&width=600",
      github: record.github || "https://github.com",
      demo: record.demo || record.link || "https://demo.com",
      aiTags: aiTags,
    }
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
    // Check if projects collection exists
    const exists = await collectionExists("projects")
    if (!exists) {
      console.warn("Projects collection does not exist. Using fallback data for profile projects.")
      // Filter fallback data by profile ID (though this likely won't match)
      return fallbackProjectsData.filter((p) => p.profile === profileId)
    }

    const timestamp = new Date().getTime()
    const records = await pb.collection("projects").getList(1, 50, {
      filter: `profile = "${profileId}"`,
      sort: "-created",
      requestKey: `projects-profile-${timestamp}-${profileId}`,
    })

    if (!records || !records.items || records.items.length === 0) {
      // If no results, return empty array or fallback
      return fallbackProjectsData
    }

    return records.items.map((project: any) => {
      // Parse tools_used as an array if it's a string
      const toolsUsed =
        typeof project.tools_used === "string"
          ? project.tools_used.split(",").map((tool: string) => tool.trim())
          : project.tools_used || []

      // Parse aiTags if available
      const aiTags = project.ai_tags
        ? typeof project.ai_tags === "string"
          ? project.ai_tags.split(",").map((tag: string) => tag.trim())
          : project.ai_tags
        : []

      return {
        id: project.id,
        collectionId: project.collectionId,
        collectionName: project.collectionName,
        created: project.created,
        updated: project.updated,
        title: project.title || "Untitled Project",
        description: project.description || "No description available",
        tools_used: project.tools_used || "",
        link: project.link || "",
        profile: project.profile || "",
        image: project.image || "/placeholder.svg?height=300&width=600",
        github: project.github || "https://github.com",
        demo: project.demo || project.link || "https://demo.com",
        aiTags: aiTags,
      }
    })
  } catch (error) {
    console.error(`Error fetching projects for profile ${profileId}:`, error)
    return fallbackProjectsData
  }
}
