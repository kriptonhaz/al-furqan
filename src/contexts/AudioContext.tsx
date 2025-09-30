import { createContext, useContext, useState, useRef, ReactNode } from 'react'
import { Verse } from '../types/surah'

interface AudioState {
  currentVerse: Verse | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLoading: boolean
}

interface AudioContextType {
  audioState: AudioState
  playVerse: (verse: Verse) => void
  pauseAudio: () => void
  resumeAudio: () => void
  stopAudio: () => void
  setVolume: (volume: number) => void
  seekTo: (time: number) => void
  playNextVerse: () => void
  verses: Verse[]
  setVerses: (verses: Verse[]) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

const AUDIO_BASE_URL =
  import.meta.env.VITE_QURAN_AUDIO_BASE_URL ||
  'https://verses.quran.foundation/'

export function AudioProvider({ children }: { children: ReactNode }) {
  const [audioState, setAudioState] = useState<AudioState>({
    currentVerse: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLoading: false,
  })

  const [verses, setVerses] = useState<Verse[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playVerse = (verse: Verse) => {
    if (!verse.audio?.url) return

    setAudioState((prev) => ({ ...prev, isLoading: true }))

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const audioUrl = `${AUDIO_BASE_URL}${verse.audio.url}`
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.addEventListener('loadstart', () => {
      setAudioState((prev) => ({ ...prev, isLoading: true }))
    })

    audio.addEventListener('canplay', () => {
      setAudioState((prev) => ({
        ...prev,
        isLoading: false,
        duration: audio.duration,
      }))
    })

    audio.addEventListener('timeupdate', () => {
      setAudioState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
      }))
    })

    audio.addEventListener('ended', () => {
      setAudioState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }))
      playNextVerse()
    })

    audio.addEventListener('error', () => {
      setAudioState((prev) => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
      }))
    })

    audio.volume = audioState.volume
    audio.play()

    setAudioState((prev) => ({
      ...prev,
      currentVerse: verse,
      isPlaying: true,
    }))
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setAudioState((prev) => ({ ...prev, isPlaying: false }))
    }
  }

  const resumeAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setAudioState((prev) => ({ ...prev, isPlaying: true }))
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setAudioState((prev) => ({
      ...prev,
      currentVerse: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    }))
  }

  const setVolume = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
    setAudioState((prev) => ({ ...prev, volume }))
  }

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setAudioState((prev) => ({ ...prev, currentTime: time }))
    }
  }

  const scrollToVerse = (verseId: number) => {
    const verseElement = document.getElementById(`verse-${verseId}`)
    if (verseElement) {
      verseElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  const playNextVerse = () => {
    if (!audioState.currentVerse || verses.length === 0) return

    const currentIndex = verses.findIndex(
      (v) => v.id === audioState.currentVerse!.id,
    )
    const nextIndex = currentIndex + 1

    if (nextIndex < verses.length) {
      const nextVerse = verses[nextIndex]
      if (nextVerse.audio?.url) {
        playVerse(nextVerse)
        // Auto-scroll to the next verse
        setTimeout(() => scrollToVerse(nextVerse.id), 100)
      } else {
        // If next verse has no audio, try the one after
        const nextWithAudio = verses
          .slice(nextIndex + 1)
          .find((v) => v.audio?.url)
        if (nextWithAudio) {
          playVerse(nextWithAudio)
          setTimeout(() => scrollToVerse(nextWithAudio.id), 100)
        } else {
          stopAudio()
        }
      }
    } else {
      stopAudio()
    }
  }

  return (
    <AudioContext.Provider
      value={{
        audioState,
        playVerse,
        pauseAudio,
        resumeAudio,
        stopAudio,
        setVolume,
        seekTo,
        playNextVerse,
        verses,
        setVerses,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
