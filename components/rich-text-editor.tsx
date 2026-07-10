"use client"

import { useMemo, useRef, useEffect, useState } from "react"
import { sanitizeRichTextContent } from "@/lib/html-sanitizer"
import { Bold, Italic, Underline, Heading3, List, ListOrdered, Link2 } from "lucide-react"

const EDITOR_STYLES = `
  .rich-text-editor ul { list-style: disc; margin: 0.5rem 0 0.5rem 1.25rem; padding-left: 0.25rem; }
  .rich-text-editor ol { list-style: decimal; margin: 0.5rem 0 0.5rem 1.25rem; padding-left: 0.25rem; }
  .rich-text-editor li { margin: 0.25rem 0; }
  .rich-text-editor p { margin: 0.35rem 0; }
  .rich-text-editor h3 { font-size: 1.05rem; font-weight: 600; margin: 0.6rem 0 0.35rem; }
  .rich-text-editor a { color: #a78bfa; text-decoration: underline; }
`

type RichTextEditorProps = {
  label: string
  value: string
  onChange: (value: string) => void
  minHeightClassName?: string
  placeholder?: string
}

function toolbarButtonClass(active: boolean) {
  return `rounded-md border px-3 py-2 text-xs transition flex items-center gap-1 ${
    active
      ? "border-violet-400 bg-violet-500/20 text-violet-200"
      : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600"
  }`
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  minHeightClassName = "min-h-[180px]",
  placeholder,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      // Only update if content has changed to avoid cursor jumping
      const currentContent = editorRef.current.innerHTML
      if (currentContent === "<br>" || currentContent === "") {
        editorRef.current.innerHTML = value || ""
      }
    }
  }, [])

  const toolbar = useMemo(
    () => [
      { key: "bold", command: "bold", label: "Bold", icon: Bold },
      { key: "italic", command: "italic", label: "Italic", icon: Italic },
      { key: "underline", command: "underline", label: "Underline", icon: Underline },
      { key: "h3", command: "formatBlock", value: "h3", label: "Heading", icon: Heading3 },
      { key: "ul", command: "insertUnorderedList", label: "Bullet List", icon: List },
      { key: "ol", command: "insertOrderedList", label: "Numbered List", icon: ListOrdered },
      { key: "link", command: "addLink", label: "Add Link", icon: Link2 },
    ],
    [],
  )

  const runCommand = (command: string, commandValue?: string) => {
    if (!editorRef.current) return

    editorRef.current.focus()

    if (command === "addLink") {
      setIsAddingLink(!isAddingLink)
      if (!isAddingLink) {
        setLinkUrl("")
      }
      return
    }

    // Special handling for list commands to work better with pasted content
    if (command === "insertUnorderedList" || command === "insertOrderedList") {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        document.execCommand(command, false, commandValue)
        onChange(editorRef.current.innerHTML)
        return
      }

      const range = selection.getRangeAt(0)
      const listType = command === "insertUnorderedList" ? "ul" : "ol"

      // Get the common ancestor container
      let container: Node | null = range.commonAncestorContainer
      if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentElement ?? container
      }

      // If already in a list, toggle it off
      const listParent = (container instanceof Element ? container.closest("ul, ol") : null)
      if (listParent) {
        document.execCommand(command, false, commandValue)
        onChange(editorRef.current.innerHTML)
        return
      }

      // Try standard command first
      document.execCommand(command, false, commandValue)
      onChange(editorRef.current.innerHTML)
      return
    }

    document.execCommand(command, false, commandValue)
    // Don't sanitize on command - let browser handle undo/redo
    // Just report the change
    onChange(editorRef.current.innerHTML)
  }

  const handleInsertLink = () => {
    if (!linkUrl.trim() || !editorRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.toString().length === 0) {
      alert("Please select text to add a link")
      return
    }

    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`
    document.execCommand("createLink", false, url)

    // Don't sanitize immediately - let browser handle it
    // Sanitization happens on save
    onChange(editorRef.current.innerHTML)

    setIsAddingLink(false)
    setLinkUrl("")
    editorRef.current.focus()
  }

  const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
    const newContent = (event.currentTarget as HTMLDivElement).innerHTML
    const normalized = sanitizeRichTextContent(newContent)
    onChange(normalized)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        return
      }

      const range = selection.getRangeAt(0)
      const parentList = range.commonAncestorContainer.parentElement?.closest("ul, ol")
      if (parentList) {
        event.preventDefault()

        const currentItem = range.commonAncestorContainer.parentElement?.closest("li")
        if (currentItem) {
          const nextItem = document.createElement("li")
          nextItem.innerHTML = "<br>"
          currentItem.after(nextItem)
          const nextRange = document.createRange()
          nextRange.selectNodeContents(nextItem)
          nextRange.collapse(true)
          selection.removeAllRanges()
          selection.addRange(nextRange)
          onChange(editorRef.current?.innerHTML || "")
        }
      }
    }

    if (event.key === "Backspace") {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        return
      }

      const range = selection.getRangeAt(0)
      const currentItem = range.commonAncestorContainer.parentElement?.closest("li")
      if (currentItem && currentItem.textContent?.trim() === "") {
        event.preventDefault()
        currentItem.remove()
        onChange(editorRef.current?.innerHTML || "")
      }
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault()

    // Get plain text from clipboard
    const text = event.clipboardData.getData("text/plain")

    // Insert as plain text
    if (window.getSelection) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()

        // If text has multiple lines, convert to paragraphs
        const lines = text.split("\n").filter((line) => line.trim())
        if (lines.length > 1) {
          // Create a document fragment to preserve order
          const fragment = document.createDocumentFragment()
          lines.forEach((line) => {
            const p = document.createElement("p")
            p.textContent = line
            fragment.appendChild(p)
          })
          range.insertNode(fragment)
        } else {
          const textNode = document.createTextNode(text)
          range.insertNode(textNode)
        }

        // Position cursor at end
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }

    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      const sanitized = sanitizeRichTextContent(newContent)
      editorRef.current.innerHTML = sanitized
      onChange(sanitized)
    }
  }

  const checkCommandState = (command: string): boolean => {
    return document.queryCommandState(command)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-300">{label}</label>

      <style>{EDITOR_STYLES}</style>
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-zinc-800 bg-zinc-900/50 p-3 flex flex-wrap gap-2">
          {toolbar.map((item) => {
            const IconComponent = item.icon
            const isActive = item.command === "addLink" ? isAddingLink : checkCommandState(item.command)

            return (
              <button
                key={item.key}
                type="button"
                className={toolbarButtonClass(isActive)}
                onClick={() => runCommand(item.command, item.value)}
                title={item.label}
                aria-label={item.label}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Link Input */}
        {isAddingLink && (
          <div className="border-b border-zinc-800 bg-zinc-900/30 p-3 flex gap-2">
            <input
              type="text"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleInsertLink()
                } else if (e.key === "Escape") {
                  setIsAddingLink(false)
                }
              }}
              className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              autoFocus
            />
            <button
              type="button"
              onClick={handleInsertLink}
              className="rounded border border-violet-600 bg-violet-600/10 px-3 py-2 text-sm text-violet-300 hover:bg-violet-600/20 transition"
            >
              Insert
            </button>
            <button
              type="button"
              onClick={() => setIsAddingLink(false)}
              className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Editor */}
        <div
          ref={editorRef}
          className={`rich-text-editor w-full px-4 py-4 text-white outline-none bg-zinc-950 prose prose-invert prose-sm max-w-none ${minHeightClassName} ${
            isFocused ? "ring-1 ring-violet-500/50" : ""
          }`}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          role="textbox"
          aria-label={label}
          data-placeholder={placeholder}
          style={{
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        />
      </div>

      <p className="text-xs text-zinc-500">
        Supports <strong>bold</strong>, <em>italic</em>, <u>underline</u>, lists, headings, and links
      </p>
    </div>
  )
}
