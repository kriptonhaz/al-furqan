import { useEffect } from 'react'
import { setVerses } from '../stores/audioStore'
import type { Verse } from '../types/surah'

interface SurahDetailWithAudioProps {
  verses: Verse[]
  children: React.ReactNode
}

export function SurahDetailWithAudio({ verses, children }: SurahDetailWithAudioProps) {
  // Update verses in audio store when they change
  useEffect(() => {
    setVerses(verses)
  }, [verses])

  return <>{children}</>
}