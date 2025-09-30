import { createContext, useContext, useState, ReactNode } from 'react'

interface TranslationContextType {
  selectedTranslationId: string
  setSelectedTranslationId: (id: string) => void
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

interface TranslationProviderProps {
  children: ReactNode
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [selectedTranslationId, setSelectedTranslationId] = useState('85') // Default to translation ID 85

  return (
    <TranslationContext.Provider value={{ selectedTranslationId, setSelectedTranslationId }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}