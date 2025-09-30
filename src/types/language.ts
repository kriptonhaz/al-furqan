export interface TranslatedName {
  name: string
  language_name: string
}

export interface Language {
  id: number
  name: string
  iso_code: string
  native_name: string
  direction: 'ltr' | 'rtl'
  translations_count: number
  translated_name: TranslatedName
}

export interface LanguagesApiResponse {
  languages: Language[]
}