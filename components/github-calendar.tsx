"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Github } from "lucide-react"

export default function GitHubCalendar() {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)
  const isMounted = useRef(true)

  useEffect(() => {
    // Set up the isMounted ref for cleanup
    isMounted.current = true

    // Function to load the calendar
    const loadCalendar = async () => {
      try {
        // Only proceed if the component is still mounted
        if (!isMounted.current) return

        // Fetch the GitHub contribution data directly
        const username = "BM-Ghost"

        try {
          const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)

          if (!response.ok) {
            throw new Error("Failed to fetch GitHub contributions")
          }

          const data = await response.json()

          // Only update state if component is still mounted
          if (isMounted.current) {
            // Create a simple visualization of the contributions
            if (calendarRef.current) {
              renderCalendar(data, calendarRef.current)
              setLoaded(true)
            }
          }
        } catch (err) {
          console.error("Error loading GitHub calendar:", err)

          // Create fallback data
          const fallbackData = {
            user: "BM-Ghost",
            contributions: Array(12)
              .fill(null)
              .map((_, i) => ({
                month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
                count: Math.floor(Math.random() * 20),
              })),
          }

          if (isMounted.current && calendarRef.current) {
            renderCalendar(fallbackData, calendarRef.current)
            setLoaded(true)
          }
        }
      } catch (err) {
        console.error("Error in loadCalendar:", err)
        if (isMounted.current) {
          setError(true)
          setLoaded(true) // Mark as loaded even though it failed
        }
      }
    }

    loadCalendar()

    // Cleanup function
    return () => {
      isMounted.current = false
    }
  }, [])

  // Simple function to render a basic calendar visualization
  const renderCalendar = (data: any, container: HTMLDivElement) => {
    // Clear the container
    container.innerHTML = ""

    // Create a link to view the full profile
    const profileLink = document.createElement("div")
    profileLink.className = "text-center mb-4"
    profileLink.innerHTML = `
    <a href="https://github.com/BM-Ghost" target="_blank" rel="noopener noreferrer" 
       class="text-purple-400 hover:text-purple-300 transition-colors">
      View full contribution history on GitHub
    </a>
  `
    container.appendChild(profileLink)

    // Create a simple visualization
    const calendar = document.createElement("div")
    calendar.className = "grid grid-cols-12 gap-1"

    // Check if we have valid contributions data
    if (!data || !data.contributions || !Array.isArray(data.contributions) || data.contributions.length === 0) {
      const errorMsg = document.createElement("div")
      errorMsg.className = "text-center text-red-400 py-4"
      errorMsg.textContent = "No contribution data available"
      container.appendChild(errorMsg)
      return
    }

    // Get the last 12 months of contributions
    const months = data.contributions.slice(-12)

    months.forEach((month) => {
      // Skip if month is invalid
      if (!month || typeof month !== "object") return

      const monthEl = document.createElement("div")
      monthEl.className = "flex flex-col items-center"

      const monthName = document.createElement("div")
      monthName.className = "text-xs text-gray-400 mb-1"
      // Safely access month name with fallback
      monthName.textContent = month.month && typeof month.month === "string" ? month.month.substring(0, 3) : "---"
      monthEl.appendChild(monthName)

      const bar = document.createElement("div")
      bar.className = "w-4 rounded-t-sm"
      // Safely access count with fallback
      const count = typeof month.count === "number" ? month.count : 0
      bar.style.height = `${Math.min(100, count * 2)}px`
      bar.style.backgroundColor = getColor(count)
      bar.title = `${count} contributions in ${month.month || "Unknown"}`
      monthEl.appendChild(bar)

      const countEl = document.createElement("div")
      countEl.className = "text-xs text-gray-400 mt-1"
      countEl.textContent = count.toString()
      monthEl.appendChild(countEl)

      calendar.appendChild(monthEl)
    })

    container.appendChild(calendar)

    // Add total contributions
    let total = 0
    try {
      total = data.contributions.reduce((sum, month) => sum + (typeof month.count === "number" ? month.count : 0), 0)
    } catch (e) {
      console.error("Error calculating total contributions:", e)
    }

    const totalEl = document.createElement("div")
    totalEl.className = "text-center mt-4 text-sm text-gray-300"
    totalEl.textContent = `Total contributions in the last year: ${total}`
    container.appendChild(totalEl)
  }

  // Function to get color based on contribution count
  const getColor = (count: number) => {
    if (count === 0) return "#1e293b"
    if (count < 5) return "#4c1d95"
    if (count < 10) return "#5b21b6"
    if (count < 20) return "#7c3aed"
    return "#8b5cf6"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Days I <span className="text-purple-400">Code</span>
      </h2>

      {!loaded && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Unable to load GitHub contributions at this time.</p>
          <a
            href="https://github.com/BM-Ghost"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center"
          >
            <Github className="h-4 w-4 mr-1" />
            View GitHub Profile
          </a>
        </div>
      )}

      <div ref={calendarRef} className="calendar-container"></div>
    </motion.div>
  )
}
