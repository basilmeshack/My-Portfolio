"use client"

import { useMemo, useRef } from "react"

type RichTextEditorProps = {
  label: string
  value: string
  onChange: (value: string) => void
  minHeightClassName?: string
}

function toolbarButtonClass(active: boolean) {
  return `rounded-md border px-2 py-1 text-xs transition ${
    active ? "border-violet-400 bg-violet-500/20 text-violet-200" : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
  }`
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  minHeightClassName = "min-h-[140px]",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  const toolbar = useMemo(
    () => [
      { key: "bold", command: "bold", label: "Bold" },
      { key: "italic", command: "italic", label: "Italic" },
      { key: "underline", command: "underline", label: "Underline" },
      { key: "h3", command: "formatBlock", value: "h3", label: "H3" },
      { key: "p", command: "formatBlock", value: "p", label: "Body" },
      { key: "ul", command: "insertUnorderedList", label: "List" },
      { key: "ol", command: "insertOrderedList", label: "Numbered" },
    ],
    [],
  )

  const runCommand = (command: string, commandValue?: string) => {
    if (!editorRef.current) {
      return
    }

    editorRef.current.focus()
    document.execCommand(command, false, commandValue)
    onChange(editorRef.current.innerHTML)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm text-zinc-300">{label}</label>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {toolbar.map((item) => (
            <button
              key={item.key}
              type="button"
              className={toolbarButtonClass(false)}
              onClick={() => runCommand(item.command, item.value)}
              title={item.label}
              aria-label={item.label}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          ref={editorRef}
          className={`w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none ${minHeightClassName}`}
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: value || "<p></p>" }}
          onInput={(event) => onChange((event.currentTarget as HTMLDivElement).innerHTML)}
        />
      </div>
    </div>
  )
}
