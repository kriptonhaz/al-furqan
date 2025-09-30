import { createFileRoute } from '@tanstack/react-router'
import ky from 'ky'
import type { SurahResponse } from '../types/surah'
import tokenManager from '../utils/tokenManager'

export const Route = createFileRoute('/api/surah')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const contentApiUrl = process.env.QURAN_CONTENT_API_BASE_URL

          if (!contentApiUrl) {
            throw new Error('Missing QURAN_CONTENT_API_BASE_URL environment variable')
          }

          // Get token from the global token manager
          const accessToken = await tokenManager.getToken()
          const clientId = tokenManager.getClientId()

          // Now fetch the Surah list using the access token
          console.log('Fetching Surah list...')
          const surahResponse = await ky
            .get(`${contentApiUrl}/content/api/v4/chapters`, {
              headers: {
                'x-auth-token': accessToken,
                'x-client-id': clientId,
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
