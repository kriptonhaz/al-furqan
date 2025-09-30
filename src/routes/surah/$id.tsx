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
import { ScrollToTopButton } from '../../components/ScrollToTopButton'

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
  page: number = 1,
  perPage: number = 50,
): Promise<{ verses: Verse[]; hasMore: boolean; totalVerses: number }> => {
  try {
    const response = await fetch(
      `/api/verses/${chapterNumber}?page=${page}&per_page=${perPage}`,
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

function SurahDetail() {
  const { id } = Route.useParams()
  
  // Translation state with default value of 85
  const [selectedTranslation, setSelectedTranslation] = useState('85')

  // Scroll to top when surah changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

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

  // Fetch verses with infinite query for pagination
  const {
    data: versesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: versesLoading,
    error: versesError,
  } = useInfiniteQuery({
    queryKey: ['verses', id],
    queryFn: ({ pageParam = 1 }) => fetchVersesByChapter(id, pageParam, 50),
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
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
              <Link to="/surah">← Back to Surah List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
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
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                {chapter.id}
              </div>
              <div>
                <CardTitle className="text-3xl text-primary-800 mb-2">
                  {chapter.name_simple}
                </CardTitle>
                <p className="text-4xl font-arabic text-primary-600 mb-2">
                  {chapter.name_arabic}
                </p>
              </div>
            </div>

            <CardDescription className="text-lg mb-4">
              <span className="font-semibold text-primary-700">
                {chapter.translated_name.name}
              </span>
            </CardDescription>

            {/* Translations Dropdown */}
            <div className="mb-6 flex justify-center">
              <TranslationsDropdown 
                value={selectedTranslation} 
                onValueChange={setSelectedTranslation} 
              />
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span
                className={`px-3 py-1 rounded-full font-medium ${
                  chapter.revelation_place === 'mecca'
                    ? 'bg-secondary-100 text-secondary-700'
                    : 'bg-info-100 text-info-700'
                }`}
              >
                {chapter.revelation_place === 'mecca' ? 'Meccan' : 'Medinan'}
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

        {/* Bismillah (except for At-Tawbah and Al-Fatihah since it's included as verse 1) */}
        {chapter.id !== 9 && chapter.id !== 1 && (
          <Card className="mb-8 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-3xl font-arabic text-primary-700 mb-3">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <p className="text-lg text-primary-600 font-medium">
                  In the name of Allah, the Entirely Merciful, the Especially
                  Merciful
                </p>
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
                className="hover:shadow-md transition-shadow border-primary-100"
              >
                <CardContent className="py-6">
                  <div className="flex items-start gap-4">
                    <VerseNumber
                      number={verse.verse_number}
                      className="flex-shrink-0 mt-2"
                    />
                    <div className="flex-1 space-y-4">
                      {/* Arabic Text */}
                      <div className="text-right">
                        <p className="text-3xl font-arabic text-primary-800 leading-loose mb-4">
                          {verse.text_uthmani}
                        </p>
                      </div>

                      {/* Translations */}
                      {verse.translations && verse.translations.length > 0 && (
                        <div className="space-y-3">
                          {verse.translations.map((translation) => (
                            <div
                              key={translation.id}
                              className="bg-primary-50 p-4 rounded-lg border-l-4 border-primary-300"
                            >
                              <p className="text-primary-700 leading-relaxed">
                                {translation.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
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
                chapter.id > 1 ? { id: (chapter.id - 1).toString() } : undefined
              }
            >
              ← Previous Surah
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link to="/surah">📖 All Surahs</Link>
          </Button>

          <Button asChild variant="outline">
            <Link to="/surah/$id" params={{ id: (chapter.id + 1).toString() }}>
              Next Surah →
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  )
}
