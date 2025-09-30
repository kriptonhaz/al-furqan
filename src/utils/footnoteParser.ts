export interface FootnoteReference {
  id: string
  number: string
  startIndex: number
  endIndex: number
}

export interface ParsedTranslation {
  segments: Array<{
    type: 'text' | 'footnote'
    content: string
    footnoteId?: string
    footnoteNumber?: string
  }>
}

/**
 * Parses translation text to extract footnote references
 * Example: "Pemilik hari pembalasan.<sup foot_note=236248>1</sup>"
 * Returns segments with text and footnote information
 */
export function parseTranslationText(text: string): ParsedTranslation {
  const segments: ParsedTranslation['segments'] = []
  const footnoteRegex = /<sup foot_note=(\d+)>(\d+)<\/sup>/g
  
  let lastIndex = 0
  let match
  
  while ((match = footnoteRegex.exec(text)) !== null) {
    const [fullMatch, footnoteId, footnoteNumber] = match
    const matchStart = match.index
    
    // Add text before footnote if any
    if (matchStart > lastIndex) {
      const textContent = text.slice(lastIndex, matchStart)
      if (textContent.trim()) {
        segments.push({
          type: 'text',
          content: textContent,
        })
      }
    }
    
    // Add footnote segment
    segments.push({
      type: 'footnote',
      content: footnoteNumber,
      footnoteId,
      footnoteNumber,
    })
    
    lastIndex = matchStart + fullMatch.length
  }
  
  // Add remaining text after last footnote
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    if (remainingText.trim()) {
      segments.push({
        type: 'text',
        content: remainingText,
      })
    }
  }
  
  // If no footnotes found, return the entire text as a single segment
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: text,
    })
  }
  
  return { segments }
}

/**
 * Extracts all footnote IDs from a translation text
 */
export function extractFootnoteIds(text: string): string[] {
  const footnoteRegex = /<sup foot_note=(\d+)>\d+<\/sup>/g
  const ids: string[] = []
  let match
  
  while ((match = footnoteRegex.exec(text)) !== null) {
    ids.push(match[1])
  }
  
  return ids
}