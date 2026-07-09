"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import RichTextEditor from "@/components/rich-text-editor"

type ContactChannel = {
  channelType: "email" | "phone" | "linkedin" | "github" | "meeting"
  label: string
  handle: string
  value: string
  url: string
  displayOrder: number
}

type ProfileData = {
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
  contactChannels: ContactChannel[]
}

type ProjectData = {
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

type PortfolioItemData = {
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

type ExperienceData = {
  id: number | null
  roleTitle: string
  organization: string
  periodLabel: string
  responsibilitiesHtml: string
  achievementsHtml: string
  displayOrder: number
}

type CmsData = {
  profile: ProfileData
  projects: ProjectData[]
  portfolioItems: PortfolioItemData[]
  experiences: ExperienceData[]
}

const emptyProfile: ProfileData = {
  fullName: "",
  location: "",
  summary: "",
  professionalBlurb: "",
  aboutIntro: "",
  aboutCurrentRole: "",
  aboutHighlights: [],
  aboutPreviousRole: "",
  interests: [],
  quote: "",
  quoteAuthor: "",
  contactChannels: [
    { channelType: "email", label: "Primary Email", handle: "", value: "", url: "", displayOrder: 10 },
    { channelType: "phone", label: "Primary Phone", handle: "", value: "", url: "", displayOrder: 20 },
    { channelType: "linkedin", label: "LinkedIn", handle: "", value: "", url: "", displayOrder: 30 },
    { channelType: "github", label: "GitHub", handle: "", value: "", url: "", displayOrder: 40 },
    { channelType: "meeting", label: "Calendly", handle: "", value: "", url: "", displayOrder: 50 },
  ],
}

const emptyCmsData: CmsData = {
  profile: emptyProfile,
  projects: [],
  portfolioItems: [],
  experiences: [],
}

function parseLineList(value: string): string[] {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function parseCommaList(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function makeClientKey(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export default function ProfileEditorForm() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [cmsData, setCmsData] = useState<CmsData>(emptyCmsData)
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [aboutHighlightsText, setAboutHighlightsText] = useState("")
  const [interestsText, setInterestsText] = useState("")
  const [activeTab, setActiveTab] = useState<"profile" | "projects" | "portfolio" | "experience">("profile")

  const projectOptions = useMemo(
    () => cmsData.projects.map((project) => ({ key: project.clientKey, title: project.title || "Untitled project" })),
    [cmsData.projects],
  )

  useEffect(() => {
    startTransition(async () => {
      const response = await fetch("/api/profile/editbwire", { cache: "no-store" })
      if (!response.ok) {
        return
      }

      const payload = await response.json()
      if (!payload?.data) {
        return
      }

      hydrateCmsData(payload.data)
      setIsAuthenticated(true)
    })
  }, [])

  const hydrateCmsData = (data: CmsData) => {
    const normalizedProjects = (data.projects || []).map((project) => ({
      ...project,
      clientKey: project.clientKey || (project.id ? `db-${project.id}` : makeClientKey("project")),
      tools: project.tools || [],
      tags: project.tags || [],
    }))

    const normalizedPortfolio = (data.portfolioItems || []).map((item) => ({
      ...item,
      clientKey: item.clientKey || (item.id ? `db-${item.id}` : makeClientKey("portfolio")),
      tags: item.tags || [],
    }))

    setCmsData({
      profile: data.profile,
      projects: normalizedProjects,
      portfolioItems: normalizedPortfolio,
      experiences: data.experiences || [],
    })

    setAboutHighlightsText((data.profile.aboutHighlights || []).join("\n"))
    setInterestsText((data.profile.interests || []).join("\n"))
  }

  const updateProfile = <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    setCmsData((current) => ({
      ...current,
      profile: {
        ...current.profile,
        [field]: value,
      },
    }))
  }

  const updateChannel = (channelType: ContactChannel["channelType"], field: keyof ContactChannel, value: string) => {
    setCmsData((current) => ({
      ...current,
      profile: {
        ...current.profile,
        contactChannels: current.profile.contactChannels.map((channel) =>
          channel.channelType === channelType ? { ...channel, [field]: value } : channel,
        ),
      },
    }))
  }

  const addProject = () => {
    setCmsData((current) => ({
      ...current,
      projects: [
        {
          id: null,
          clientKey: makeClientKey("project"),
          title: "",
          description: "",
          link: "",
          github: "",
          demo: "",
          imageUrl: "",
          tools: [],
          tags: [],
        },
        ...current.projects,
      ],
    }))
  }

  const updateProject = (clientKey: string, patch: Partial<ProjectData>) => {
    setCmsData((current) => ({
      ...current,
      projects: current.projects.map((project) => (project.clientKey === clientKey ? { ...project, ...patch } : project)),
    }))
  }

  const removeProject = (clientKey: string) => {
    setCmsData((current) => {
      const nextProjects = current.projects.filter((project) => project.clientKey !== clientKey)
      const nextPortfolioItems = current.portfolioItems.map((item) =>
        item.projectClientKey === clientKey ? { ...item, projectClientKey: null } : item,
      )

      return {
        ...current,
        projects: nextProjects,
        portfolioItems: nextPortfolioItems,
      }
    })
  }

  const addPortfolioItem = () => {
    setCmsData((current) => ({
      ...current,
      portfolioItems: [
        {
          id: null,
          clientKey: makeClientKey("portfolio"),
          projectClientKey: null,
          fieldType: "projects",
          category: "",
          name: "",
          description: "",
          url: "",
          demoLink: "",
          imageUrl: "",
          isCompanyProject: false,
          comingSoon: false,
          tags: [],
        },
        ...current.portfolioItems,
      ],
    }))
  }

  const updatePortfolioItem = (clientKey: string, patch: Partial<PortfolioItemData>) => {
    setCmsData((current) => ({
      ...current,
      portfolioItems: current.portfolioItems.map((item) => (item.clientKey === clientKey ? { ...item, ...patch } : item)),
    }))
  }

  const removePortfolioItem = (clientKey: string) => {
    setCmsData((current) => ({
      ...current,
      portfolioItems: current.portfolioItems.filter((item) => item.clientKey !== clientKey),
    }))
  }

  const addExperience = () => {
    const nextOrder = (cmsData.experiences[cmsData.experiences.length - 1]?.displayOrder || 0) + 10
    setCmsData((current) => ({
      ...current,
      experiences: [
        ...current.experiences,
        {
          id: null,
          roleTitle: "",
          organization: "",
          periodLabel: "",
          responsibilitiesHtml: "",
          achievementsHtml: "",
          displayOrder: nextOrder,
        },
      ],
    }))
  }

  const updateExperience = (index: number, patch: Partial<ExperienceData>) => {
    setCmsData((current) => ({
      ...current,
      experiences: current.experiences.map((experience, currentIndex) =>
        currentIndex === index ? { ...experience, ...patch } : experience,
      ),
    }))
  }

  const removeExperience = (index: number) => {
    setCmsData((current) => ({
      ...current,
      experiences: current.experiences.filter((_, currentIndex) => currentIndex !== index),
    }))
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setMessage("")

    const response = await fetch("/api/profile/editbwire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(payload.error || "Failed to log in")
      return
    }

    if (!payload?.data) {
      setError("Failed to load editor data")
      return
    }

    hydrateCmsData(payload.data)
    setIsAuthenticated(true)
    setPassword("")
  }

  async function handleLogout() {
    await fetch("/api/profile/editbwire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logout: true }),
    })

    setIsAuthenticated(false)
    setCmsData(emptyCmsData)
    setAboutHighlightsText("")
    setInterestsText("")
    setNewPassword("")
    setMessage("")
    setError("")
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setMessage("")

    const payload: CmsData & { newPassword?: string } = {
      profile: {
        ...cmsData.profile,
        aboutHighlights: parseLineList(aboutHighlightsText),
        interests: parseLineList(interestsText),
      },
      projects: cmsData.projects,
      portfolioItems: cmsData.portfolioItems,
      experiences: cmsData.experiences,
      newPassword: newPassword.trim() || undefined,
    }

    const response = await fetch("/api/profile/editbwire", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(result.error || "Failed to save")
      return
    }

    if (!result?.data) {
      setError("Save succeeded but failed to reload data")
      return
    }

    hydrateCmsData(result.data)
    setNewPassword("")
    setMessage("Saved. All updated fields were written to Neon successfully.")
  }

  if (!isAuthenticated) {
    return (
      <form
        onSubmit={handleLogin}
        className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur"
      >
        <h1 className="mb-2 text-3xl font-semibold text-white">Bwire CMS</h1>
        <p className="mb-6 text-sm text-zinc-400">Login to manage profile, projects, experience, and portfolio data.</p>

        <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="editor-password">
          Password
        </label>
        <input title="Editor input"
          id="editor-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none ring-0"
          required
        />

        {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          className="w-full rounded-lg bg-violet-600 px-4 py-3 font-medium text-white hover:bg-violet-500"
        >
          Unlock Editor
        </button>
      </form>
    )
  }

  return (
    <form
      onSubmit={handleSave}
      className="mx-auto max-w-7xl space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Bwire CMS Workspace</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Manage all key Neon data in one module: profile text, contact channels, projects, portfolio items, and experience.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-2 rounded-xl border border-zinc-800 bg-zinc-950/70 p-2 sm:grid-cols-4">
        {[
          { key: "profile", label: "Profile + About" },
          { key: "projects", label: "Projects" },
          { key: "portfolio", label: "Portfolio Items" },
          { key: "experience", label: "Experience" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeTab === tab.key ? "bg-violet-600 text-white" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" ? (
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Full name</label>
              <input title="Editor input"
                value={cmsData.profile.fullName}
                onChange={(event) => updateProfile("fullName", event.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Location</label>
              <input title="Editor input"
                value={cmsData.profile.location}
                onChange={(event) => updateProfile("location", event.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Quote author</label>
              <input title="Editor input"
                value={cmsData.profile.quoteAuthor}
                onChange={(event) => updateProfile("quoteAuthor", event.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Summary</label>
            <textarea title="Editor textarea"
              value={cmsData.profile.summary}
              onChange={(event) => updateProfile("summary", event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
            />
          </div>

          <RichTextEditor
            label="Professional blurb"
            value={cmsData.profile.professionalBlurb}
            onChange={(value) => updateProfile("professionalBlurb", value)}
          />

          <RichTextEditor
            label="About intro"
            value={cmsData.profile.aboutIntro}
            onChange={(value) => updateProfile("aboutIntro", value)}
          />

          <RichTextEditor
            label="Current role story"
            value={cmsData.profile.aboutCurrentRole}
            onChange={(value) => updateProfile("aboutCurrentRole", value)}
            minHeightClassName="min-h-[220px]"
          />

          <RichTextEditor
            label="Previous role story"
            value={cmsData.profile.aboutPreviousRole}
            onChange={(value) => updateProfile("aboutPreviousRole", value)}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">About highlights (one per line)</label>
              <textarea title="Editor textarea"
                value={aboutHighlightsText}
                onChange={(event) => setAboutHighlightsText(event.target.value)}
                rows={7}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Interests (one per line)</label>
              <textarea title="Editor textarea"
                value={interestsText}
                onChange={(event) => setInterestsText(event.target.value)}
                rows={7}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Quote</label>
            <input title="Editor input"
              value={cmsData.profile.quote}
              onChange={(event) => updateProfile("quote", event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Contact Channels</h2>
            {cmsData.profile.contactChannels.map((channel) => (
              <div key={channel.channelType} className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 md:grid-cols-4">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wide text-zinc-500">Label</label>
                  <input title="Editor input"
                    value={channel.label}
                    onChange={(event) => updateChannel(channel.channelType, "label", event.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wide text-zinc-500">Handle</label>
                  <input title="Editor input"
                    value={channel.handle}
                    onChange={(event) => updateChannel(channel.channelType, "handle", event.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wide text-zinc-500">Value</label>
                  <input title="Editor input"
                    value={channel.value}
                    onChange={(event) => updateChannel(channel.channelType, "value", event.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wide text-zinc-500">URL</label>
                  <input title="Editor input"
                    value={channel.url}
                    onChange={(event) => updateChannel(channel.channelType, "url", event.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-md">
            <label className="mb-2 block text-sm text-zinc-300">Change editor password</label>
            <input title="Editor input"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
            />
          </div>
        </section>
      ) : null}

      {activeTab === "projects" ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Projects</h2>
            <button type="button" onClick={addProject} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">
              Add Project
            </button>
          </div>

          {cmsData.projects.map((project) => (
            <article key={project.clientKey} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-zinc-100">{project.title || "Untitled Project"}</h3>
                <button type="button" onClick={() => removeProject(project.clientKey)} className="rounded-md border border-red-500/40 px-3 py-1 text-sm text-red-300 hover:bg-red-500/10">
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Title</label>
                  <input title="Editor input" value={project.title} onChange={(event) => updateProject(project.clientKey, { title: event.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Image URL</label>
                  <input title="Editor input" value={project.imageUrl} onChange={(event) => updateProject(project.clientKey, { imageUrl: event.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Project link</label>
                  <input title="Editor input" value={project.link} onChange={(event) => updateProject(project.clientKey, { link: event.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">GitHub</label>
                  <input title="Editor input" value={project.github} onChange={(event) => updateProject(project.clientKey, { github: event.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-zinc-300">Demo URL</label>
                  <input title="Editor input" value={project.demo} onChange={(event) => updateProject(project.clientKey, { demo: event.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
              </div>

              <RichTextEditor
                label="Project story / description"
                value={project.description}
                onChange={(value) => updateProject(project.clientKey, { description: value })}
                minHeightClassName="min-h-[220px]"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Tools (comma-separated)</label>
                  <input title="Editor input"
                    value={project.tools.join(", ")}
                    onChange={(event) => updateProject(project.clientKey, { tools: parseCommaList(event.target.value) })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Tags (comma-separated)</label>
                  <input title="Editor input"
                    value={project.tags.join(", ")}
                    onChange={(event) => updateProject(project.clientKey, { tags: parseCommaList(event.target.value) })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
                  />
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {activeTab === "portfolio" ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Portfolio Items</h2>
            <button type="button" onClick={addPortfolioItem} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">
              Add Portfolio Item
            </button>
          </div>

          {cmsData.portfolioItems.map((item) => (
            <article key={item.clientKey} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-zinc-100">{item.name || "Untitled Portfolio Item"}</h3>
                <button type="button" onClick={() => removePortfolioItem(item.clientKey)} className="rounded-md border border-red-500/40 px-3 py-1 text-sm text-red-300 hover:bg-red-500/10">
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Name</label>
                  <input title="Editor input" value={item.name} onChange={(event) => updatePortfolioItem(item.clientKey, { name: event.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Category</label>
                  <input title="Editor input" value={item.category} onChange={(event) => updatePortfolioItem(item.clientKey, { category: event.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Field Type</label>
                  <input title="Editor input" value={item.fieldType} onChange={(event) => updatePortfolioItem(item.clientKey, { fieldType: event.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Linked Project</label>
                  <select title="Editor select" value={item.projectClientKey || ""} onChange={(event) => updatePortfolioItem(item.clientKey, { projectClientKey: event.target.value || null })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white">
                    <option value="">No linked project</option>
                    {projectOptions.map((project) => (
                      <option key={project.key} value={project.key}>{project.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">URL</label>
                  <input title="Editor input" value={item.url} onChange={(event) => updatePortfolioItem(item.clientKey, { url: event.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Demo URL</label>
                  <input title="Editor input" value={item.demoLink} onChange={(event) => updatePortfolioItem(item.clientKey, { demoLink: event.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-zinc-300">Image URL</label>
                  <input title="Editor input" value={item.imageUrl} onChange={(event) => updatePortfolioItem(item.clientKey, { imageUrl: event.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
              </div>

              <RichTextEditor label="Item story / description" value={item.description} onChange={(value) => updatePortfolioItem(item.clientKey, { description: value })} />

              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-zinc-300">Tags (comma-separated)</label>
                  <input title="Editor input" value={item.tags.join(", ")} onChange={(event) => updatePortfolioItem(item.clientKey, { tags: parseCommaList(event.target.value) })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
                <div className="flex items-end gap-6">
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input title="Editor input" type="checkbox" checked={item.isCompanyProject} onChange={(event) => updatePortfolioItem(item.clientKey, { isCompanyProject: event.target.checked })} />
                    Company Project
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input title="Editor input" type="checkbox" checked={item.comingSoon} onChange={(event) => updatePortfolioItem(item.clientKey, { comingSoon: event.target.checked })} />
                    Coming Soon
                  </label>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {activeTab === "experience" ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Experience Entries</h2>
            <button type="button" onClick={addExperience} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">
              Add Experience
            </button>
          </div>

          {cmsData.experiences.map((experience, index) => (
            <article key={`${experience.id || "new"}-${index}`} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-zinc-100">{experience.roleTitle || "Untitled Experience"}</h3>
                <button type="button" onClick={() => removeExperience(index)} className="rounded-md border border-red-500/40 px-3 py-1 text-sm text-red-300 hover:bg-red-500/10">
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Role Title</label>
                  <input title="Editor input" value={experience.roleTitle} onChange={(event) => updateExperience(index, { roleTitle: event.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Organization</label>
                  <input title="Editor input" value={experience.organization} onChange={(event) => updateExperience(index, { organization: event.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Period</label>
                  <input title="Editor input" value={experience.periodLabel} onChange={(event) => updateExperience(index, { periodLabel: event.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />
                </div>
              </div>

              <RichTextEditor label="Responsibilities" value={experience.responsibilitiesHtml} onChange={(value) => updateExperience(index, { responsibilitiesHtml: value })} />
              <RichTextEditor label="Achievements" value={experience.achievementsHtml} onChange={(value) => updateExperience(index, { achievementsHtml: value })} />
            </article>
          ))}
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-400">{message}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-violet-600 px-6 py-3 font-medium text-white hover:bg-violet-500 disabled:opacity-60"
      >
        Save All To Neon
      </button>
    </form>
  )
}
