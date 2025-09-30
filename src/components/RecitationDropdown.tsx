import { useQuery } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import type { Recitation } from '../types/surah'
import { useSelectedRecitation, useAvailableRecitations, setSelectedRecitation, setAvailableRecitations } from '../stores/recitationStore'

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
  const selectedRecitation = useSelectedRecitation()
  const availableRecitations = useAvailableRecitations()
  
  const { data: recitations, isLoading, error } = useQuery({
    queryKey: ['recitations'],
    queryFn: fetchRecitations,
  })

  // Update available recitations when data is fetched
  if (recitations && recitations.length > 0 && availableRecitations.length === 0) {
    setAvailableRecitations(recitations)
  }

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
  const sortedRecitations = availableRecitations.slice().sort((a: Recitation, b: Recitation) => 
    a.reciter_name.localeCompare(b.reciter_name)
  )

  const selectedRecitationObj = sortedRecitations.find((r: Recitation) => r.id === selectedRecitation?.id)

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-sm font-medium text-primary-700 shrink-0">Recitation:</span>
      <Select 
        value={selectedRecitation?.id?.toString() || ''} 
        onValueChange={(value) => {
          const recitation = sortedRecitations.find((r: Recitation) => r.id.toString() === value)
          if (recitation) {
            setSelectedRecitation(recitation)
          }
        }}
      >
        <SelectTrigger className="w-full min-w-0 max-w-[280px]">
          <SelectValue>
            {selectedRecitationObj && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0">🎵</span>
                <span className="truncate">{selectedRecitationObj.reciter_name}</span>
                {selectedRecitationObj.style && (
                  <span className="text-xs text-muted-foreground shrink-0">({selectedRecitationObj.style})</span>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortedRecitations.map((recitation: Recitation) => (
            <SelectItem key={recitation.id} value={recitation.id.toString()}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0">🎵</span>
                <span className="truncate">{recitation.reciter_name}</span>
                {recitation.style && (
                  <span className="text-xs text-muted-foreground shrink-0">({recitation.style})</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}