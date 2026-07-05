import "server-only"
import { getNeonPool } from "@/lib/neon"

type CacheEntry<T> = {
  expiresAt: number
  value: T
}

const localCache = new Map<string, CacheEntry<unknown>>()
const inFlight = new Map<string, Promise<unknown>>()

export function invalidatePortfolioCache(keyPrefix?: string) {
  if (!keyPrefix) {
    localCache.clear()
    return
  }

  for (const key of localCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      localCache.delete(key)
    }
  }
}

async function withCache<T>(cacheKey: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const cached = localCache.get(cacheKey) as CacheEntry<T> | undefined

  if (cached && cached.expiresAt > now) {
    return cached.value
  }

  const pending = inFlight.get(cacheKey) as Promise<T> | undefined
  if (pending) {
    return pending
  }

  const next = loader()
    .then((value) => {
      localCache.set(cacheKey, { value, expiresAt: Date.now() + ttlMs })
      return value
    })
    .finally(() => {
      inFlight.delete(cacheKey)
    })

  inFlight.set(cacheKey, next)
  return next
}

export interface ProfileDTO {
  id: string
  created: string
  updated: string
  full_name: string
  location: string
  phone: string
  email: string
  linkedin_url: string
  summary: string
  image?: string
  tags: string[]
}

export interface ProjectDTO {
  id: string
  created: string
  updated: string
  title: string
  description: string
  tools_used: string
  link: string
  profile: string
  image: string
  github: string
  demo: string
  aiTags: string[]
}

export interface PortfolioItemDTO {
  id: string
  name: string
  logo: string
  url: string
  category: string
  field: string
  description: string
  tags: string[]
  demoLink: string
  isCompanyProject: boolean
  comingSoon: boolean
}

export interface AssistantOwnerContextDTO {
  ownerName: string
  summary: string
  location: string
  email: string
  phone: string
  linkedin: string
  projects: Array<{
    title: string
    description: string
    tools: string[]
    tags: string[]
    link: string
    demo: string
    github: string
  }>
  portfolioByField: Record<string, number>
}

export async function getProfileFromNeon(): Promise<ProfileDTO | null> {
  return withCache("profile:latest", 5 * 60 * 1000, async () => {
    const pool = getNeonPool()
    const result = await pool.query(`
      SELECT
        COALESCE(p.source_pb_id, pi.source_pb_id, '') AS id,
        COALESCE(p.created_at::text, pi.created_at::text, '') AS created,
        COALESCE(p.updated_at::text, pi.updated_at::text, '') AS updated,
        COALESCE(p.full_name, pi.name, '') AS full_name,
        COALESCE(p.location, '') AS location,
        COALESCE(p.phone, '') AS phone,
        COALESCE(p.email, '') AS email,
        COALESCE(p.linkedin_url, '') AS linkedin_url,
        COALESCE(p.summary, pi.description, '') AS summary,
        COALESCE(pi.image_url, '/placeholder.svg?height=400&width=400') AS image,
        COALESCE(
          (SELECT array_agg(pit.tag_name ORDER BY pit.tag_name)
           FROM portfolio_item_tags pit
           WHERE pi.id IS NOT NULL AND pit.portfolio_item_id = pi.id),
          ARRAY[]::text[]
        ) AS tags
      FROM
        (SELECT * FROM profiles ORDER BY COALESCE(updated_at, created_at, inserted_at) DESC LIMIT 1) p
      FULL OUTER JOIN
        (SELECT * FROM portfolio_items WHERE field_type = 'profile' ORDER BY COALESCE(updated_at, created_at, inserted_at) DESC LIMIT 1) pi
        ON TRUE
      LIMIT 1
    `)

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    if (!row.id && !row.full_name && !row.summary) {
      return null
    }

    return {
      id: row.id ?? "",
      created: row.created ?? "",
      updated: row.updated ?? "",
      full_name: row.full_name ?? "",
      location: row.location ?? "",
      phone: row.phone ?? "",
      email: row.email ?? "",
      linkedin_url: row.linkedin_url ?? "",
      summary: row.summary ?? "",
      image: row.image ?? undefined,
      tags: Array.isArray(row.tags) ? row.tags.filter(Boolean) : [],
    }
  })
}

export async function getProjectsFromNeon(search?: string, profileId?: string): Promise<ProjectDTO[]> {
  const normalizedSearch = search?.trim() || null
  const normalizedProfile = profileId?.trim() || null
  const cacheKey = `projects:${normalizedSearch ?? "all"}:${normalizedProfile ?? "all"}`

  return withCache(cacheKey, 3 * 60 * 1000, async () => {
    const pool = getNeonPool()
    const result = await pool.query(
      `
        SELECT
          p.source_pb_id AS id,
          COALESCE(p.created_at::text, '') AS created,
          COALESCE(p.updated_at::text, '') AS updated,
          COALESCE(p.title, 'Untitled Project') AS title,
          COALESCE(p.description, 'No description available') AS description,
          COALESCE((SELECT string_agg(pt.tool_name, ',' ORDER BY pt.tool_name) FROM project_tools pt WHERE pt.project_id = p.id), '') AS tools_used,
          COALESCE(p.link, '') AS link,
          COALESCE(pr.source_pb_id, '') AS profile,
          COALESCE(p.image_url, '/placeholder.svg?height=300&width=600') AS image,
          COALESCE(p.github, '') AS github,
          COALESCE(p.demo, p.link, '') AS demo,
          COALESCE((SELECT array_agg(ptg.tag_name ORDER BY ptg.tag_name) FROM project_tags ptg WHERE ptg.project_id = p.id), ARRAY[]::text[]) AS ai_tags
        FROM projects p
        LEFT JOIN profiles pr ON pr.id = p.profile_id
        WHERE
          ($1::text IS NULL
            OR p.title ILIKE '%' || $1 || '%'
            OR p.description ILIKE '%' || $1 || '%'
            OR EXISTS (SELECT 1 FROM project_tools pt WHERE pt.project_id = p.id AND pt.tool_name ILIKE '%' || $1 || '%')
            OR EXISTS (SELECT 1 FROM project_tags ptg WHERE ptg.project_id = p.id AND ptg.tag_name ILIKE '%' || $1 || '%'))
          AND ($2::text IS NULL OR pr.source_pb_id = $2)
        ORDER BY COALESCE(p.updated_at, p.created_at, p.inserted_at) DESC
      `,
      [normalizedSearch, normalizedProfile],
    )

    return result.rows.map((row) => ({
      id: row.id ?? "",
      created: row.created ?? "",
      updated: row.updated ?? "",
      title: row.title ?? "Untitled Project",
      description: row.description ?? "No description available",
      tools_used: row.tools_used ?? "",
      link: row.link ?? "",
      profile: row.profile ?? "",
      image: row.image ?? "/placeholder.svg?height=300&width=600",
      github: row.github ?? "",
      demo: row.demo ?? "",
      aiTags: Array.isArray(row.ai_tags) ? row.ai_tags.filter(Boolean) : [],
    }))
  })
}

export async function getPortfolioItemsFromNeon(field?: string): Promise<PortfolioItemDTO[]> {
  const normalizedField = field?.trim() || null
  const cacheKey = `portfolio-items:${normalizedField ?? "all"}`

  return withCache(cacheKey, 5 * 60 * 1000, async () => {
    const pool = getNeonPool()
    const result = await pool.query(
      `
        SELECT
          pi.source_pb_id AS id,
          COALESCE(pi.name, '') AS name,
          COALESCE(pi.image_url, '/placeholder.svg?height=300&width=600') AS logo,
          COALESCE(pi.url, '') AS url,
          COALESCE(pi.category, '') AS category,
          COALESCE(pi.field_type, '') AS field,
          COALESCE(pi.description, '') AS description,
          COALESCE(pi.demo_link, '') AS demo_link,
          COALESCE(pi.is_company_project, FALSE) AS is_company_project,
          COALESCE(pi.coming_soon, FALSE) AS coming_soon,
          COALESCE(
            (SELECT array_agg(pit.tag_name ORDER BY pit.tag_name)
             FROM portfolio_item_tags pit
             WHERE pit.portfolio_item_id = pi.id),
            ARRAY[]::text[]
          ) AS tags
        FROM portfolio_items pi
        WHERE ($1::text IS NULL OR pi.field_type = $1)
        ORDER BY COALESCE(pi.updated_at, pi.created_at, pi.inserted_at) DESC
      `,
      [normalizedField],
    )

    return result.rows.map((row) => ({
      id: row.id ?? "",
      name: row.name ?? "",
      logo: row.logo ?? "/placeholder.svg?height=300&width=600",
      url: row.url ?? "",
      category: row.category ?? "",
      field: row.field ?? "",
      description: row.description ?? "",
      tags: Array.isArray(row.tags) ? row.tags.filter(Boolean) : [],
      demoLink: row.demo_link ?? "",
      isCompanyProject: Boolean(row.is_company_project),
      comingSoon: Boolean(row.coming_soon),
    }))
  })
}

export async function getOwnerAssistantContextFromNeon(): Promise<AssistantOwnerContextDTO> {
  return withCache("assistant-context:owner", 2 * 60 * 1000, async () => {
    const [profile, projects, portfolioItems] = await Promise.all([
      getProfileFromNeon(),
      getProjectsFromNeon(),
      getPortfolioItemsFromNeon(),
    ])

    const portfolioByField = portfolioItems.reduce<Record<string, number>>((acc, item) => {
      const key = item.field || "other"
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const normalizedProjects = projects.slice(0, 12).map((project) => ({
      title: project.title,
      description: project.description,
      tools: project.tools_used
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      tags: Array.isArray(project.aiTags) ? project.aiTags : [],
      link: project.link,
      demo: project.demo,
      github: project.github,
    }))

    return {
      ownerName: profile?.full_name || "Portfolio Owner",
      summary: profile?.summary || "",
      location: profile?.location || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      linkedin: profile?.linkedin_url || "",
      projects: normalizedProjects,
      portfolioByField,
    }
  })
}

export async function getOwnerAssistantPromptFromNeon(): Promise<string> {
  const context = await getOwnerAssistantContextFromNeon()
  const projectLines = context.projects
    .map((project, index) => {
      const tools = project.tools.length > 0 ? project.tools.join(", ") : "N/A"
      const tags = project.tags.length > 0 ? project.tags.join(", ") : "N/A"
      return `${index + 1}. ${project.title} | ${project.description} | tools: ${tools} | tags: ${tags} | demo: ${project.demo || "N/A"}`
    })
    .join("\n")

  const fieldLines = Object.entries(context.portfolioByField)
    .map(([field, count]) => `${field}: ${count}`)
    .join(", ")

  return [
    `Owner Name: ${context.ownerName}`,
    `Summary: ${context.summary || "N/A"}`,
    `Location: ${context.location || "N/A"}`,
    `Email: ${context.email || "N/A"}`,
    `Phone: ${context.phone || "N/A"}`,
    `LinkedIn: ${context.linkedin || "N/A"}`,
    `Portfolio sections (counts): ${fieldLines || "N/A"}`,
    "Projects:",
    projectLines || "No projects available.",
  ].join("\n")
}
