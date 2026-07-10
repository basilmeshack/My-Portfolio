"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, AlertCircle, X } from "lucide-react"

type SaveState = "idle" | "saving" | "success" | "error"

export interface SaveFeedback {
  state: SaveState
  message?: string
  error?: string
}

interface SaveFeedbackProps {
  feedback: SaveFeedback
  onDismiss?: () => void
}

export function SaveFeedbackIndicator({ feedback, onDismiss }: SaveFeedbackProps) {
  const [displayMessage, setDisplayMessage] = useState(feedback.message)
  const [isVisible, setIsVisible] = useState(feedback.state !== "idle")

  useEffect(() => {
    if (feedback.state === "idle") {
      const timer = setTimeout(() => setIsVisible(false), 500)
      return () => clearTimeout(timer)
    }

    setIsVisible(true)
    setDisplayMessage(feedback.message)

    if (feedback.state === "success") {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, 3000)
      return () => clearTimeout(timer)
    }

    if (feedback.message) {
      setDisplayMessage(feedback.message)
    }
  }, [feedback.state, feedback.message, onDismiss])

  if (!isVisible) return null

  const statusStyles =
    feedback.state === "saving"
      ? "border-blue-500/40 bg-slate-950/90 text-sky-200"
      : feedback.state === "success"
        ? "border-emerald-500/40 bg-emerald-950/95 text-emerald-200"
        : "border-rose-500/40 bg-rose-950/95 text-rose-200"

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className={`relative w-full max-w-xl rounded-3xl border p-8 shadow-2xl backdrop-blur-xl ${statusStyles}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {feedback.state === "saving" ? (
              <Loader2 className="h-8 w-8 animate-spin text-sky-300" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            )}
            <div>
              <p className="text-xl font-semibold text-white">
                {feedback.state === "saving"
                  ? "Updating profile to Neon..."
                  : feedback.state === "success"
                    ? "All updated fields were written to Neon successfully"
                    : "Could not save changes"}
              </p>
              <p className="mt-2 text-sm text-slate-300">{displayMessage || (feedback.state === "saving" ? "Please wait while your updates are persisted." : "You can close this dialog when ready.")}</p>
            </div>
          </div>
          {feedback.state !== "saving" ? (
            <button
              type="button"
              onClick={() => {
                setIsVisible(false)
                onDismiss?.()
              }}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function useSaveFeedback() {
  const [feedback, setFeedback] = useState<SaveFeedback>({ state: "idle" })

  const showSaving = (message?: string) => {
    setFeedback({ state: "saving", message })
  }

  const showSuccess = (message?: string) => {
    setFeedback({ state: "success", message })
  }

  const showError = (message?: string, error?: string) => {
    setFeedback({ state: "error", message, error })
  }

  const dismiss = () => {
    setFeedback({ state: "idle" })
  }

  return { feedback, showSaving, showSuccess, showError, dismiss }
}
