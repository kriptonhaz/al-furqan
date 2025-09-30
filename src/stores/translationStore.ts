import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'
import type { Translation } from '../types/translation'

interface TranslationState {
  selectedTranslations: Translation[]
  availableTranslations: Translation[]
}

// Default translation (English - Sahih International)
const defaultTranslation: Translation = {
  id: 20,
  name: 'sahih',
  author_name: 'Saheeh International',
  slug: 'sahih',
  language_name: 'english',
  translated_name: {
    name: 'Saheeh International',
    language_name: 'english',
  },
}

const initialState: TranslationState = {
  selectedTranslations: [defaultTranslation],
  availableTranslations: [],
}

export const translationStore = new Store(initialState)

// Actions
export const setSelectedTranslations = (translations: Translation[]) => {
  translationStore.setState((state) => ({
    ...state,
    selectedTranslations: translations,
  }))
}

export const addSelectedTranslation = (translation: Translation) => {
  translationStore.setState((state) => ({
    ...state,
    selectedTranslations: [...state.selectedTranslations, translation],
  }))
}

export const removeSelectedTranslation = (translationId: number) => {
  translationStore.setState((state) => ({
    ...state,
    selectedTranslations: state.selectedTranslations.filter(
      (t) => t.id !== translationId,
    ),
  }))
}

export const setAvailableTranslations = (translations: Translation[]) => {
  translationStore.setState((state) => ({
    ...state,
    availableTranslations: translations,
  }))
}

// Selectors
export const useSelectedTranslations = () => {
  return useStore(translationStore, (state) => state.selectedTranslations)
}

export const useAvailableTranslations = () => {
  return useStore(translationStore, (state) => state.availableTranslations)
}

export const useTranslationStore = () => {
  return useStore(translationStore)
}
