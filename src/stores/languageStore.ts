import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'
import type { Language } from '../types/language'

interface LanguageState {
  currentLanguage: string // ISO code
  availableLanguages: Language[]
}

const initialState: LanguageState = {
  currentLanguage: 'en',
  availableLanguages: []
}

export const languageStore = new Store(initialState)

// Actions
export const setCurrentLanguage = (language: string) => {
  languageStore.setState((state) => ({
    ...state,
    currentLanguage: language
  }))
}

export const setAvailableLanguages = (languages: Language[]) => {
  languageStore.setState((state) => ({
    ...state,
    availableLanguages: languages
  }))
}

// Selectors
export const useCurrentLanguage = () => {
  return useStore(languageStore, (state) => state.currentLanguage)
}

export const useAvailableLanguages = () => {
  return useStore(languageStore, (state) => state.availableLanguages)
}

export const useLanguageStore = () => {
  return useStore(languageStore)
}