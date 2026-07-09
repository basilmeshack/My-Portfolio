import "server-only"

import { randomUUID } from "crypto"
import { cookies } from "next/headers"
import { hashEditorPassword, verifyEditorPassword } from "@/lib/profile-editor-auth"
import { getNeonPool } from "@/lib/neon"
import {
  getProfileContactChannelsFromNeon,
  getProfileFromNeon,
  invalidatePortfolioCache,
  refreshAssistantKnowledgeDocumentsInNeon,
} from "@/lib/portfolio-repository"

export const PROFILE_EDITOR_COOKIE = "bwire_profile_editor"

export type EditableContactChannelType = "email" | "phone" | "linkedin" | "github" | "meeting"

export interface EditableContactChannel {
  channelType: EditableContactChannelType
  label: string
  handle: string
  value: string
  url: string
  displayOrder: number
}

export interface EditableProfileData {
  fullName: string
  location: string
  summary: string
  professionalBlurb: string
  aboutIntro: string
  aboutCurrentRole: string
  aboutHighlights: string[]
  aboutPreviousRole: string
  interests: string[]
  quote: string
  quoteAuthor: string
  contactChannels: EditableContactChannel[]
}

export interface EditableProjectData {
  id: number | null
  clientKey: string
  title: string
  description: string
  link: string
  github: string
  demo: string
  imageUrl: string
  tools: string[]
  tags: string[]
}

export interface EditablePortfolioItemData {
  id: number | null
  clientKey: string
  projectClientKey: string | null
  fieldType: string
  category: string
  name: string
  description: string
  url: string
  demoLink: string
  imageUrl: string
  isCompanyProject: boolean
  comingSoon: boolean
  tags: string[]
}

export interface EditableExperienceData {
  id: number | null
  roleTitle: string
  organization: string
  periodLabel: string
  responsibilitiesHtml: string
  achievementsHtml: string
  displayOrder: number
}

export interface EditableCmsData {
  profile: EditableProfileData
  projects: EditableProjectData[]
  portfolioItems: EditablePortfolioItemData[]
  experiences: EditableExperienceData[]
}

type RawProfileRow = {
  id: number
  full_name: string | null
  location: string | null
  summary: string | null
  about_payload: Record<string, unknown> | null
  edit_password_hash: string | null
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeRichText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((entry) => normalizeString(entry)).filter(Boolean)
}

function mapChannelsForEditor(channels: Awaited<ReturnType<typeof getProfileContactChannelsFromNeon>>): EditableContactChannel[] {
  return channels
    .filter((channel) => ["email", "phone", "linkedin", "github", "meeting"].includes(channel.channel_type))
    .map((channel) => ({
      channelType: channel.channel_type as EditableContactChannelType,
      label: channel.label,
      handle: channel.handle,
      value: channel.value,
      url: channel.url,
      displayOrder: channel.display_order,
    }))
}

function normalizeUniqueTextList(values: string[]): string[] {
  const normalized = values.map((entry) => entry.trim()).filter(Boolean)
  return [...new Set(normalized)]
}

async function getProjectsForEditor(profileId: number): Promise<EditableProjectData[]> {
  const pool = getNeonPool()
  const result = await pool.query(
    `
      SELECT
        p.id,
        COALESCE(p.title, '') AS title,
        COALESCE(p.description, '') AS description,
        COALESCE(p.link, '') AS link,
        COALESCE(p.github, '') AS github,
        COALESCE(p.demo, '') AS demo,
        COALESCE(p.image_url, '') AS image_url,
        COALESCE((SELECT array_agg(pt.tool_name ORDER BY pt.tool_name) FROM project_tools pt WHERE pt.project_id = p.id), ARRAY[]::text[]) AS tools,
        COALESCE((SELECT array_agg(ptg.tag_name ORDER BY ptg.tag_name) FROM project_tags ptg WHERE ptg.project_id = p.id), ARRAY[]::text[]) AS tags
      FROM projects p
      WHERE p.profile_id = $1
      ORDER BY COALESCE(p.updated_at, p.created_at, p.inserted_at) DESC, p.id DESC
    `,
    [profileId],
  )

  return result.rows.map((row: any) => ({
    id: Number(row.id),
    clientKey: `db-${row.id}`,
    title: row.title,
    description: row.description,
    link: row.link,
    github: row.github,
    demo: row.demo,
    imageUrl: row.image_url,
    tools: Array.isArray(row.tools) ? row.tools.filter(Boolean) : [],
    tags: Array.isArray(row.tags) ? row.tags.filter(Boolean) : [],
  }))
}

async function getPortfolioItemsForEditor(profileId: number): Promise<EditablePortfolioItemData[]> {
  const pool = getNeonPool()
  const result = await pool.query(
    `
      SELECT
        pi.id,
        pi.project_id,
        COALESCE(pi.field_type, '') AS field_type,
        COALESCE(pi.category, '') AS category,
        COALESCE(pi.name, '') AS name,
        COALESCE(pi.description, '') AS description,
        COALESCE(pi.url, '') AS url,
        COALESCE(pi.demo_link, '') AS demo_link,
        COALESCE(pi.image_url, '') AS image_url,
        COALESCE(pi.is_company_project, FALSE) AS is_company_project,
        COALESCE(pi.coming_soon, FALSE) AS coming_soon,
        COALESCE((SELECT array_agg(pit.tag_name ORDER BY pit.tag_name) FROM portfolio_item_tags pit WHERE pit.portfolio_item_id = pi.id), ARRAY[]::text[]) AS tags
      FROM portfolio_items pi
      WHERE pi.profile_id = $1
      ORDER BY COALESCE(pi.updated_at, pi.created_at, pi.inserted_at) DESC, pi.id DESC
    `,
    [profileId],
  )

  return result.rows.map((row: any) => ({
    id: Number(row.id),
    clientKey: `db-${row.id}`,
    projectClientKey: row.project_id ? `db-${row.project_id}` : null,
    fieldType: row.field_type,
    category: row.category,
    name: row.name,
    description: row.description,
    url: row.url,
    demoLink: row.demo_link,
    imageUrl: row.image_url,
    isCompanyProject: Boolean(row.is_company_project),
    comingSoon: Boolean(row.coming_soon),
    tags: Array.isArray(row.tags) ? row.tags.filter(Boolean) : [],
  }))
}

async function getExperiencesForEditor(profileId: number): Promise<EditableExperienceData[]> {
  const pool = getNeonPool()
  const result = await pool.query(
    `
      SELECT
        id,
        COALESCE(role_title, '') AS role_title,
        COALESCE(organization, '') AS organization,
        COALESCE(period_label, '') AS period_label,
        COALESCE(responsibilities_html, '') AS responsibilities_html,
        COALESCE(achievements_html, '') AS achievements_html,
        COALESCE(display_order, 100) AS display_order
      FROM profile_experiences
      WHERE profile_id = $1
      ORDER BY display_order ASC, id ASC
    `,
    [profileId],
  )

  return result.rows.map((row: any) => ({
    id: Number(row.id),
    roleTitle: row.role_title,
    organization: row.organization,
    periodLabel: row.period_label,
    responsibilitiesHtml: row.responsibilities_html,
    achievementsHtml: row.achievements_html,
    displayOrder: Number(row.display_order),
  }))
}

async function getProfileEditorRow(): Promise<RawProfileRow | null> {
  const pool = getNeonPool()
  const result = await pool.query(
    `
      SELECT
        id,
        full_name,
        location,
        summary,
        COALESCE(about_payload, '{}'::jsonb) AS about_payload,
        edit_password_hash
      FROM profiles
      ORDER BY COALESCE(updated_at, created_at, inserted_at) DESC, id DESC
      LIMIT 1
    `,
  )

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0] as RawProfileRow
}

export async function isProfileEditorAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(PROFILE_EDITOR_COOKIE)?.value || ""
  const profile = await getProfileEditorRow()
  if (!profile?.edit_password_hash) {
    return false
  }

  return sessionValue === profile.edit_password_hash
}

export async function authenticateProfileEditor(password: string): Promise<boolean> {
  const profile = await getProfileEditorRow()
  if (!profile?.edit_password_hash) {
    return false
  }

  const isValid = verifyEditorPassword(password, profile.edit_password_hash)
  if (!isValid) {
    return false
  }

  const cookieStore = await cookies()
  cookieStore.set(PROFILE_EDITOR_COOKIE, profile.edit_password_hash, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  })

  return true
}

export async function clearProfileEditorSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(PROFILE_EDITOR_COOKIE)
}

export async function getEditableProfileData(): Promise<EditableProfileData | null> {
  const profile = await getProfileEditorRow()
  if (!profile) {
    return null
  }

  const aboutPayload = profile.about_payload || {}
  const contactChannels = await getProfileContactChannelsFromNeon(String(profile.id))

  return {
    fullName: normalizeString(profile.full_name),
    location: normalizeString(profile.location),
    summary: normalizeString(profile.summary),
    professionalBlurb: normalizeString(aboutPayload.professionalBlurb),
    aboutIntro: normalizeString(aboutPayload.aboutIntro),
    aboutCurrentRole: normalizeString(aboutPayload.aboutCurrentRole),
    aboutHighlights: normalizeStringArray(aboutPayload.aboutHighlights),
    aboutPreviousRole: normalizeString(aboutPayload.aboutPreviousRole),
    interests: normalizeStringArray(aboutPayload.interests),
    quote: normalizeString(aboutPayload.quote),
    quoteAuthor: normalizeString(aboutPayload.quoteAuthor),
    contactChannels: mapChannelsForEditor(contactChannels),
  }
}

export async function getEditableCmsData(): Promise<EditableCmsData | null> {
  const profile = await getProfileEditorRow()
  if (!profile) {
    return null
  }

  const [profileData, projects, portfolioItems, experiences] = await Promise.all([
    getEditableProfileData(),
    getProjectsForEditor(profile.id),
    getPortfolioItemsForEditor(profile.id),
    getExperiencesForEditor(profile.id),
  ])

  if (!profileData) {
    return null
  }

  return {
    profile: profileData,
    projects,
    portfolioItems,
    experiences,
  }
}

export async function updateEditableProfileData(input: EditableProfileData & { newPassword?: string }): Promise<void> {
  const profile = await getProfileEditorRow()
  if (!profile) {
    throw new Error("Profile not found")
  }

  const pool = getNeonPool()
  const aboutPayload = {
    professionalBlurb: normalizeString(input.professionalBlurb),
    aboutIntro: normalizeString(input.aboutIntro),
    aboutCurrentRole: normalizeString(input.aboutCurrentRole),
    aboutHighlights: input.aboutHighlights.map((entry) => entry.trim()).filter(Boolean),
    aboutPreviousRole: normalizeString(input.aboutPreviousRole),
    interests: input.interests.map((entry) => entry.trim()).filter(Boolean),
    quote: normalizeString(input.quote),
    quoteAuthor: normalizeString(input.quoteAuthor),
  }

  const nextPasswordHash = input.newPassword?.trim()
    ? hashEditorPassword(input.newPassword.trim())
    : profile.edit_password_hash

  await pool.query("BEGIN")

  try {
    const emailChannel = input.contactChannels.find((channel) => channel.channelType === "email")
    const phoneChannel = input.contactChannels.find((channel) => channel.channelType === "phone")
    const linkedinChannel = input.contactChannels.find((channel) => channel.channelType === "linkedin")

    await pool.query(
      `
        UPDATE profiles
        SET
          full_name = $2,
          location = $3,
          summary = $4,
          email = $5,
          phone = $6,
          linkedin_url = $7,
          about_payload = $8::jsonb,
          edit_password_hash = $9,
          modified_at = NOW()
        WHERE id = $1
      `,
      [
        profile.id,
        normalizeString(input.fullName),
        normalizeString(input.location),
        normalizeString(input.summary),
        emailChannel?.value?.trim() || "",
        phoneChannel?.handle?.trim() || phoneChannel?.value?.trim() || "",
        linkedinChannel?.url?.trim() || linkedinChannel?.value?.trim() || "",
        JSON.stringify(aboutPayload),
        nextPasswordHash,
      ],
    )

    await pool.query("DELETE FROM profile_contact_channels WHERE profile_id = $1", [profile.id])

    for (const channel of input.contactChannels) {
      const value = channel.value.trim()
      if (!value) {
        continue
      }

      await pool.query(
        `
          INSERT INTO profile_contact_channels (
            profile_id,
            channel_type,
            label,
            handle,
            value,
            url,
            is_public,
            is_primary,
            display_order,
            raw_payload,
            modified_at
          ) VALUES (
            $1,$2,$3,$4,$5,$6,TRUE,TRUE,$7,$8::jsonb,NOW()
          )
        `,
        [
          profile.id,
          channel.channelType,
          channel.label.trim(),
          channel.handle.trim(),
          value,
          channel.url.trim(),
          channel.displayOrder,
          JSON.stringify({ source: "profile-editor" }),
        ],
      )
    }

    await pool.query("COMMIT")
  } catch (error) {
    await pool.query("ROLLBACK")
    throw error
  }

  invalidatePortfolioCache()
  await refreshAssistantKnowledgeDocumentsInNeon()

  if (nextPasswordHash && nextPasswordHash !== profile.edit_password_hash) {
    const cookieStore = await cookies()
    cookieStore.set(PROFILE_EDITOR_COOKIE, nextPasswordHash, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 8,
    })
  }
}

export async function updateEditableCmsData(input: EditableCmsData & { newPassword?: string }): Promise<void> {
  const profile = await getProfileEditorRow()
  if (!profile) {
    throw new Error("Profile not found")
  }

  const pool = getNeonPool()
  const profileInput = input.profile
  const aboutPayload = {
    professionalBlurb: normalizeRichText(profileInput.professionalBlurb),
    aboutIntro: normalizeRichText(profileInput.aboutIntro),
    aboutCurrentRole: normalizeRichText(profileInput.aboutCurrentRole),
    aboutHighlights: profileInput.aboutHighlights.map((entry) => entry.trim()).filter(Boolean),
    aboutPreviousRole: normalizeRichText(profileInput.aboutPreviousRole),
    interests: profileInput.interests.map((entry) => entry.trim()).filter(Boolean),
    quote: normalizeRichText(profileInput.quote),
    quoteAuthor: normalizeRichText(profileInput.quoteAuthor),
  }

  const nextPasswordHash = input.newPassword?.trim()
    ? hashEditorPassword(input.newPassword.trim())
    : profile.edit_password_hash

  await pool.query("BEGIN")

  try {
    const emailChannel = profileInput.contactChannels.find((channel) => channel.channelType === "email")
    const phoneChannel = profileInput.contactChannels.find((channel) => channel.channelType === "phone")
    const linkedinChannel = profileInput.contactChannels.find((channel) => channel.channelType === "linkedin")

    await pool.query(
      `
        UPDATE profiles
        SET
          full_name = $2,
          location = $3,
          summary = $4,
          email = $5,
          phone = $6,
          linkedin_url = $7,
          about_payload = $8::jsonb,
          edit_password_hash = $9,
          modified_at = NOW()
        WHERE id = $1
      `,
      [
        profile.id,
        normalizeString(profileInput.fullName),
        normalizeString(profileInput.location),
        normalizeString(profileInput.summary),
        emailChannel?.value?.trim() || "",
        phoneChannel?.handle?.trim() || phoneChannel?.value?.trim() || "",
        linkedinChannel?.url?.trim() || linkedinChannel?.value?.trim() || "",
        JSON.stringify(aboutPayload),
        nextPasswordHash,
      ],
    )

    await pool.query("DELETE FROM profile_contact_channels WHERE profile_id = $1", [profile.id])

    for (const channel of profileInput.contactChannels) {
      const value = channel.value.trim()
      if (!value) {
        continue
      }

      await pool.query(
        `
          INSERT INTO profile_contact_channels (
            profile_id,
            channel_type,
            label,
            handle,
            value,
            url,
            is_public,
            is_primary,
            display_order,
            raw_payload,
            modified_at
          ) VALUES (
            $1,$2,$3,$4,$5,$6,TRUE,TRUE,$7,$8::jsonb,NOW()
          )
        `,
        [
          profile.id,
          channel.channelType,
          channel.label.trim(),
          channel.handle.trim(),
          value,
          channel.url.trim(),
          channel.displayOrder,
          JSON.stringify({ source: "profile-editor" }),
        ],
      )
    }

    const existingProjectIds = input.projects
      .map((project) => project.id)
      .filter((id): id is number => typeof id === "number" && Number.isFinite(id))

    if (existingProjectIds.length > 0) {
      await pool.query(
        `
          DELETE FROM projects
          WHERE profile_id = $1
            AND id <> ALL($2::bigint[])
        `,
        [profile.id, existingProjectIds],
      )
    } else {
      await pool.query("DELETE FROM projects WHERE profile_id = $1", [profile.id])
    }

    const projectKeyToId = new Map<string, number>()

    for (const project of input.projects) {
      const title = project.title.trim()
      if (!title) {
        continue
      }

      const values = [
        title,
        normalizeRichText(project.description),
        project.link.trim(),
        project.github.trim(),
        project.demo.trim(),
        project.imageUrl.trim(),
      ]

      let projectId: number

      if (project.id && Number.isFinite(project.id)) {
        await pool.query(
          `
            UPDATE projects
            SET title = $2, description = $3, link = $4, github = $5, demo = $6, image_url = $7, modified_at = NOW()
            WHERE id = $1 AND profile_id = $8
          `,
          [project.id, ...values, profile.id],
        )
        projectId = project.id
      } else {
        const insertResult = await pool.query(
          `
            INSERT INTO projects (
              source_pb_id,
              profile_id,
              title,
              description,
              link,
              github,
              demo,
              image_url,
              raw_payload,
              inserted_at,
              modified_at
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,NOW(),NOW()
            )
            RETURNING id
          `,
          [
            `cms-project-${randomUUID()}`,
            profile.id,
            ...values,
            JSON.stringify({ source: "profile-editor" }),
          ],
        )
        projectId = Number(insertResult.rows[0].id)
      }

      projectKeyToId.set(project.clientKey, projectId)
      projectKeyToId.set(`db-${projectId}`, projectId)

      await pool.query("DELETE FROM project_tools WHERE project_id = $1", [projectId])
      for (const tool of normalizeUniqueTextList(project.tools)) {
        await pool.query("INSERT INTO project_tools (project_id, tool_name) VALUES ($1, $2) ON CONFLICT DO NOTHING", [projectId, tool])
      }

      await pool.query("DELETE FROM project_tags WHERE project_id = $1", [projectId])
      for (const tag of normalizeUniqueTextList(project.tags)) {
        await pool.query("INSERT INTO project_tags (project_id, tag_name) VALUES ($1, $2) ON CONFLICT DO NOTHING", [projectId, tag])
      }
    }

    const existingPortfolioItemIds = input.portfolioItems
      .map((item) => item.id)
      .filter((id): id is number => typeof id === "number" && Number.isFinite(id))

    if (existingPortfolioItemIds.length > 0) {
      await pool.query(
        `
          DELETE FROM portfolio_items
          WHERE profile_id = $1
            AND id <> ALL($2::bigint[])
        `,
        [profile.id, existingPortfolioItemIds],
      )
    } else {
      await pool.query("DELETE FROM portfolio_items WHERE profile_id = $1", [profile.id])
    }

    for (const item of input.portfolioItems) {
      const name = item.name.trim()
      if (!name) {
        continue
      }

      const linkedProjectId = item.projectClientKey ? projectKeyToId.get(item.projectClientKey) || null : null
      const values = [
        linkedProjectId,
        item.fieldType.trim(),
        item.category.trim(),
        name,
        normalizeRichText(item.description),
        item.url.trim(),
        item.demoLink.trim(),
        item.imageUrl.trim(),
        Boolean(item.isCompanyProject),
        Boolean(item.comingSoon),
      ]

      let itemId: number
      if (item.id && Number.isFinite(item.id)) {
        await pool.query(
          `
            UPDATE portfolio_items
            SET
              project_id = $2,
              field_type = $3,
              category = $4,
              name = $5,
              description = $6,
              url = $7,
              demo_link = $8,
              image_url = $9,
              is_company_project = $10,
              coming_soon = $11,
              modified_at = NOW()
            WHERE id = $1 AND profile_id = $12
          `,
          [item.id, ...values, profile.id],
        )
        itemId = item.id
      } else {
        const insertResult = await pool.query(
          `
            INSERT INTO portfolio_items (
              source_pb_id,
              project_id,
              profile_id,
              field_type,
              category,
              name,
              description,
              url,
              demo_link,
              image_url,
              is_company_project,
              coming_soon,
              raw_payload,
              inserted_at,
              modified_at
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,NOW(),NOW()
            )
            RETURNING id
          `,
          [
            `cms-portfolio-item-${randomUUID()}`,
            linkedProjectId,
            profile.id,
            item.fieldType.trim(),
            item.category.trim(),
            name,
            normalizeRichText(item.description),
            item.url.trim(),
            item.demoLink.trim(),
            item.imageUrl.trim(),
            Boolean(item.isCompanyProject),
            Boolean(item.comingSoon),
            JSON.stringify({ source: "profile-editor" }),
          ],
        )
        itemId = Number(insertResult.rows[0].id)
      }

      await pool.query("DELETE FROM portfolio_item_tags WHERE portfolio_item_id = $1", [itemId])
      for (const tag of normalizeUniqueTextList(item.tags)) {
        await pool.query(
          "INSERT INTO portfolio_item_tags (portfolio_item_id, tag_name) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [itemId, tag],
        )
      }
    }

    const existingExperienceIds = input.experiences
      .map((experience) => experience.id)
      .filter((id): id is number => typeof id === "number" && Number.isFinite(id))

    if (existingExperienceIds.length > 0) {
      await pool.query(
        `
          DELETE FROM profile_experiences
          WHERE profile_id = $1
            AND id <> ALL($2::bigint[])
        `,
        [profile.id, existingExperienceIds],
      )
    } else {
      await pool.query("DELETE FROM profile_experiences WHERE profile_id = $1", [profile.id])
    }

    for (const experience of input.experiences) {
      const roleTitle = experience.roleTitle.trim()
      if (!roleTitle) {
        continue
      }

      const values = [
        roleTitle,
        experience.organization.trim(),
        experience.periodLabel.trim(),
        normalizeRichText(experience.responsibilitiesHtml),
        normalizeRichText(experience.achievementsHtml),
        Number(experience.displayOrder) || 100,
      ]

      if (experience.id && Number.isFinite(experience.id)) {
        await pool.query(
          `
            UPDATE profile_experiences
            SET
              role_title = $2,
              organization = $3,
              period_label = $4,
              responsibilities_html = $5,
              achievements_html = $6,
              display_order = $7,
              modified_at = NOW()
            WHERE id = $1 AND profile_id = $8
          `,
          [experience.id, ...values, profile.id],
        )
      } else {
        await pool.query(
          `
            INSERT INTO profile_experiences (
              profile_id,
              role_title,
              organization,
              period_label,
              responsibilities_html,
              achievements_html,
              display_order,
              inserted_at,
              modified_at
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,NOW(),NOW()
            )
          `,
          [profile.id, ...values],
        )
      }
    }

    await pool.query("COMMIT")
  } catch (error) {
    await pool.query("ROLLBACK")
    throw error
  }

  invalidatePortfolioCache()
  await refreshAssistantKnowledgeDocumentsInNeon()

  if (nextPasswordHash && nextPasswordHash !== profile.edit_password_hash) {
    const cookieStore = await cookies()
    cookieStore.set(PROFILE_EDITOR_COOKIE, nextPasswordHash, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 8,
    })
  }
}

export async function getPublicExperienceEntries(): Promise<EditableExperienceData[]> {
  const profile = await getProfileEditorRow()
  if (!profile) {
    return []
  }

  return getExperiencesForEditor(profile.id)
}

export async function getPublicProfileAboutData() {
  const profile = await getProfileFromNeon()
  const editable = await getEditableProfileData()

  if (!profile || !editable) {
    return null
  }

  return {
    profile,
    editable,
  }
}
