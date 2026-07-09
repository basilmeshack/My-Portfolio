"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Github } from "lucide-react"

interface GitHubContributionData {
  total?: {
    lastYear?: number | null
  }
  contributions?: Array<{
    date?: string | null
    count?: number | null
    level?: number | null
  }>
}

interface DailyContribution {
  date: string
  count: number
}

interface MonthlyContribution {
  month: string
  count: number
}

export default function GitHubCalendar() {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [dailyData, setDailyData] = useState<DailyContribution[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyContribution[]>([])
  const [totalContributions, setTotalContributions] = useState(0)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true

    const loadCalendar = async () => {
      try {
        const username = "BM-Ghost"
        const response = await fetch(`/api/github-contributions?username=${encodeURIComponent(username)}`)

        if (!response.ok) {
          throw new Error("Failed to fetch GitHub contributions")
        }

        const data: GitHubContributionData = await response.json()

        if (isMounted.current) {
          const transformedDaily = transformToDailyData(data)
          const transformedMonthly = transformToMonthlyData(data)
          setDailyData(transformedDaily)
          setMonthlyData(transformedMonthly)
          setTotalContributions(calculateTotal(data))
          setLoaded(true)
          setError(false)
        }
      } catch (err) {
        console.error("Error loading GitHub calendar:", err)

        if (isMounted.current) {
          const fallbackData = getFallbackData()
          setDailyData(fallbackData.daily)
          setMonthlyData(fallbackData.monthly)
          setTotalContributions(fallbackData.monthly.reduce((sum, month) => sum + month.count, 0))
          setLoaded(true)
          setError(true)
        }
      }
    }

    loadCalendar()

    return () => {
      isMounted.current = false
    }
  }, [])

  const maxCount = useMemo(() => Math.max(...monthlyData.map((month) => month.count), 1), [monthlyData])
  const maxDailyCount = useMemo(() => Math.max(...dailyData.map((day) => day.count), 1), [dailyData])

  const getColor = (count: number) => {
    if (count === 0) return "bg-slate-800"
    if (count < 3) return "bg-violet-800"
    if (count < 6) return "bg-violet-600"
    if (count < 10) return "bg-fuchsia-500"
    return "bg-gradient-to-t from-purple-500 to-sky-400"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-md sm:p-5"
    >
      <div className="mb-4 flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Days I <span className="text-purple-400">Code</span>
          </h2>
          <p className="mt-1 text-sm text-gray-400">Recent coding activity over the last 12 months</p>
        </div>
        <a
          href="https://github.com/BM-Ghost"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 text-sm text-purple-400 transition-colors hover:text-purple-300"
        >
          <Github className="h-4 w-4" />
          View GitHub Profile
        </a>
      </div>

      {!loaded && (
        <div className="flex h-24 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"></div>
        </div>
      )}

      {loaded && (
        <div className="space-y-3">
          {error && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
              Showing fallback data while GitHub is temporarily unavailable.
            </div>
          )}

          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 sm:p-4">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Last year</p>
                <p className="text-2xl font-semibold text-white">{totalContributions}</p>
              </div>
              <div className="text-right text-sm text-gray-400">
                <p>Contributions</p>
                <p className="text-xs text-gray-500">Updated from GitHub</p>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
              <span className="h-3 w-3 rounded-sm bg-slate-800" /> Less
              <span className="h-3 w-3 rounded-sm bg-violet-800" />
              <span className="h-3 w-3 rounded-sm bg-violet-600" />
              <span className="h-3 w-3 rounded-sm bg-fuchsia-500" />
              <span className="h-3 w-3 rounded-sm bg-gradient-to-t from-purple-500 to-sky-400" /> More
            </div>

            <div className="grid grid-cols-7 gap-1 sm:grid-cols-14">
              {dailyData.map((day) => {
                const intensity = Math.max(0.2, day.count / maxDailyCount)
                return (
                  <div
                    key={day.date}
                    className={`h-3 w-3 rounded-sm ${getColor(day.count)}`}
                    style={{ opacity: intensity }}
                    title={`${day.count} contributions on ${day.date}`}
                  />
                )
              })}
            </div>

            <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-12">
              {monthlyData.map((item) => {
                const heightPercent = Math.max(12, Math.round((item.count / maxCount) * 100))

                return (
                  <div key={item.month} className="flex flex-col items-center gap-2">
                    <div className="flex h-20 w-full items-end justify-center rounded-md bg-slate-800/70 p-1">
                      <div
                        className={`w-full rounded-sm ${getColor(item.count)}`}
                        style={{ height: `${heightPercent}%` }}
                        title={`${item.count} contributions in ${item.month}`}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-medium text-gray-400">{item.month}</p>
                      <p className="text-[10px] text-gray-500">{item.count}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function transformToDailyData(data: GitHubContributionData): DailyContribution[] {
  return (data.contributions ?? [])
    .filter((entry): entry is { date: string; count: number; level?: number | null } => Boolean(entry?.date))
    .slice(-365)
    .map((entry) => ({
      date: entry.date,
      count: typeof entry.count === "number" ? entry.count : 0,
    }))
}

function transformToMonthlyData(data: GitHubContributionData): MonthlyContribution[] {
  const monthlyBuckets = new Map<string, number>()

  data.contributions?.forEach((entry) => {
    if (!entry?.date || typeof entry.date !== "string") return

    const monthKey = entry.date.slice(0, 7)
    const current = monthlyBuckets.get(monthKey) ?? 0
    const count = typeof entry.count === "number" ? entry.count : 0
    monthlyBuckets.set(monthKey, current + count)
  })

  return Array.from(monthlyBuckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([monthKey, count]) => ({
      month: new Date(`${monthKey}-01`).toLocaleString("en", { month: "short" }),
      count,
    }))
}

function calculateTotal(data: GitHubContributionData): number {
  return (
    data.contributions?.reduce<number>((sum, entry) => sum + (typeof entry?.count === "number" ? entry.count : 0), 0) ?? 0
  )
}

function getFallbackData(): { daily: DailyContribution[]; monthly: MonthlyContribution[] } {
  const daily = Array.from({ length: 90 }, (_, index) => ({
    date: `2025-01-${String(index % 28 + 1).padStart(2, "0")}`,
    count: Math.floor(Math.random() * 5),
  }))

  const monthly = Array.from({ length: 12 }, (_, index) => ({
    month: new Date(2024, index, 1).toLocaleString("en", { month: "short" }),
    count: Math.floor(Math.random() * 14),
  }))

  return { daily, monthly }
}
