import { useAudio } from '../contexts/AudioContext'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { Card, CardContent } from './ui/card'
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'

export function MiniPlayer() {
  const { 
    audioState, 
    pauseAudio, 
    resumeAudio, 
    stopAudio, 
    setVolume, 
    seekTo 
  } = useAudio()
  
  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(1)

  if (!audioState.currentVerse) {
    return null
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (audioState.isPlaying) {
      pauseAudio()
    } else {
      resumeAudio()
    }
  }

  const handleProgressChange = (value: number[]) => {
    seekTo(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume)
      setIsMuted(false)
    } else {
      setPreviousVolume(audioState.volume)
      setVolume(0)
      setIsMuted(true)
    }
  }

  const progress = audioState.duration > 0 
    ? (audioState.currentTime / audioState.duration) * 100 
    : 0

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4">
      <Card className="mx-auto max-w-4xl bg-white/95 backdrop-blur-sm border-primary-200 shadow-lg">
        <CardContent className="p-2 sm:p-4">
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            {/* Top row: Verse info and controls */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex-shrink-0 min-w-0 flex-1">
                <p className="text-xs font-medium text-primary-800 truncate">
                  Verse {audioState.currentVerse.verse_number}
                </p>
                <p className="text-xs text-primary-600">
                  {audioState.currentVerse.verse_key}
                </p>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayPause}
                  disabled={audioState.isLoading}
                  className="h-8 w-8 p-0"
                >
                  {audioState.isLoading ? (
                    <div className="w-3 h-3 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                  ) : audioState.isPlaying ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopAudio}
                  className="h-8 w-8 p-0"
                >
                  <Square className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="h-8 w-8 p-0"
                >
                  {isMuted || audioState.volume === 0 ? (
                    <VolumeX className="h-3 w-3" />
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Bottom row: Progress bar with times */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary-600 min-w-[35px] text-center">
                {formatTime(audioState.currentTime)}
              </span>
              
              <div className="flex-1">
                <Slider
                  value={[audioState.currentTime]}
                  max={audioState.duration || 100}
                  step={1}
                  onValueChange={handleProgressChange}
                  className="w-full"
                />
              </div>
              
              <span className="text-xs text-primary-600 min-w-[35px] text-center">
                {formatTime(audioState.duration)}
              </span>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Verse Info */}
            <div className="flex-shrink-0 min-w-0">
              <p className="text-sm font-medium text-primary-800 truncate">
                Verse {audioState.currentVerse.verse_number}
              </p>
              <p className="text-xs text-primary-600">
                {audioState.currentVerse.verse_key}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                disabled={audioState.isLoading}
                className="h-8 w-8 p-0"
              >
                {audioState.isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                ) : audioState.isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={stopAudio}
                className="h-8 w-8 p-0"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 flex items-center gap-3">
              <span className="text-xs text-primary-600 min-w-[40px]">
                {formatTime(audioState.currentTime)}
              </span>
              
              <div className="flex-1">
                <Slider
                  value={[audioState.currentTime]}
                  max={audioState.duration || 100}
                  step={1}
                  onValueChange={handleProgressChange}
                  className="w-full"
                />
              </div>
              
              <span className="text-xs text-primary-600 min-w-[40px]">
                {formatTime(audioState.duration)}
              </span>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 p-0"
              >
                {isMuted || audioState.volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <div className="w-16">
                <Slider
                  value={[isMuted ? 0 : audioState.volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-2 sm:mt-2">
            <div className="w-full bg-primary-100 rounded-full h-1">
              <div 
                className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}