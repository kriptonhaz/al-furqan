import { createContext, useContext, useState, ReactNode } from 'react'

interface RecitationContextType {
  selectedRecitationId: string
  setSelectedRecitationId: (id: string) => void
}

const RecitationContext = createContext<RecitationContextType | undefined>(undefined)

interface RecitationProviderProps {
  children: ReactNode
}

export function RecitationProvider({ children }: RecitationProviderProps) {
  const [selectedRecitationId, setSelectedRecitationId] = useState('7') // Default to recitation ID 7

  return (
    <RecitationContext.Provider value={{ selectedRecitationId, setSelectedRecitationId }}>
      {children}
    </RecitationContext.Provider>
  )
}

export function useRecitation() {
  const context = useContext(RecitationContext)
  if (context === undefined) {
    throw new Error('useRecitation must be used within a RecitationProvider')
  }
  return context
}