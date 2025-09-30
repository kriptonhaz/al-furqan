import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { parseTranslationText } from '../utils/footnoteParser'
import type { FootNote } from '../types/surah'

interface FootnoteTextProps {
  text: string
  className?: string
}

interface FootnoteApiResponse {
  success: boolean
  data: FootNote
  error?: string
}

const fetchFootnote = async (footnoteId: string): Promise<FootNote> => {
  const response = await fetch(`/api/footnote/${footnoteId}`)
  const data: FootnoteApiResponse = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch footnote')
  }
  
  return data.data
}

export function FootnoteText({ text, className = '' }: FootnoteTextProps) {
  const [expandedFootnotes, setExpandedFootnotes] = useState<Set<string>>(new Set())
  const parsedText = parseTranslationText(text)
  
  const toggleFootnote = (footnoteId: string) => {
    setExpandedFootnotes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(footnoteId)) {
        newSet.delete(footnoteId)
      } else {
        newSet.add(footnoteId)
      }
      return newSet
    })
  }

  return (
    <div className={className}>
      <div className="leading-relaxed">
        {parsedText.segments.map((segment, index) => {
          if (segment.type === 'text') {
            return <span key={index}>{segment.content}</span>
          }
          
          if (segment.type === 'footnote' && segment.footnoteId) {
            return (
              <FootnoteReference
                key={index}
                footnoteId={segment.footnoteId}
                footnoteNumber={segment.footnoteNumber || ''}
                isExpanded={expandedFootnotes.has(segment.footnoteId)}
                onToggle={() => toggleFootnote(segment.footnoteId!)}
              />
            )
          }
          
          return null
        })}
      </div>
      
      {/* Display expanded footnotes */}
      {Array.from(expandedFootnotes).map(footnoteId => (
        <FootnoteContent key={footnoteId} footnoteId={footnoteId} />
      ))}
    </div>
  )
}

interface FootnoteReferenceProps {
  footnoteId: string
  footnoteNumber: string
  isExpanded: boolean
  onToggle: () => void
}

function FootnoteReference({ footnoteNumber, isExpanded, onToggle }: FootnoteReferenceProps) {
  return (
    <sup
      className={`cursor-pointer text-primary-600 hover:text-primary-800 font-medium transition-colors ${
        isExpanded ? 'bg-primary-100 px-1 rounded' : ''
      }`}
      onClick={onToggle}
      title="Click to view footnote"
    >
      {footnoteNumber}
    </sup>
  )
}

interface FootnoteContentProps {
  footnoteId: string
}

function FootnoteContent({ footnoteId }: FootnoteContentProps) {
  const { data: footnote, isLoading, error } = useQuery({
    queryKey: ['footnote', footnoteId],
    queryFn: () => fetchFootnote(footnoteId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          <span className="text-sm text-gray-600">Loading footnote...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-300">
        <p className="text-sm text-red-700">
          Failed to load footnote: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  if (!footnote) {
    return null
  }

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-300">
      <div className="flex items-start space-x-2">
        <span className="text-blue-600 font-medium text-sm">Footnote:</span>
        <div className="flex-1">
          <p className="text-blue-800 text-sm leading-relaxed">{footnote.text}</p>
          {footnote.language_name && (
            <p className="text-blue-600 text-xs mt-1 capitalize">
              Language: {footnote.language_name}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}