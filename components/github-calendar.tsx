"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CloudOff, Flame, Github, RefreshCw } from "lucide-react"

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

interface DayCell {
  date: string
  count: number
  weekday: number // 0 = Sun ... 6 = Sat
  isFuture: boolean
  isToday: boolean
}

interface Stats {
  total: number
  currentStreak: number
  longestStreak: number
  bestCount: number
  bestDate: string
}

const WEEKS_TO_SHOW = 53
const DAY_MS = 24 * 60 * 60 * 1000
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]

export default function GitHubCalendar() {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [contributionsMap, setContributionsMap] = useState<Map<string, number>>(new Map())
  const [hovered, setHovered] = useState<{ day: DayCell; x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMounted = useRef(true)

  const loadCalendar = useCallback(async () => {
    setLoaded(false)
    setError(false)

    try {
      const username = "BM-Ghost"
      const response = await fetch(`/api/github-contributions?username=${encodeURIComponent(username)}`)

      if (!response.ok) {
        throw new Error("Failed to fetch GitHub contributions")
      }

      const data: GitHubContributionData = await response.json()

      if (isMounted.current) {
        setContributionsMap(buildContributionsMap(data))
        setLoaded(true)
        setError(false)
      }
    } catch (err) {
      console.error("Error loading GitHub calendar:", err)

      if (isMounted.current) {
        setContributionsMap(new Map())
        setLoaded(true)
        setError(true)
      }
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    loadCalendar()

    return () => {
      isMounted.current = false
    }
  }, [loadCalendar])

  const weeks = useMemo(() => buildWeeks(contributionsMap, WEEKS_TO_SHOW), [contributionsMap])
  const flatDays = useMemo(() => weeks.flat(), [weeks])
  const stats = useMemo(() => computeStats(flatDays), [flatDays])
  const maxCount = useMemo(() => Math.max(...flatDays.map((d) => d.count), 1), [flatDays])
  const monthLabels = useMemo(() => buildMonthLabels(weeks), [weeks])

  const getColor = (count: number) => {
    if (count === 0) return "bg-slate-800/70"
    const ratio = count / maxCount
    if (ratio < 0.25) return "bg-violet-900"
    if (ratio < 0.5) return "bg-violet-600"
    if (ratio < 0.75) return "bg-fuchsia-500"
    return "bg-cyan-400"
  }

  const handleEnter = (day: DayCell, e: MouseEvent<HTMLButtonElement>) => {
    const containerRect = containerRef.current?.getBoundingClientRect()
    const targetRect = e.currentTarget.getBoundingClientRect()
    if (!containerRect) return
    setHovered({
      day,
      x: targetRect.left - containerRect.left + targetRect.width / 2,
      y: targetRect.top - containerRect.top,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg bg-gray-800/80 p-4 shadow-md backdrop-blur-sm sm:p-5"
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Days I <span className="text-purple-400">Code</span>
          </h2>
          <p className="mt-0.5 text-xs text-gray-400">Contribution activity, last 12 months</p>
        </div>
        <a
          href="https://github.com/BM-Ghost"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-purple-400 transition-colors hover:text-purple-300"
        >
          <Github className="h-3.5 w-3.5" />
          GitHub Profile
        </a>
      </div>

      {!loaded && (
        <div className="flex h-24 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
        </div>
      )}

      {loaded && error && <EmptyState onRetry={loadCalendar} />}

      {loaded && !error && (
        <div className="space-y-3">
          <div ref={containerRef} className="relative overflow-x-auto rounded-lg border border-white/10 bg-slate-900/60 p-3">
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-md border border-white/10 bg-slate-950 px-2.5 py-1.5 text-[11px] shadow-lg"
                  style={{ left: hovered.x, top: hovered.y }}
                >
                  <p className="font-semibold text-white">
                    {hovered.day.count} contribution{hovered.day.count === 1 ? "" : "s"}
                  </p>
                  <p className="text-gray-400">{formatFullDate(hovered.day.date)}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="min-w-max">
              <div
                className="mb-1 grid pl-7 text-[10px] text-gray-500"
                style={{ gridTemplateColumns: `repeat(${weeks.length}, 10px)`, columnGap: "3px" }}
              >
                {monthLabels.map((label) => (
                  <span key={label.index} style={{ gridColumnStart: label.index + 1 }}>
                    {label.month}
                  </span>
                ))}
              </div>

              <div className="flex gap-1">
                <div className="grid w-6 grid-rows-7 gap-[3px] text-[9px] leading-none text-gray-500">
                  {WEEKDAY_LABELS.map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>

                <div
                  className="grid grid-flow-col grid-rows-7 gap-[3px]"
                  style={{ gridTemplateColumns: `repeat(${weeks.length}, 10px)` }}
                >
                  {flatDays.map((day) =>
                    day.isFuture ? (
                      <div key={day.date} className="h-[10px] w-[10px]" />
                    ) : (
                      <button
                        key={day.date}
                        type="button"
                        aria-label={`${day.count} contributions on ${formatFullDate(day.date)}`}
                        onMouseEnter={(e) => handleEnter(day, e)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={(e) => handleEnter(day, e as unknown as MouseEvent<HTMLButtonElement>)}
                        onBlur={() => setHovered(null)}
                        className={`h-[10px] w-[10px] rounded-[2px] outline-none transition-transform hover:scale-125 focus-visible:scale-125 focus-visible:ring-1 focus-visible:ring-white/70 ${getColor(
                          day.count,
                        )} ${day.isToday ? "ring-1 ring-white/70" : ""}`}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-gray-500">
              <span>Less</span>
              <span className="h-2.5 w-2.5 rounded-[2px] bg-slate-800/70" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-violet-900" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-violet-600" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-fuchsia-500" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-cyan-400" />
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Total" value={stats.total.toLocaleString()} />
            <StatCard
              label="Current streak"
              value={`${stats.currentStreak}d`}
              icon={stats.currentStreak > 0 ? <Flame className="h-3 w-3 text-orange-400" /> : undefined}
            />
            <StatCard
              label="Best day"
              value={`${stats.bestCount}`}
              sub={stats.bestDate ? formatShortDate(stats.bestDate) : undefined}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string
  sub?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-white/10 bg-slate-900/60 px-2.5 py-2 text-center">
      <div className="flex items-center justify-center gap-1 text-sm font-semibold text-white">
        {icon}
        {value}
      </div>
      <p className="text-[10px] text-gray-500">{label}</p>
      {sub && <p className="text-[9px] text-gray-600">{sub}</p>}
    </div>
  )
}

function EmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-slate-900/60 px-4 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800">
        <CloudOff className="h-4 w-4 text-gray-500" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-300">Contribution data unavailable</p>
        <p className="text-xs text-gray-500">GitHub couldn&apos;t be reached right now.</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-slate-800 hover:text-white"
      >
        <RefreshCw className="h-3 w-3" />
        Try again
      </button>
    </div>
  )
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function buildContributionsMap(data: GitHubContributionData): Map<string, number> {
  const map = new Map<string, number>()
  data.contributions?.forEach((entry) => {
    if (!entry?.date) return
    map.set(entry.date, typeof entry.count === "number" ? entry.count : 0)
  })
  return map
}

function buildWeeks(map: Map<string, number>, weekCount: number): DayCell[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = toDateKey(today)

  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()))

  const totalDays = weekCount * 7
  const start = new Date(endOfWeek)
  start.setDate(endOfWeek.getDate() - totalDays + 1)

  const weeks: DayCell[][] = []
  let cursor = new Date(start)

  for (let w = 0; w < weekCount; w++) {
    const week: DayCell[] = []
    for (let d = 0; d < 7; d++) {
      const dateKey = toDateKey(cursor)
      week.push({
        date: dateKey,
        count: map.get(dateKey) ?? 0,
        weekday: cursor.getDay(),
        isFuture: cursor.getTime() > today.getTime(),
        isToday: dateKey === todayKey,
      })
      cursor = new Date(cursor.getTime() + DAY_MS)
    }
    weeks.push(week)
  }
  return weeks
}

function buildMonthLabels(weeks: DayCell[][]): Array<{ month: string; index: number }> {
  const labels: Array<{ month: string; index: number }> = []
  let lastMonth = -1
  weeks.forEach((week, i) => {
    const firstValidDay = week.find((d) => !d.isFuture)
    if (!firstValidDay) return
    const month = new Date(firstValidDay.date).getMonth()
    if (month !== lastMonth) {
      labels.push({
        month: new Date(firstValidDay.date).toLocaleString("en", { month: "short" }),
        index: i,
      })
      lastMonth = month
    }
  })
  return labels
}

function computeStats(days: DayCell[]): Stats {
  const validDays = days.filter((d) => !d.isFuture)
  const total = validDays.reduce((sum, d) => sum + d.count, 0)

  let currentStreak = 0
  for (let i = validDays.length - 1; i >= 0; i--) {
    if (validDays[i].count > 0) currentStreak++
    else break
  }

  let longestStreak = 0
  let running = 0
  for (const d of validDays) {
    if (d.count > 0) {
      running++
      longestStreak = Math.max(longestStreak, running)
    } else {
      running = 0
    }
  }

  let bestCount = 0
  let bestDate = ""
  for (const d of validDays) {
    if (d.count > bestCount) {
      bestCount = d.count
      bestDate = d.date
    }
  }

  return { total, currentStreak, longestStreak, bestCount, bestDate }
}

function formatFullDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatShortDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
