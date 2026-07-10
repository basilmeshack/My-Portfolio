import "server-only"
import { createHash } from "crypto"
import { getNeonPool } from "@/lib/neon"

export function invalidatePortfolioCache(keyPrefix?: string) {
  // Public portfolio content is deliberately not kept in process memory. A
  // deployment can have more than one Node instance, and clearing a Map in
  // the instance that handled an edit does not clear the others. Keep this
  // function as the mutation boundary for callers, but make reads live.
  void keyPrefix
}

async function withCache<T>(cacheKey: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  // See invalidatePortfolioCache: process-local TTLs made freshly saved Neon
  // data appear stale on requests handled by another instance.
  void cacheKey
  void ttlMs
  return loader()
}

/**
 * A shared revision for CMS saves. Every edit updates the profile row, so its
 * modified_at value is a database-backed signal that works across browsers and
 * deployment instances without relying on process memory.
 */
export async function getPortfolioContentVersion(): Promise<string> {
  return withNeonFallback("getPortfolioContentVersion", "0", async () => {
    const pool = getNeonPool()
    const result = await pool.query(`
      SELECT COALESCE(MAX(modified_at)::text, '0') AS version
      FROM profiles
    `)

    return String(result.rows[0]?.version || "0")
  })
}

async function withNeonFallback<T>(operationName: string, fallbackValue: T, loader: () => Promise<T>): Promise<T> {
  try {
    return await loader()
  } catch (error) {
    console.error(`[portfolio-repository] ${operationName} failed`, error)
    return fallbackValue
  }
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
  github_url?: string
  summary: string
  image?: string
  tags: string[]
  contact_channels?: ProfileContactChannelDTO[]
}

export interface ProfileContactChannelDTO {
  id: string
  channel_type: string
  label: string
  handle: string
  value: string
  url: string
  is_public: boolean
  is_primary: boolean
  display_order: number
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
  github: string
  contactChannels: ProfileContactChannelDTO[]
  projects: Array<{
    title: string
    description: string
    tools: string[]
    tags: string[]
    link: string
    demo: string
    github: string
  }>
  experienceHighlights: Array<{
    roleTitle: string
    organization: string
    relatedProjects: string[]
  }>
  portfolioByField: Record<string, number>
}

export interface AssistantKnowledgeDocumentDTO {
  id: number
  documentType: string
  sourceTable: string
  sourceRecordKey: string
  title: string
  summary: string
  content: string
  keywords: string[]
  metadata: Record<string, unknown>
  contentHash: string
  embeddingModel: string
  embedding: number[]
  embeddingUpdatedAt: string
}

export interface AssistantKnowledgeEmbeddingUpdateDTO {
  id: number
  contentHash: string
  embeddingModel: string
  embedding: number[]
}

export async function getProfileFromNeon(): Promise<ProfileDTO | null> {
  return withCache("profile:latest", 5 * 60 * 1000, async () => {
    return withNeonFallback("getProfileFromNeon", null, async () => {
      const pool = getNeonPool()
      const result = await pool.query(`
        SELECT
          p.id AS profile_pk,
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

      const contactChannels = row.profile_pk ? await getProfileContactChannelsFromNeon(String(row.profile_pk)) : []
      const primaryEmail = contactChannels.find((channel) => channel.channel_type === "email" && channel.is_public)
      const primaryPhone = contactChannels.find((channel) => channel.channel_type === "phone" && channel.is_public)
      const primaryLinkedIn = contactChannels.find((channel) => channel.channel_type === "linkedin" && channel.is_public)
      const primaryGitHub = contactChannels.find((channel) => channel.channel_type === "github" && channel.is_public)

      return {
        id: row.id ?? "",
        created: row.created ?? "",
        updated: row.updated ?? "",
        full_name: row.full_name ?? "",
        location: row.location ?? "",
        phone: row.phone || primaryPhone?.handle || primaryPhone?.value || "",
        email: row.email || primaryEmail?.value || "",
        linkedin_url: row.linkedin_url || primaryLinkedIn?.url || primaryLinkedIn?.value || "",
        github_url: primaryGitHub?.url || primaryGitHub?.value || "",
        summary: row.summary ?? "",
        image: row.image ?? undefined,
        tags: Array.isArray(row.tags) ? row.tags.filter(Boolean) : [],
        contact_channels: contactChannels,
      }
    })
  })
}

export async function getProfileContactChannelsFromNeon(profileId?: string): Promise<ProfileContactChannelDTO[]> {
  const normalizedProfileId = profileId?.trim() || "latest"
  const cacheKey = `profile-contact-channels:${normalizedProfileId}`

  return withCache(cacheKey, 5 * 60 * 1000, async () => {
    return withNeonFallback("getProfileContactChannelsFromNeon", [], async () => {
      const pool = getNeonPool()
      const result = await pool.query(
        `
          WITH target_profile AS (
            SELECT id
            FROM profiles
            WHERE ($1::bigint IS NULL OR id = $1::bigint)
            ORDER BY COALESCE(updated_at, created_at, inserted_at) DESC, id DESC
            LIMIT 1
          )
          SELECT
            c.id::text AS id,
            COALESCE(c.channel_type, '') AS channel_type,
            COALESCE(c.label, '') AS label,
            COALESCE(c.handle, '') AS handle,
            COALESCE(c.value, '') AS value,
            COALESCE(c.url, '') AS url,
            COALESCE(c.is_public, FALSE) AS is_public,
            COALESCE(c.is_primary, FALSE) AS is_primary,
            COALESCE(c.display_order, 100) AS display_order
          FROM profile_contact_channels c
          JOIN target_profile tp ON tp.id = c.profile_id
          WHERE c.is_public = TRUE
          ORDER BY c.is_primary DESC, c.display_order ASC, c.id ASC
        `,
        [profileId ? Number(profileId) : null],
      )

      return result.rows.map((row: any) => ({
        id: row.id ?? "",
        channel_type: row.channel_type ?? "",
        label: row.label ?? "",
        handle: row.handle ?? "",
        value: row.value ?? "",
        url: row.url ?? "",
        is_public: Boolean(row.is_public),
        is_primary: Boolean(row.is_primary),
        display_order: Number(row.display_order ?? 100),
      }))
    })
  })
}

export async function getProjectsFromNeon(search?: string, profileId?: string): Promise<ProjectDTO[]> {
  const normalizedSearch = search?.trim() || null
  const normalizedProfile = profileId?.trim() || null
  const cacheKey = `projects:${normalizedSearch ?? "all"}:${normalizedProfile ?? "all"}`

  return withCache(cacheKey, 3 * 60 * 1000, async () => {
    return withNeonFallback("getProjectsFromNeon", [], async () => {
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
            COALESCE(
              (
                SELECT array_agg(tag_name ORDER BY tag_name)
                FROM (
                  SELECT DISTINCT ptg.tag_name AS tag_name
                  FROM project_tags ptg
                  WHERE ptg.project_id = p.id
                  UNION
                  SELECT DISTINCT pit.tag_name AS tag_name
                  FROM portfolio_items pi2
                  JOIN portfolio_item_tags pit ON pit.portfolio_item_id = pi2.id
                  WHERE pi2.project_id = p.id
                ) deduped_tags
              ),
              ARRAY[]::text[]
            ) AS ai_tags
          FROM projects p
          LEFT JOIN profiles pr ON pr.id = p.profile_id
          WHERE
            ($1::text IS NULL
              OR p.title ILIKE '%' || $1 || '%'
              OR p.description ILIKE '%' || $1 || '%'
              OR EXISTS (SELECT 1 FROM project_tools pt WHERE pt.project_id = p.id AND pt.tool_name ILIKE '%' || $1 || '%')
              OR EXISTS (SELECT 1 FROM project_tags ptg WHERE ptg.project_id = p.id AND ptg.tag_name ILIKE '%' || $1 || '%')
              OR EXISTS (
                SELECT 1
                FROM portfolio_items pi2
                JOIN portfolio_item_tags pit ON pit.portfolio_item_id = pi2.id
                WHERE pi2.project_id = p.id AND pit.tag_name ILIKE '%' || $1 || '%'
              ))
            AND ($2::text IS NULL OR pr.source_pb_id = $2)
          ORDER BY COALESCE(p.updated_at, p.created_at, p.inserted_at) DESC
        `,
        [normalizedSearch, normalizedProfile],
      )

      return result.rows.map((row: Record<string, unknown>) => {
        const aiTags = Array.isArray(row.ai_tags)
          ? row.ai_tags.filter((tag): tag is string => typeof tag === "string" && tag.trim() !== "")
          : []

        return {
          id: typeof row.id === "string" ? row.id : "",
          created: typeof row.created === "string" ? row.created : "",
          updated: typeof row.updated === "string" ? row.updated : "",
          title: typeof row.title === "string" ? row.title : "Untitled Project",
          description: typeof row.description === "string" ? row.description : "No description available",
          tools_used: typeof row.tools_used === "string" ? row.tools_used : "",
          link: typeof row.link === "string" ? row.link : "",
          profile: typeof row.profile === "string" ? row.profile : "",
          image: typeof row.image === "string" ? row.image : "/placeholder.svg?height=300&width=600",
          github: typeof row.github === "string" ? row.github : "",
          demo: typeof row.demo === "string" ? row.demo : "",
          aiTags,
        }
      })
    })
  })
}

export async function getPortfolioItemsFromNeon(field?: string): Promise<PortfolioItemDTO[]> {
  const normalizedField = field?.trim() || null
  const cacheKey = `portfolio-items:${normalizedField ?? "all"}`

  return withCache(cacheKey, 5 * 60 * 1000, async () => {
    return withNeonFallback("getPortfolioItemsFromNeon", [], async () => {
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

      return result.rows.map((row: Record<string, unknown>) => {
        const tags = Array.isArray(row.tags)
          ? row.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim() !== "")
          : []

        return {
          id: typeof row.id === "string" ? row.id : "",
          name: typeof row.name === "string" ? row.name : "",
          logo: typeof row.logo === "string" ? row.logo : "/placeholder.svg?height=300&width=600",
          url: typeof row.url === "string" ? row.url : "",
          category: typeof row.category === "string" ? row.category : "",
          field: typeof row.field === "string" ? row.field : "",
          description: typeof row.description === "string" ? row.description : "",
          tags,
          demoLink: typeof row.demo_link === "string" ? row.demo_link : "",
          isCompanyProject: Boolean(row.is_company_project),
          comingSoon: Boolean(row.coming_soon),
        }
      })
    })
  })
}

export async function getOwnerAssistantContextFromNeon(): Promise<AssistantOwnerContextDTO> {
  return withCache("assistant-context:owner", 2 * 60 * 1000, async () => {
    return withNeonFallback("getOwnerAssistantContextFromNeon", {
      ownerName: "Portfolio Owner",
      summary: "",
      location: "",
      email: "",
      phone: "",
      linkedin: "",
      github: "",
      contactChannels: [],
      projects: [],
      experienceHighlights: [],
      portfolioByField: {},
    }, async () => {
      const [profile, projects, portfolioItems] = await Promise.all([
        getProfileFromNeon(),
        getProjectsFromNeon(),
        getPortfolioItemsFromNeon(),
      ])

      const pool = getNeonPool()
      const experienceResult = await pool.query(
        `
          SELECT
            pe.role_title,
            pe.organization,
            COALESCE(
              (
                SELECT array_agg(p.title ORDER BY pep.display_order, p.title)
                FROM profile_experience_projects pep
                LEFT JOIN projects p ON p.id = pep.project_id
                WHERE pep.experience_id = pe.id
              ),
              ARRAY[]::text[]
            ) AS related_projects
          FROM profile_experiences pe
          WHERE pe.profile_id = $1
          ORDER BY COALESCE(pe.start_year, 9999) DESC, COALESCE(pe.start_month, 12) DESC, pe.display_order ASC, pe.id ASC
          LIMIT 12
        `,
        [profile?.id ? Number(profile.id) : null],
      )

      const experienceHighlights = experienceResult.rows.map((row: Record<string, unknown>) => ({
        roleTitle: typeof row.role_title === "string" ? row.role_title : "",
        organization: typeof row.organization === "string" ? row.organization : "",
        relatedProjects: Array.isArray(row.related_projects)
          ? row.related_projects.filter((value): value is string => typeof value === "string" && value.trim() !== "")
          : [],
      }))

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
        github: profile?.github_url || "",
        contactChannels: profile?.contact_channels || [],
        projects: normalizedProjects,
        experienceHighlights,
        portfolioByField,
      }
    })
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

function buildAssistantSearchTerms(query: string): string[] {
  return [...new Set(
    query
      .toLowerCase()
      .split(/[^a-z0-9.+#-]+/i)
      .map((term) => term.trim())
      .filter((term) => term.length >= 3)
      .flatMap((term) => {
        if (term.endsWith("s") && term.length > 4) {
          return [term, term.slice(0, -1)]
        }

        return [term]
      }),
  )]
}

function normalizeEmbedding(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry))
}

export async function searchAssistantKnowledgeFromNeon(
  query: string,
  limit = 6,
): Promise<AssistantKnowledgeDocumentDTO[]> {
  const normalizedQuery = query.trim()
  const normalizedLimit = Math.max(1, Math.min(limit, 12))
  const searchTerms = buildAssistantSearchTerms(normalizedQuery)
  const cacheKey = `assistant-knowledge:${normalizedQuery || "top"}:${normalizedLimit}`

  return withCache(cacheKey, 90 * 1000, async () => {
    return withNeonFallback("searchAssistantKnowledgeFromNeon", [], async () => {
      const pool = getNeonPool()
      const result = await pool.query(
        `
          WITH ranked_docs AS (
            SELECT
              id,
              document_type,
              source_table,
              source_record_key,
              title,
              COALESCE(summary, '') AS summary,
              content,
              COALESCE(keywords, ARRAY[]::text[]) AS keywords,
              COALESCE(metadata, '{}'::jsonb) AS metadata,
              COALESCE(content_hash, '') AS content_hash,
              COALESCE(embedding_model, '') AS embedding_model,
              embedding,
              COALESCE(embedding_updated_at::text, '') AS embedding_updated_at,
              modified_at,
              CASE
                WHEN NULLIF($1::text, '') IS NULL THEN 0
                ELSE ts_rank_cd(search_vector, websearch_to_tsquery('simple', $1))
              END AS score
            FROM assistant_knowledge_documents
            WHERE NULLIF($1::text, '') IS NULL
              OR search_vector @@ websearch_to_tsquery('simple', $1)
              OR title ILIKE '%' || $1 || '%'
              OR COALESCE(summary, '') ILIKE '%' || $1 || '%'
              OR COALESCE(content, '') ILIKE '%' || $1 || '%'
              OR EXISTS (
                SELECT 1
                FROM unnest(COALESCE(keywords, ARRAY[]::text[])) AS keyword
                WHERE keyword ILIKE '%' || $1 || '%'
              )
              OR EXISTS (
                SELECT 1
                FROM unnest($2::text[]) AS term
                WHERE title ILIKE '%' || term || '%'
                  OR COALESCE(summary, '') ILIKE '%' || term || '%'
                  OR COALESCE(content, '') ILIKE '%' || term || '%'
                  OR EXISTS (
                    SELECT 1
                    FROM unnest(COALESCE(keywords, ARRAY[]::text[])) AS keyword
                    WHERE keyword ILIKE '%' || term || '%'
                  )
              )
          )
          SELECT
            id,
            document_type,
            source_table,
            source_record_key,
            title,
            summary,
            content,
            keywords,
            metadata,
            content_hash,
            embedding_model,
            embedding,
            embedding_updated_at
          FROM ranked_docs
          ORDER BY
            CASE document_type
              WHEN 'profile' THEN 0
              WHEN 'project' THEN 1
              WHEN 'partner' THEN 2
              ELSE 3
            END,
            score DESC,
            modified_at DESC
          LIMIT $3
        `,
        [normalizedQuery, searchTerms, normalizedLimit],
      )

      return result.rows.map((row: any) => ({
        id: Number(row.id ?? 0),
        documentType: row.document_type ?? "",
        sourceTable: row.source_table ?? "",
        sourceRecordKey: row.source_record_key ?? "",
        title: row.title ?? "",
        summary: row.summary ?? "",
        content: row.content ?? "",
        keywords: Array.isArray(row.keywords) ? row.keywords.filter(Boolean) : [],
        metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
        contentHash: row.content_hash ?? "",
        embeddingModel: row.embedding_model ?? "",
        embedding: normalizeEmbedding(row.embedding),
        embeddingUpdatedAt: row.embedding_updated_at ?? "",
      }))
    })
  })
}

export async function listAssistantKnowledgeDocumentsFromNeon(limit?: number): Promise<AssistantKnowledgeDocumentDTO[]> {
  const normalizedLimit = typeof limit === "number" ? Math.max(1, Math.min(limit, 500)) : null
  const cacheKey = `assistant-knowledge-documents:${normalizedLimit ?? "all"}`

  return withCache(cacheKey, 60 * 1000, async () => {
    return withNeonFallback("listAssistantKnowledgeDocumentsFromNeon", [], async () => {
      const pool = getNeonPool()
      const result = await pool.query(
        `
          SELECT
            id,
            document_type,
            source_table,
            source_record_key,
            title,
            COALESCE(summary, '') AS summary,
            content,
            COALESCE(keywords, ARRAY[]::text[]) AS keywords,
            COALESCE(metadata, '{}'::jsonb) AS metadata,
            COALESCE(content_hash, '') AS content_hash,
            COALESCE(embedding_model, '') AS embedding_model,
            embedding,
            COALESCE(embedding_updated_at::text, '') AS embedding_updated_at
          FROM assistant_knowledge_documents
          ORDER BY
            CASE document_type
              WHEN 'profile' THEN 0
              WHEN 'project' THEN 1
              WHEN 'partner' THEN 2
              ELSE 3
            END,
            modified_at DESC,
            id DESC
          ${normalizedLimit ? 'LIMIT $1' : ''}
        `,
        normalizedLimit ? [normalizedLimit] : [],
      )

      return result.rows.map((row: any) => ({
        id: Number(row.id ?? 0),
        documentType: row.document_type ?? "",
        sourceTable: row.source_table ?? "",
        sourceRecordKey: row.source_record_key ?? "",
        title: row.title ?? "",
        summary: row.summary ?? "",
        content: row.content ?? "",
        keywords: Array.isArray(row.keywords) ? row.keywords.filter(Boolean) : [],
        metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
        contentHash: row.content_hash ?? "",
        embeddingModel: row.embedding_model ?? "",
        embedding: normalizeEmbedding(row.embedding),
        embeddingUpdatedAt: row.embedding_updated_at ?? "",
      }))
    })
  })
}

export async function refreshAssistantKnowledgeDocumentsInNeon(): Promise<void> {
  const pool = getNeonPool()
  await pool.query("SELECT refresh_assistant_knowledge_documents()")
  invalidatePortfolioCache("assistant-knowledge")
  invalidatePortfolioCache("assistant-context")
  invalidatePortfolioCache("assistant-knowledge-documents")
}

export async function updateAssistantKnowledgeEmbeddingsInNeon(
  updates: AssistantKnowledgeEmbeddingUpdateDTO[],
): Promise<void> {
  if (updates.length === 0) {
    return
  }

  const pool = getNeonPool()

  for (const update of updates) {
    await pool.query(
      `
        UPDATE assistant_knowledge_documents
        SET
          content_hash = $2,
          embedding_model = $3,
          embedding = $4::jsonb,
          embedding_updated_at = NOW(),
          modified_at = NOW()
        WHERE id = $1
      `,
      [update.id, update.contentHash, update.embeddingModel, JSON.stringify(update.embedding)],
    )
  }

  invalidatePortfolioCache("assistant-knowledge")
  invalidatePortfolioCache("assistant-knowledge-documents")
}

export function buildAssistantKnowledgeContentHash(document: Pick<AssistantKnowledgeDocumentDTO, "title" | "summary" | "content" | "keywords">): string {
  const payload = JSON.stringify({
    title: document.title,
    summary: document.summary,
    content: document.content,
    keywords: document.keywords,
  })

  return createHash("sha256").update(payload).digest("hex")
}

export async function getAssistantKnowledgeContextFromNeon(query: string): Promise<string> {
  const [ownerContext, documents, baselineDocuments] = await Promise.all([
    getOwnerAssistantContextFromNeon(),
    searchAssistantKnowledgeFromNeon(query, query.trim() ? 6 : 4),
    searchAssistantKnowledgeFromNeon("", 6),
  ])

  const mergedDocuments = [...documents]
  for (const document of baselineDocuments) {
    if (mergedDocuments.length >= 8) {
      break
    }

    const exists = mergedDocuments.some(
      (candidate) =>
        candidate.sourceTable === document.sourceTable && candidate.sourceRecordKey === document.sourceRecordKey,
    )

    if (!exists) {
      mergedDocuments.push(document)
    }
  }

  const fieldLines = Object.entries(ownerContext.portfolioByField)
    .map(([field, count]) => `${field}: ${count}`)
    .join(", ")

  const knowledgeLines = mergedDocuments
    .map((document, index) => {
      const keywords = document.keywords.length > 0 ? document.keywords.join(", ") : "N/A"
      const metadataEntries = Object.entries(document.metadata)
        .filter(([, value]) => {
          if (value == null) {
            return false
          }

          if (Array.isArray(value)) {
            return value.length > 0
          }

          return String(value).trim().length > 0
        })
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
        .join(" | ")

      return [
        `${index + 1}. [${document.documentType}] ${document.title}`,
        document.summary ? `Summary: ${document.summary}` : null,
        `Keywords: ${keywords}`,
        metadataEntries ? `Metadata: ${metadataEntries}` : null,
        `Content: ${document.content}`,
      ]
        .filter(Boolean)
        .join("\n")
    })
    .join("\n\n")

  return [
    `Owner Name: ${ownerContext.ownerName || "Portfolio Owner"}`,
    `Professional Summary: ${ownerContext.summary || "N/A"}`,
    `Location: ${ownerContext.location || "N/A"}`,
    `Email: ${ownerContext.email || "N/A"}`,
    `Phone: ${ownerContext.phone || "N/A"}`,
    `LinkedIn: ${ownerContext.linkedin || "N/A"}`,
    `Portfolio sections (counts): ${fieldLines || "N/A"}`,
    "Retrieved knowledge documents:",
    knowledgeLines || "No matching knowledge documents were found.",
  ].join("\n")
}
