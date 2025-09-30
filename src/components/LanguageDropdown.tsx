import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchLanguages } from '../lib/api'
import { useCurrentLanguage, useAvailableLanguages, setCurrentLanguage, setAvailableLanguages } from '../stores/languageStore'
import type { Language } from '../types/language'

export default function LanguageDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const currentLanguageCode = useCurrentLanguage()
  const availableLanguages = useAvailableLanguages()

  const { data: languages, isLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: fetchLanguages,
  })

  // Update available languages when data is fetched
  if (languages && languages.length > 0 && availableLanguages.length === 0) {
    setAvailableLanguages(languages)
  }

  // Find current language object
  const currentLanguage = availableLanguages.find((lang: Language) => lang.iso_code === currentLanguageCode)

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode)
    setIsOpen(false)
  }

  if (isLoading) {
    return (
      <div className="relative">
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
          <div className="w-16 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  // Sort languages alphabetically by name
  const sortedLanguages = [...availableLanguages].sort((a: Language, b: Language) => a.name.localeCompare(b.name))

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <span className="text-sm font-medium text-gray-700">
          {currentLanguage?.name || 'English'}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {sortedLanguages.map((language: Language) => (
            <button
              key={language.id}
              onClick={() => handleLanguageChange(language.iso_code)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                currentLanguageCode === language.iso_code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{language.name}</span>
                <span className="text-sm text-gray-500">{language.native_name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}