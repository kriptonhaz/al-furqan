import { Play, Pause, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAudioState, playVerse, pauseAudio, resumeAudio } from "@/stores/audioStore"
import type { Verse } from "@/types/surah"

interface VersePlayButtonProps {
  verse: Verse
}

export function VersePlayButton({ verse }: VersePlayButtonProps) {
  const audioState = useAudioState()

  const isCurrentVerse = audioState.currentVerse?.verse_number === verse.verse_number
  const isCurrentlyPlaying = isCurrentVerse && audioState.isPlaying

  const handlePlayClick = () => {
    if (!verse.audio?.url) return

    if (isCurrentVerse) {
      if (audioState.isPlaying) {
        pauseAudio()
      } else {
        resumeAudio()
      }
    } else {
      playVerse(verse)
    }
  }

  if (!verse.audio?.url) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handlePlayClick}
      disabled={audioState.isLoading && isCurrentVerse}
      className="h-8 w-8 p-0 hover:bg-primary/10"
    >
      {audioState.isLoading && isCurrentVerse ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isCurrentlyPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </Button>
  )
}