import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'
import type { Recitation } from '../types/surah'

interface RecitationState {
  selectedRecitation: Recitation | null
  availableRecitations: Recitation[]
}

// Default recitation (Abdul Basit Abdul Samad)
const defaultRecitation: Recitation = {
  id: 7,
  reciter_name: "Abdul Basit Abdul Samad",
  style: "Murattal",
  translated_name: {
    name: "Abdul Basit Abdul Samad",
    language_name: "arabic"
  }
}

const initialState: RecitationState = {
  selectedRecitation: defaultRecitation,
  availableRecitations: [],
}

export const recitationStore = new Store(initialState)

// Actions
export const setSelectedRecitation = (recitation: Recitation | null) => {
  recitationStore.setState((state) => ({
    ...state,
    selectedRecitation: recitation,
  }))
}

export const setAvailableRecitations = (recitations: Recitation[]) => {
  recitationStore.setState((state) => ({
    ...state,
    availableRecitations: recitations,
  }))
}

// Selectors
export const useSelectedRecitation = () => {
  return useStore(recitationStore, (state) => state.selectedRecitation)
}

export const useAvailableRecitations = () => {
  return useStore(recitationStore, (state) => state.availableRecitations)
}

export const useRecitationStore = () => {
  return useStore(recitationStore)
}