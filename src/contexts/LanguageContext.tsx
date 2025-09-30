import { createContext, useContext, useState, ReactNode } from 'react'

interface LanguageContextType {
  selectedLanguageCode: string
  setSelectedLanguageCode: (code: string) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [selectedLanguageCode, setSelectedLanguageCode] = useState('en') // Default to English

  return (
    <LanguageContext.Provider value={{ selectedLanguageCode, setSelectedLanguageCode }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}