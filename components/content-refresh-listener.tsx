"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

const CHANNEL_NAME = "portfolio-content-updates"
const VERSION_ENDPOINT = "/api/content-version"
const POLL_INTERVAL_MS = 1_500

type ContentUpdateDetail = { version?: string }

/**
 * Keeps every open portfolio view in sync with Edit Bwire.
 *
 * BroadcastChannel updates tabs in the same browser immediately. The database
 * version poll covers other browsers, devices, and separate server instances.
 */
export default function ContentRefreshListener() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const versionRef = useRef<string | null>(null)
  const refreshInFlightRef = useRef(false)

  useEffect(() => {
    let disposed = false
    const channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(CHANNEL_NAME)

    const refreshContent = async (version?: string) => {
      if (disposed || refreshInFlightRef.current) return
      if (version) versionRef.current = version

      refreshInFlightRef.current = true
      try {
        // Invalidate active client queries, then rerender the current route so
        // all server components (About, Contact, Experience, Footer, etc.)
        // receive the new Neon data too.
        await queryClient.invalidateQueries()
        router.refresh()
      } finally {
        refreshInFlightRef.current = false
      }
    }

    const checkVersion = async () => {
      try {
        const response = await fetch(VERSION_ENDPOINT, { cache: "no-store" })
        if (!response.ok) return
        const payload = (await response.json()) as { version?: string }
        const version = payload.version || "0"

        if (versionRef.current === null) {
          versionRef.current = version
          return
        }

        if (version !== versionRef.current) {
          await refreshContent(version)
        }
      } catch {
        // A later poll recovers from a temporary network failure.
      }
    }

    const onLocalUpdate = (event: Event) => {
      const version = (event as CustomEvent<ContentUpdateDetail>).detail?.version
      channel?.postMessage({ version })
      void refreshContent(version)
    }

    const onChannelUpdate = (event: MessageEvent<ContentUpdateDetail>) => {
      void refreshContent(event.data?.version)
    }

    window.addEventListener("portfolio-content-updated", onLocalUpdate)
    channel?.addEventListener("message", onChannelUpdate)
    void checkVersion()
    const interval = window.setInterval(() => void checkVersion(), POLL_INTERVAL_MS)

    return () => {
      disposed = true
      window.clearInterval(interval)
      window.removeEventListener("portfolio-content-updated", onLocalUpdate)
      channel?.removeEventListener("message", onChannelUpdate)
      channel?.close()
    }
  }, [queryClient, router])

  return null
}
