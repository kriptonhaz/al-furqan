import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useEffect, useCallback, useState } from 'react'
import type { Chapter, Verse } from '../../types/surah'
import { VerseNumber } from '../../components/VerseNumber'
import { TranslationsDropdown } from '../../components/TranslationsDropdown'
import { RecitationDropdown } from '../../components/RecitationDropdown'
import { ScrollToTopButton } from '../../components/ScrollToTopButton'
import { useSelectedTranslations } from '../../stores/translationStore'
import { useSelectedRecitation } from '../../stores/recitationStore'
import { FootnoteText } from '../../components/FootnoteText'
import { SurahDetailWithAudio } from '../../components/SurahDetailWithAudio'
import { MiniPlayer } from '../../components/MiniPlayer'
import { VersePlayButton } from '../../components/VersePlayButton'

export const Route = createFileRoute('/surah/$id')({
  component: SurahDetail,
})

// Fetch chapter info from the existing API
const fetchChapterById = async (id: string): Promise<Chapter | null> => {
  try {
    const response = await fetch('/api/surah')
    const data = await response.json()

    if (data.success && data.data) {
      const chapter = data.data.find((ch: Chapter) => ch.id === parseInt(id))
      return chapter || null
    }
    return null
  } catch (error) {
    console.error('Error fetching chapter:', error)
    return null
  }
}

// Fetch verses for a specific chapter with pagination
const fetchVersesByChapter = async (
  chapterNumber: string,
  translationId: string,
  recitationId: string,
  page: number = 1,
  perPage: number = 50,
): Promise<{ verses: Verse[]; hasMore: boolean; totalVerses: number }> => {
  try {
    const response = await fetch(
      `/api/verses/${chapterNumber}?page=${page}&per_page=${perPage}&translation_id=${translationId}&recitation_id=${recitationId}`,
    )
    const data = await response.json()

    if (data.success && data.data) {
      const verses = data.data.verses
      const pagination = data.data.pagination

      return {
        verses,
        hasMore: pagination
          ? pagination.current_page < pagination.total_pages
          : false,
        totalVerses: pagination ? pagination.total_records : verses.length,
      }
    }
    return { verses: [], hasMore: false, totalVerses: 0 }
  } catch (error) {
    console.error('Error fetching verses:', error)
    return { verses: [], hasMore: false, totalVerses: 0 }
  }
}

// Fetch Bismillah verse from Surah 1 verse 1
const fetchBismillahVerse = async (
  translationId: string,
  recitationId: string,
): Promise<Verse | null> => {
  try {
    const response = await fetch(
      `/api/verses/1?page=1&per_page=1&translation_id=${translationId}&recitation_id=${recitationId}`,
    )
    const data = await response.json()

    if (data.success && data.data && data.data.verses.length > 0) {
      const bismillahVerse = data.data.verses[0] // Get the first verse (Bismillah)

      // For non-Surah 1, treat Bismillah as verse 0 to avoid conflicts with actual verse 1
      return {
        ...bismillahVerse,
        verse_number: 0,
        verse_key: `${bismillahVerse.verse_key.split(':')[0]}:0`, // Update verse_key to reflect verse 0
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching Bismillah verse:', error)
    return null
  }
}

function SurahDetail() {
  const { id } = Route.useParams()
  const selectedTranslations = useSelectedTranslations()
  const selectedRecitation = useSelectedRecitation()
  
  // Get the first selected translation for backward compatibility
  const selectedTranslationId = selectedTranslations.length > 0 ? selectedTranslations[0].id.toString() : '131'
  const selectedRecitationId = selectedRecitation?.id.toString() || '7'
  const [isHeaderSticky, setIsHeaderSticky] = useState(false)

  // Scroll to top when surah changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsHeaderSticky(scrollY > 200) // Show sticky header after scrolling 200px
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch chapter info with TanStack Query
  const {
    data: chapter,
    isLoading: chapterLoading,
    error: chapterError,
  } = useQuery({
    queryKey: ['chapter', id],
    queryFn: () => fetchChapterById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Fetch Bismillah verse for non-Fatihah and non-Tawbah surahs
  const { data: bismillahVerse } = useQuery({
    queryKey: ['bismillah', selectedTranslationId, selectedRecitationId],
    queryFn: () =>
      fetchBismillahVerse(selectedTranslationId, selectedRecitationId),
    enabled: !!(chapter && chapter.id !== 1 && chapter.id !== 9), // Only fetch for surahs that need Bismillah
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Fetch verses with infinite query for pagination
  const {
    data: versesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: versesLoading,
    error: versesError,
  } = useInfiniteQuery({
    queryKey: ['verses', id, selectedTranslationId, selectedRecitationId],
    queryFn: ({ pageParam = 1 }) =>
      fetchVersesByChapter(
        id,
        selectedTranslationId,
        selectedRecitationId,
        pageParam,
        50,
      ),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Flatten verses from all pages
  const verses = versesData?.pages.flatMap((page) => page.verses) ?? []

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 1000 // Load more when 1000px from bottom
    ) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const isLoading = chapterLoading || versesLoading
  const error = chapterError || versesError

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <CardTitle className="text-2xl font-semibold text-emerald-800 mb-2">
              Loading Surah
            </CardTitle>
            <CardDescription className="text-emerald-600 text-base">
              Fetching sacred verses...
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-emerald-600 text-center">
                Please wait while we prepare the content
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <CardTitle className="text-xl font-semibold text-red-800 mb-2">
              {error ? 'Error Loading Surah' : 'Surah Not Found'}
            </CardTitle>
            <CardDescription className="text-red-600">
              {error instanceof Error
                ? error.message
                : 'The requested Surah could not be found.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-4">
            <Button asChild className="bg-red-600 hover:bg-red-700 text-black">
              <Link to="/surah">← Back to Surah List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SurahDetailWithAudio
      verses={
        // Create combined verses array with Bismillah as verse 0 for proper audio sequencing
        chapter && chapter.id !== 9 && chapter.id !== 1 && bismillahVerse
            ? [bismillahVerse, ...verses]
            : verses
        }
      >
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
          {/* Sticky Header */}
          <div
            className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-primary-200 transition-all duration-300 ${
              isHeaderSticky
                ? 'translate-y-0 opacity-100'
                : '-translate-y-full opacity-0'
            }`}
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/surah">← Back</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/">🏠 Home</Link>
                  </Button>
                </div>
                {chapter && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-600 text-black rounded-full flex items-center justify-center font-bold text-sm">
                      {chapter.id}
                    </div>
                    <div className="text-right">
                      <h2 className="text-lg font-semibold text-primary-800">
                        {chapter.name_simple}
                      </h2>
                      <p className="text-sm font-arabic text-primary-600">
                        {chapter.name_arabic}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            {/* Navigation */}
            <div className="flex items-center gap-4 mb-8">
              <Button asChild variant="outline">
                <Link to="/surah">← Back to Surahs</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">🏠 Home</Link>
              </Button>
            </div>

            {/* Surah Header */}
            <Card className="mb-8 border-primary-200">
              <CardHeader className="text-center">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-600 text-black rounded-full flex items-center justify-center font-bold text-lg sm:text-xl">
                    {chapter.id}
                  </div>
                  <div className="text-center sm:text-left">
                    <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-primary-800 mb-2">
                      {chapter.name_simple}
                    </CardTitle>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-arabic text-primary-600 mb-2">
                      {chapter.name_arabic}
                    </p>
                  </div>
                </div>

                <CardDescription className="text-lg mb-4">
                  <span className="font-semibold text-primary-700">
                    {chapter.translated_name.name}
                  </span>
                </CardDescription>

                {/* Translations and Recitation Dropdowns */}
                <div className="mb-6 flex flex-col sm:flex-row justify-center gap-4 px-2 sm:px-4">
                  <div className="w-full sm:w-auto">
                    <TranslationsDropdown />
                  </div>
                  <div className="w-full sm:w-auto">
                    <RecitationDropdown />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <span
                    className={`px-3 py-1 rounded-full font-medium ${
                      chapter.revelation_place === 'mecca'
                        ? 'bg-secondary-100 text-secondary-700'
                        : 'bg-info-100 text-info-700'
                    }`}
                  >
                    {chapter.revelation_place === 'mecca'
                      ? 'Meccan'
                      : 'Medinan'}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    {chapter.verses_count} verses
                  </span>
                </div>
              </CardHeader>
            </Card>

            {/* Dynamic Bismillah (except for At-Tawbah and Al-Fatihah since it's included as verse 1) */}
            {chapter.id !== 9 && chapter.id !== 1 && bismillahVerse && (
              <Card className="mb-8 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
                <CardContent className="py-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <p className="text-3xl font-arabic text-primary-700">
                        {bismillahVerse.text_uthmani}
                      </p>
                      <VersePlayButton verse={bismillahVerse} />
                    </div>
                    <div className="text-lg text-primary-600 font-medium">
                      <FootnoteText
                        text={bismillahVerse.translations[0]?.text || ''}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verses */}
            <div className="space-y-6">
              {verses.length > 0 ? (
                verses.map((verse: Verse) => (
                  <Card
                    key={verse.id}
                    id={`verse-${verse.id}`}
                    className="hover:shadow-md transition-shadow border-primary-100"
                  >
                    <CardContent className="py-6">
                      {/* Top section with verse number, Arabic text, and play button */}
                      <div className="flex items-start gap-4 mb-4">
                        <VerseNumber
                          number={verse.verse_number}
                          className="flex-shrink-0 mt-2"
                        />
                        <div className="flex-1 min-w-0">
                          {/* Arabic Text */}
                          <div className="text-right">
                            <p className="text-3xl font-arabic text-primary-800 leading-loose">
                              {verse.text_uthmani}
                            </p>
                          </div>
                        </div>

                        {/* Play Button */}
                        <div className="flex-shrink-0 mt-2">
                          <VersePlayButton verse={verse} />
                        </div>
                      </div>

                      {/* Translations - Full width on mobile, breaking out of card padding */}
                      {verse.translations &&
                        verse.translations.length > 0 && (
                          <div className="-mx-6 px-2 sm:mx-0 sm:px-0">
                            <div className="space-y-3">
                              {verse.translations.map((translation) => (
                                <div
                                  key={translation.id}
                                  className="bg-primary-50 p-4 sm:p-6 rounded-none sm:rounded-lg border-l-4 border-primary-300 mx-2 sm:mx-0"
                                >
                                  <FootnoteText
                                    text={translation.text}
                                    className="text-primary-700 text-base sm:text-lg leading-relaxed"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-muted-foreground">
                      No verses available for this chapter.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Infinite Scroll Loading Indicator */}
              {isFetchingNextPage && (
                <Card className="border-primary-200">
                  <CardContent className="py-8">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                      <p className="text-primary-600 font-medium">
                        Loading more verses...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* End of verses indicator */}
              {!hasNextPage && verses.length > 0 && (
                <Card className="border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50">
                  <CardContent className="py-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-6 h-6 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="text-primary-700 font-medium mb-1">
                        End of Surah
                      </p>
                      <p className="text-sm text-primary-600">
                        You have read all verses of {chapter.name_simple}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-primary-200">
              <Button asChild variant="outline">
                <Link
                  to={chapter.id > 1 ? '/surah/$id' : '/surah'}
                  params={
                    chapter.id > 1
                      ? { id: (chapter.id - 1).toString() }
                      : undefined
                  }
                >
                  ← Previous Surah
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link to="/surah">📖 All Surahs</Link>
              </Button>

              <Button asChild variant="outline">
                <Link
                  to="/surah/$id"
                  params={{ id: (chapter.id + 1).toString() }}
                >
                  Next Surah →
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <ScrollToTopButton />

        {/* Mini Player */}
        <MiniPlayer />
      </SurahDetailWithAudio>
  )
}
