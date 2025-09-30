export interface TranslatedName {
  language_name: string
  name: string
}

export interface Chapter {
  id: number
  revelation_place: string
  revelation_order: number
  bismillah_pre: boolean
  name_simple: string
  name_complex: string
  name_arabic: string
  verses_count: number
  pages: [number, number]
  translated_name: TranslatedName
}

export interface SurahResponse {
  chapters: Chapter[]
}

// Verses API interfaces - Updated to match actual API response
export interface Verse {
  id: number
  verse_number: number
  verse_key: string
  hizb_number: number
  rub_el_hizb_number: number
  ruku_number: number
  manzil_number: number
  sajdah_number: number | null
  page_number: number
  juz_number: number
  text_uthmani: string
  translations: {
    id: number
    resource_id: number
    text: string
  }[]
}

export interface VersePagination {
  per_page: number
  current_page: number
  next_page: number | null
  total_pages: number
  total_records: number
}

export interface VersesResponse {
  verses: Verse[]
  pagination: VersePagination
}
