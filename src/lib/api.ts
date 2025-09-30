import type { Language, LanguagesApiResponse } from '../types/language'

export const fetchLanguages = async (): Promise<Language[]> => {
  const response = await fetch('/api/languages')
  if (!response.ok) {
    throw new Error('Failed to fetch languages')
  }
  const data: LanguagesApiResponse = await response.json()
  return data.languages
}