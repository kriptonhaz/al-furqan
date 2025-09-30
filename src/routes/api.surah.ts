import { createFileRoute } from '@tanstack/react-router'
import ky from 'ky'
import type { SurahResponse } from '../types/surah'
import tokenManager from '../utils/tokenManager'

export const Route = createFileRoute('/api/surah')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const language = url.searchParams.get('language') || 'en'
          
          console.log('Fetching surahs with language:', language)
          
          const contentApiUrl = process.env.QURAN_CONTENT_API_BASE_URL
          if (!contentApiUrl) {
              throw new Error('QURAN_CONTENT_API_BASE_URL environment variable is not set')
            }

          const accessToken = await tokenManager.getToken()
          const clientId = tokenManager.getClientId()

          if (!accessToken || !clientId) {
            throw new Error('Failed to get authentication tokens')
          }

          const surahResponse = await ky
            .get(`${contentApiUrl}/content/api/v4/chapters`, {
              headers: {
                'x-auth-token': accessToken,
                'x-client-id': clientId,
              },
              searchParams: {
                language: language,
              },
            })
            .json<SurahResponse>()

          console.log(
            'Surah list received:',
            surahResponse.chapters
              ? `${surahResponse.chapters.length} surahs`
              : 'no data',
          )

          return new Response(
            JSON.stringify({
              success: true,
              data: surahResponse.chapters,
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
        } catch (error) {
          console.error('Surah list fetch failed:', error)

          return new Response(
            JSON.stringify({
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred',
            }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
        }
      },
    },
  },
})
