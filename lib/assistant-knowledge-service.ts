import "server-only"

import { getOpenAIClient } from "@/lib/openai"
import {
  buildAssistantKnowledgeContentHash,
  getOwnerAssistantContextFromNeon,
  listAssistantKnowledgeDocumentsFromNeon,
  refreshAssistantKnowledgeDocumentsInNeon,
  searchAssistantKnowledgeFromNeon,
  type AssistantKnowledgeDocumentDTO,
  updateAssistantKnowledgeEmbeddingsInNeon,
} from "@/lib/portfolio-repository"

export interface AssistantKnowledgeRefreshResult {
  documentsCount: number
  embeddingsSynced: number
  embeddingModel: string | null
}

export interface AssistantKnowledgeSearchResult extends AssistantKnowledgeDocumentDTO {
  lexicalScore: number
  semanticScore: number
  blendedScore: number
}

const DEFAULT_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small"

function tokenizeQuery(query: string): string[] {
  return [...new Set(
    query
      .toLowerCase()
      .split(/[^a-z0-9.+#-]+/i)
      .map((term) => term.trim())
      .filter((term) => term.length >= 3),
  )]
}

function dotProduct(left: number[], right: number[]): number {
  if (left.length === 0 || right.length === 0 || left.length !== right.length) {
    return 0
  }

  let total = 0
  for (let index = 0; index < left.length; index += 1) {
    total += left[index] * right[index]
  }

  return total
}

function magnitude(vector: number[]): number {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0))
}

function cosineSimilarity(left: number[], right: number[]): number {
  const leftMagnitude = magnitude(left)
  const rightMagnitude = magnitude(right)

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0
  }

  return dotProduct(left, right) / (leftMagnitude * rightMagnitude)
}

function scoreLexicalMatch(document: AssistantKnowledgeDocumentDTO, query: string): number {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return 0
  }

  const haystack = [document.title, document.summary, document.content, document.keywords.join(" ")].join(" ").toLowerCase()
  const terms = tokenizeQuery(normalizedQuery)
  if (terms.length === 0) {
    return haystack.includes(normalizedQuery) ? 1 : 0
  }

  const matches = terms.filter((term) => haystack.includes(term)).length
  return matches / terms.length
}

async function createEmbedding(text: string, model = DEFAULT_EMBEDDING_MODEL): Promise<number[]> {
  const client = getOpenAIClient()
  const response = await client.embeddings.create({
    model,
    input: text,
  })

  return response.data[0]?.embedding ?? []
}

function buildEmbeddingInput(document: Pick<AssistantKnowledgeDocumentDTO, "title" | "summary" | "content" | "keywords">): string {
  return [
    document.title,
    document.summary,
    document.content,
    document.keywords.join(", "),
  ]
    .filter(Boolean)
    .join("\n")
}

export async function refreshAssistantKnowledge(options?: {
  syncEmbeddings?: boolean
  limitEmbeddings?: number
}): Promise<AssistantKnowledgeRefreshResult> {
  await refreshAssistantKnowledgeDocumentsInNeon()

  let embeddingsSynced = 0
  let embeddingModel: string | null = null

  if (options?.syncEmbeddings !== false && process.env.OPENAI_API_KEY) {
    const syncResult = await syncAssistantKnowledgeEmbeddings({ limit: options?.limitEmbeddings })
    embeddingsSynced = syncResult.embeddingsSynced
    embeddingModel = syncResult.embeddingModel
  }

  const documents = await listAssistantKnowledgeDocumentsFromNeon()

  return {
    documentsCount: documents.length,
    embeddingsSynced,
    embeddingModel,
  }
}

export async function syncAssistantKnowledgeEmbeddings(options?: {
  limit?: number
}): Promise<{ embeddingsSynced: number; embeddingModel: string | null }> {
  if (!process.env.OPENAI_API_KEY) {
    return { embeddingsSynced: 0, embeddingModel: null }
  }

  const embeddingModel = DEFAULT_EMBEDDING_MODEL
  const documents = await listAssistantKnowledgeDocumentsFromNeon(options?.limit)
  const pendingDocuments = documents.filter((document) => {
    const contentHash = buildAssistantKnowledgeContentHash(document)
    return document.embeddingModel !== embeddingModel || document.contentHash !== contentHash || document.embedding.length === 0
  })

  const updates = []
  for (const document of pendingDocuments) {
    const contentHash = buildAssistantKnowledgeContentHash(document)
    const embedding = await createEmbedding(buildEmbeddingInput(document), embeddingModel)
    updates.push({
      id: document.id,
      contentHash,
      embeddingModel,
      embedding,
    })
  }

  await updateAssistantKnowledgeEmbeddingsInNeon(updates)

  return {
    embeddingsSynced: updates.length,
    embeddingModel,
  }
}

export async function getAssistantKnowledgeContext(query: string): Promise<string> {
  const [ownerContext, relevantDocuments] = await Promise.all([
    getOwnerAssistantContextFromNeon(),
    searchAssistantKnowledge(query),
  ])

  const fieldLines = Object.entries(ownerContext.portfolioByField)
    .map(([field, count]) => `${field}: ${count}`)
    .join(", ")

  const experienceLines = ownerContext.experienceHighlights.length > 0
    ? ownerContext.experienceHighlights
        .map((experience) => {
          const relatedProjects = experience.relatedProjects.length > 0 ? experience.relatedProjects.join(", ") : "No linked projects"
          return `${experience.roleTitle} @ ${experience.organization} -> ${relatedProjects}`
        })
        .join("\n")
    : "No experience highlights available."

  const knowledgeLines = relevantDocuments
    .map((document, index) => {
      const keywords = document.keywords.length > 0 ? document.keywords.join(", ") : "N/A"
      const metadataEntries = Object.entries(document.metadata)
        .filter(([, value]) => value != null && (!Array.isArray(value) || value.length > 0) && String(value).trim().length > 0)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
        .join(" | ")

      return [
        `${index + 1}. [${document.documentType}] ${document.title}`,
        document.summary ? `Summary: ${document.summary}` : null,
        `Keywords: ${keywords}`,
        `Scores: lexical=${document.lexicalScore.toFixed(2)}, semantic=${document.semanticScore.toFixed(2)}, blended=${document.blendedScore.toFixed(2)}`,
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
    `GitHub: ${ownerContext.github || "N/A"}`,
    `Contact Channels: ${ownerContext.contactChannels.length > 0 ? ownerContext.contactChannels.map((channel) => `${channel.label}: ${channel.url || channel.value}`).join(" | ") : "N/A"}`,
    `Portfolio sections (counts): ${fieldLines || "N/A"}`,
    `Experience highlights: ${experienceLines}`,
    "Retrieved knowledge documents:",
    knowledgeLines || "No matching knowledge documents were found.",
  ].join("\n")
}

export async function searchAssistantKnowledge(query: string, limit = 8): Promise<AssistantKnowledgeSearchResult[]> {
  const normalizedLimit = Math.max(1, Math.min(limit, 12))
  const [lexicalDocuments, baselineDocuments] = await Promise.all([
    searchAssistantKnowledgeFromNeon(query, query.trim() ? normalizedLimit : Math.min(normalizedLimit, 4)),
    searchAssistantKnowledgeFromNeon("", normalizedLimit),
  ])

  const mergedDocuments = [...lexicalDocuments]
  for (const document of baselineDocuments) {
    if (mergedDocuments.length >= normalizedLimit) {
      break
    }

    const exists = mergedDocuments.some(
      (candidate) => candidate.sourceTable === document.sourceTable && candidate.sourceRecordKey === document.sourceRecordKey,
    )

    if (!exists) {
      mergedDocuments.push(document)
    }
  }

  const queryEmbedding = process.env.OPENAI_API_KEY && query.trim() ? await createEmbedding(query.trim()) : []

  return mergedDocuments
    .map((document) => {
      const lexicalScore = scoreLexicalMatch(document, query)
      const semanticScore = queryEmbedding.length > 0 && document.embedding.length > 0 ? cosineSimilarity(queryEmbedding, document.embedding) : 0
      const blendedScore = lexicalScore * 0.65 + semanticScore * 0.35

      return {
        ...document,
        lexicalScore,
        semanticScore,
        blendedScore,
      }
    })
    .sort((left, right) => right.blendedScore - left.blendedScore)
    .slice(0, normalizedLimit)
}