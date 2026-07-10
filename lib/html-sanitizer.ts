/**
 * Sanitizes HTML content from rich text editors and Word documents.
 * Removes all inline styles, Word-specific markup, and normalizes the HTML.
 */

const WORD_MARKUP_PATTERNS = [
  /data-ccp-props="[^"]*"/gi,
  /data-contrast="[^"]*"/gi,
  /xml:lang="[^"]*"/gi,
  /lang="[^"]*"/gi,
  /class="[^"]*"/gi,
  /<span[^>]*class="(EOP|TextRun|NormalTextRun|SelectionWithBorder|[^"]*SCXW[^"]*)"[^>]*>/gi,
  /margin:\s*[^;]*;/gi,
  /padding:\s*[^;]*;/gi,
  /-webkit-user-drag:\s*[^;]*;/gi,
  /font-variant-ligatures:\s*[^;]*;/gi,
  /border-color:\s*[^;]*;/gi,
  /border-width:\s*[^;]*;/gi,
]

export function cleanHtmlFromWord(html: string): string {
  if (!html) return ""

  let cleaned = html

  // Remove Word-specific markup
  WORD_MARKUP_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, "")
  })

  // Remove empty span tags
  cleaned = cleaned.replace(/<span[^>]*>\s*<\/span>/gi, "")

  // Unwrap spans that only have remaining attributes
  cleaned = cleaned.replace(/<span[^>]*>/gi, "")
  cleaned = cleaned.replace(/<\/span>/gi, "")

  // If the content contains headings, lists, links, or semantic inline tags,
  // avoid forcing paragraph reconstruction because that will strip those tags
  // and remove intended formatting.
  if (/<\/?(h[1-6]|ul|ol|li|strong|b|em|i|u|a)[^>]*>/i.test(cleaned)) {
    // Clean up excessive line breaks and normalize whitespace, then return
    cleaned = cleaned.replace(/<br\s*\/?>(\s*<br\s*\/?\>)/gi, "<br />")
    cleaned = cleaned.replace(/<br\s*\/?>(\s*<p[^>]*>)/gi, "$1")
    cleaned = cleaned.replace(/>\s+</g, "><")
    cleaned = cleaned.replace(/\s+/g, " ")
    return cleaned.trim()
  }

  // Remove empty paragraphs but keep at least one
  const paragraphs = cleaned.split(/<\/?p[^>]*>/gi).filter((p) => p.trim())
  if (paragraphs.length === 0) {
    return "<p></p>"
  }

  // Reconstruct paragraphs
  cleaned = "<p>" + paragraphs.map((p) => p.trim()).join("</p><p>") + "</p>"

  // Clean up excessive line breaks
  cleaned = cleaned.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "<br />")
  cleaned = cleaned.replace(/<\/p>\s*<br\s*\/?>/, "</p>")
  cleaned = cleaned.replace(/<br\s*\/?>(\s*<p[^>]*>)/gi, "$1")

  // Normalize whitespace within tags
  cleaned = cleaned.replace(/>(\s+)</g, "><")
  cleaned = cleaned.replace(/\s+/g, " ")

  return cleaned.trim()
}

export function sanitizeRichTextContent(html: string): string {
  if (!html) return ""

  // First pass: remove Word markup
  let cleaned = cleanHtmlFromWord(html)

  // Server-side post-processing (no DOM available): unwrap lists from paragraphs
  // and remove empty paragraphs so saved HTML is valid when rendered later.
  if (typeof document === "undefined") {
    cleaned = cleaned.replace(/<p>\s*(<(?:ul|ol)[\s\S]*?<\/(?:ul|ol)>)\s*<\/p>/gi, "$1")
    cleaned = cleaned.replace(/<p>\s*(<(?:div)[\s\S]*?<\/(?:div)>)\s*<\/p>/gi, "$1")
    cleaned = cleaned.replace(/<p>\s*<br\s*\/?>(\s*<br\s*\/?\>)*/gi, "<br />")
    cleaned = cleaned.replace(/<p>\s*<\/p>/gi, "")
  }

  // Create a temporary container to parse HTML properly
  if (typeof document !== "undefined") {
    const container = document.createElement("div")
    container.innerHTML = cleaned

    // Remove any scripts or dangerous elements
    const dangerousElements = container.querySelectorAll(
      "script, style, link, meta, iframe, object, embed, [onclick], [onload], [onerror]"
    )
    dangerousElements.forEach((el) => el.remove())

    // Convert inline style-based formatting (common from Word/paste)
    // into semantic tags so formatting is preserved after we strip styles.
    const convertInlineStylesToSemantic = (root: HTMLElement) => {
      const nodesWithStyle = Array.from(root.querySelectorAll("*[style]")) as HTMLElement[]
      nodesWithStyle.forEach((el) => {
        const style = (el.getAttribute("style") || "").toLowerCase()
        const inner = el.innerHTML
        let node: HTMLElement | null = null

        const isBold = /font-weight:\s*(bold|700|800|900|bolder)/i.test(style)
        const isItalic = /font-style:\s*italic/i.test(style)
        const isUnderline = /text-decoration:\s*underline/i.test(style)

        if (isBold) {
          const s = document.createElement("strong")
          s.innerHTML = inner
          node = s
        }

        if (isItalic) {
          const e = document.createElement("em")
          if (node) {
            e.innerHTML = node.outerHTML
          } else {
            e.innerHTML = inner
          }
          node = e
        }

        if (isUnderline) {
          const u = document.createElement("u")
          if (node) {
            u.innerHTML = node.outerHTML
          } else {
            u.innerHTML = inner
          }
          node = u
        }

        if (node) {
          el.replaceWith(node)
          return
        }

        // If no semantic conversion, unwrap the element but keep children
        const frag = document.createDocumentFragment()
        while (el.firstChild) frag.appendChild(el.firstChild)
        el.replaceWith(frag)
      })
    }

    convertInlineStylesToSemantic(container)

    // Remove remaining style attributes — we've converted important ones above
    Array.from(container.querySelectorAll("*[style]")).forEach((el) => el.removeAttribute("style"))

    // DOM post-processing: unwrap lists from paragraphs and clean empty paragraphs
    // so the resulting HTML is valid and lists/headings render correctly.
    const paragraphs = Array.from(container.querySelectorAll("p"))
    paragraphs.forEach((p) => {
      // If the paragraph contains exactly one element child which is UL or OL,
      // replace the <p> with that list element.
      if (p.childElementCount === 1 && p.firstElementChild && /^(UL|OL)$/i.test(p.firstElementChild.tagName)) {
        p.replaceWith(p.firstElementChild)
        return
      }

      // If the paragraph contains lists among its children, move them after the paragraph.
      const innerLists = Array.from(p.querySelectorAll("ul, ol"))
      innerLists.forEach((list) => {
        if (p.parentNode) {
          p.parentNode.insertBefore(list, p.nextSibling)
        }
      })

      // If paragraph is now empty (no text content and no element children), remove it.
      if (!p.textContent || p.textContent.trim() === "") {
        p.remove()
      }
    })

    cleaned = container.innerHTML
  }

  // Preserve list structures - don't force everything into paragraphs
  const hasLists = /<\/?[ou]l/i.test(cleaned) || /<\/?li/i.test(cleaned)
  
  if (hasLists) {
    // Keep lists as-is, just clean up empty tags
    cleaned = cleaned.replace(/<span[^>]*>\s*<\/span>/gi, "")
    cleaned = cleaned.replace(/<span[^>]*>/gi, "")
    cleaned = cleaned.replace(/<\/span>/gi, "")
    return cleaned.trim()
  }

  // For non-list content, ensure we have valid HTML structure
  if (!cleaned.includes("<p>") && cleaned.trim()) {
    cleaned = `<p>${cleaned}</p>`
  }

  if (!cleaned.trim()) {
    cleaned = "<p></p>"
  }

  return cleaned
}

export function stripHtmlTags(html: string): string {
  if (!html) return ""
  return html.replace(/<[^>]*>/g, "").trim()
}

export function getPlainText(html: string): string {
  const plainText = stripHtmlTags(html)
  // Decode HTML entities
  return plainText
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}
