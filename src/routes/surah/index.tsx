import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import LanguageDropdown from '../../components/LanguageDropdown'
import { useCurrentLanguage } from '../../stores/languageStore'
import type { Chapter } from '../../types/surah'

// Function to fetch Surahs from our API
async function fetchSurahs(language: string): Promise<Chapter[]> {
  const response = await fetch(`/api/surah?language=${language}`)
  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch Surahs')
  }

  return data.data
}

export const Route = createFileRoute('/surah/')({
  component: SurahList,
})

function SurahList() {
  const selectedLanguageCode = useCurrentLanguage()
  
  const {
    data: surahs = [],
    isLoading,
    error,
  } = useQuery<Chapter[]>({
    queryKey: ['surahs', selectedLanguageCode],
    queryFn: () => fetchSurahs(selectedLanguageCode),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-700">Loading Surahs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error loading Surahs: {error.message}
          </p>
          <Button asChild variant="outline">
            <Link to="/">← Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
            Surahs of the Quran
          </h1>
          <p className="text-xl text-primary-700 mb-2 font-medium">
            سور القرآن الكريم
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore all 114 chapters of the Holy Quran. Each Surah contains
            divine guidance and wisdom.
          </p>
        </div>

        {/* Language Selection */}
        <div className="flex justify-center mb-6">
          <LanguageDropdown />
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Button asChild variant="outline">
            <Link to="/">← Back to Home</Link>
          </Button>
        </div>

        {/* Surahs Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {surahs.map((surah) => (
            <Card
              key={surah.id}
              className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-primary-100 hover:border-primary-200"
            >
              <Link
                to="/surah/$id"
                params={{ id: surah.id.toString() }}
                className="block"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-primary-600 text-black rounded-xl flex items-center justify-center font-bold text-sm border-2 border-primary-800">
                      {surah.id}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        surah.revelation_place === 'makkah'
                          ? 'bg-secondary-100 text-secondary-700'
                          : 'bg-info-100 text-info-700'
                      }`}
                    >
                      {surah.revelation_place === 'makkah'
                        ? 'Meccan'
                        : 'Medinan'}
                    </span>
                  </div>
                  <CardTitle className="text-lg text-primary-800 mb-1">
                    {surah.name_simple}
                  </CardTitle>
                  <p className="text-2xl font-arabic text-primary-600 mb-2 text-right">
                    {surah.name_arabic}
                  </p>
                  <CardDescription className="text-sm text-muted-foreground">
                    {surah.translated_name.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{surah.verses_count} verses</span>
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Total Count */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Showing {surahs.length} Surahs from the Holy Quran
          </p>
        </div>
      </div>
    </div>
  )
}
