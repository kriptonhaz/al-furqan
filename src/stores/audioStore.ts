import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'
import { Verse } from '../types/surah'

interface AudioState {
  currentVerse: Verse | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLoading: boolean
  verses: Verse[]
}

const initialState: AudioState = {
  currentVerse: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isLoading: false,
  verses: [],
}

export const audioStore = new Store(initialState)

const AUDIO_BASE_URL =
  import.meta.env.VITE_QURAN_AUDIO_BASE_URL ||
  'https://verses.quran.foundation/'

let audioRef: HTMLAudioElement | null = null

// Actions
export const setAudioState = (updates: Partial<AudioState>) => {
  audioStore.setState((state) => ({
    ...state,
    ...updates,
  }))
}

export const setVerses = (verses: Verse[]) => {
  audioStore.setState((state) => ({
    ...state,
    verses,
  }))
}

export const playVerse = (verse: Verse) => {
  if (!verse.audio?.url) return

  setAudioState({ isLoading: true })

  // Stop current audio if playing
  if (audioRef) {
    audioRef.pause()
    audioRef = null
  }

  const audioUrl = `${AUDIO_BASE_URL}${verse.audio.url}`
  const audio = new Audio(audioUrl)
  audioRef = audio

  // Set current verse immediately
  setAudioState({
    currentVerse: verse,
    isPlaying: true,
  })

  audio.addEventListener('loadstart', () => {
    setAudioState({ isLoading: true })
  })

  audio.addEventListener('canplay', () => {
    setAudioState({
      isLoading: false,
      duration: audio.duration,
    })
  })

  audio.addEventListener('timeupdate', () => {
    setAudioState({
      currentTime: audio.currentTime,
    })
  })

  audio.addEventListener('ended', () => {
    const state = audioStore.state
    if (verse && state.verses.length > 0) {
      const currentIndex = state.verses.findIndex(
        (v) => v.verse_number === verse.verse_number,
      )
      
      let nextIndex = currentIndex + 1
      
      if (verse.verse_number === 0) {
        nextIndex = state.verses.findIndex(v => v.verse_number === 1)
      }

      if (nextIndex >= 0 && nextIndex < state.verses.length) {
        const nextVerse = state.verses[nextIndex]
        if (nextVerse.audio?.url) {
          playVerse(nextVerse)
          setTimeout(() => scrollToVerse(nextVerse.id), 100)
        }
      } else {
        setAudioState({
          isPlaying: false,
          currentTime: 0,
          currentVerse: null,
        })
      }
    } else {
      setAudioState({
        isPlaying: false,
        currentTime: 0,
      })
    }
  })

  audio.addEventListener('error', (e) => {
    console.error('Audio error:', e, 'URL:', audioUrl)
    setAudioState({
      isLoading: false,
      isPlaying: false,
    })
  })

  const currentVolume = audioStore.state.volume
  audio.volume = currentVolume
  
  audio.play().catch(error => {
    console.error('Failed to play audio:', error)
    setAudioState({
      isLoading: false,
      isPlaying: false,
    })
  })
}

export const pauseAudio = () => {
  if (audioRef) {
    audioRef.pause()
    setAudioState({ isPlaying: false })
  }
}

export const resumeAudio = () => {
  if (audioRef) {
    audioRef.play()
    setAudioState({ isPlaying: true })
  }
}

export const stopAudio = () => {
  if (audioRef) {
    audioRef.pause()
    audioRef.currentTime = 0
    audioRef = null
  }
  setAudioState({
    currentVerse: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  })
}

export const setVolume = (volume: number) => {
  if (audioRef) {
    audioRef.volume = volume
  }
  setAudioState({ volume })
}

export const seekTo = (time: number) => {
  if (audioRef) {
    audioRef.currentTime = time
    setAudioState({ currentTime: time })
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

export const playNextVerse = () => {
  const state = audioStore.state
  if (!state.currentVerse || state.verses.length === 0) return

  const currentIndex = state.verses.findIndex(
    (v) => v.verse_number === state.currentVerse!.verse_number,
  )
  
  let nextIndex = currentIndex + 1
  
  if (state.currentVerse.verse_number === 0) {
    nextIndex = state.verses.findIndex(v => v.verse_number === 1)
  }

  if (nextIndex >= 0 && nextIndex < state.verses.length) {
    const nextVerse = state.verses[nextIndex]
    if (nextVerse.audio?.url) {
      playVerse(nextVerse)
      setTimeout(() => scrollToVerse(nextVerse.id), 100)
    } else {
      const nextWithAudio = state.verses
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

export const cleanup = () => {
  if (audioRef) {
    audioRef.pause()
    audioRef.currentTime = 0
    audioRef.removeEventListener('loadstart', () => {})
    audioRef.removeEventListener('canplay', () => {})
    audioRef.removeEventListener('timeupdate', () => {})
    audioRef.removeEventListener('ended', () => {})
    audioRef.removeEventListener('error', () => {})
    audioRef = null
  }
  setAudioState({
    currentVerse: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLoading: false,
  })
}

// Selectors
export const useAudioState = () => {
  return useStore(audioStore, (state) => ({
    currentVerse: state.currentVerse,
    isPlaying: state.isPlaying,
    currentTime: state.currentTime,
    duration: state.duration,
    volume: state.volume,
    isLoading: state.isLoading,
  }))
}

export const useCurrentVerse = () => {
  return useStore(audioStore, (state) => state.currentVerse)
}

export const useIsPlaying = () => {
  return useStore(audioStore, (state) => state.isPlaying)
}

export const useAudioVerses = () => {
  return useStore(audioStore, (state) => state.verses)
}

export const useAudioStore = () => {
  return useStore(audioStore)
}