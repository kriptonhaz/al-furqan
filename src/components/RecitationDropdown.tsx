import { useQuery } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import type { Recitation } from '../types/surah'
import { useRecitation } from '../contexts/RecitationContext'

interface RecitationDropdownProps {
  // Remove props since we'll use global state
}

interface RecitationsApiResponse {
  success: boolean
  data: Recitation[]
}

const fetchRecitations = async (): Promise<Recitation[]> => {
  const response = await fetch('/api/recitations')
  if (!response.ok) {
    throw new Error('Failed to fetch recitations')
  }
  const data: RecitationsApiResponse = await response.json()
  return data.data
}

export function RecitationDropdown({}: RecitationDropdownProps) {
  const { selectedRecitationId, setSelectedRecitationId } = useRecitation()
  const { data: recitations, isLoading, error } = useQuery({
    queryKey: ['recitations'],
    queryFn: fetchRecitations,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Loading recitations...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        Failed to load recitations
      </div>
    )
  }

  // Sort recitations alphabetically by reciter name
  const sortedRecitations = recitations?.slice().sort((a, b) => 
    a.reciter_name.localeCompare(b.reciter_name)
  )

  const selectedRecitation = sortedRecitations?.find(r => r.id.toString() === selectedRecitationId)

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-primary-700">Recitation:</span>
      <Select value={selectedRecitationId} onValueChange={setSelectedRecitationId}>
        <SelectTrigger className="w-[280px]">
          <SelectValue>
            {selectedRecitation && (
              <div className="flex items-center gap-2">
                <span>🎵</span>
                <span>{selectedRecitation.reciter_name}</span>
                {selectedRecitation.style && (
                  <span className="text-xs text-muted-foreground">({selectedRecitation.style})</span>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortedRecitations?.map((recitation) => (
            <SelectItem key={recitation.id} value={recitation.id.toString()}>
              <div className="flex items-center gap-2">
                <span>🎵</span>
                <span>{recitation.reciter_name}</span>
                {recitation.style && (
                  <span className="text-xs text-muted-foreground">({recitation.style})</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}