import { useQuery } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import type { Language, LanguagesApiResponse } from '../types/language'
import { useLanguage } from '../contexts/LanguageContext'

interface LanguageDropdownProps {
  // Remove props since we'll use global state
}

const fetchLanguages = async (): Promise<Language[]> => {
  const response = await fetch('/api/languages')
  if (!response.ok) {
    throw new Error('Failed to fetch languages')
  }
  const data: LanguagesApiResponse = await response.json()
  return data.languages
}

export function LanguageDropdown({}: LanguageDropdownProps) {
  const { selectedLanguageCode, setSelectedLanguageCode } = useLanguage()
  const { data: languages, isLoading, error } = useQuery({
    queryKey: ['languages'],
    queryFn: fetchLanguages,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Loading languages...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        Failed to load languages
      </div>
    )
  }

  // Sort languages alphabetically by name
  const sortedLanguages = languages?.slice().sort((a, b) => 
    a.name.localeCompare(b.name)
  )

  const selectedLanguage = sortedLanguages?.find(l => l.iso_code === selectedLanguageCode)

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-primary-700">Language:</span>
      <Select value={selectedLanguageCode} onValueChange={setSelectedLanguageCode}>
        <SelectTrigger className="w-[200px]">
          <SelectValue>
            {selectedLanguage && (
              <div className="flex items-center gap-2">
                <span>🌐</span>
                <span>{selectedLanguage.native_name || selectedLanguage.name}</span>
                <span className="text-xs text-muted-foreground">({selectedLanguage.iso_code.toUpperCase()})</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortedLanguages?.map((language) => (
            <SelectItem key={language.id} value={language.iso_code}>
              <div className="flex items-center gap-2">
                <span>🌐</span>
                <span>{language.native_name || language.name}</span>
                <span className="text-xs text-muted-foreground">({language.iso_code.toUpperCase()})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}