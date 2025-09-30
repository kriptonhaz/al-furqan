import { useEffect } from 'react'
import { useAudio } from '../contexts/AudioContext'
import type { Verse } from '../types/surah'

interface SurahDetailWithAudioProps {
  verses: Verse[]
  children: React.ReactNode
}

export function SurahDetailWithAudio({ verses, children }: SurahDetailWithAudioProps) {
  const { setVerses } = useAudio()

  // Update verses in audio context when they change
  useEffect(() => {
    setVerses(verses)
  }, [verses, setVerses])

  return <>{children}</>
}