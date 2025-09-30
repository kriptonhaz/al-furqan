import { createFileRoute } from '@tanstack/react-router'
import ky from 'ky'
import type { VersesResponse } from '../types/surah'
import tokenManager from '../utils/tokenManager'

export const Route = createFileRoute('/api/verses/$chapterNumber')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        try {
          const chapterNumber = params.chapterNumber
          
          // Parse query parameters from the request URL
          const url = new URL(request.url)
          const page = url.searchParams.get('page') || '1'
          const perPage = url.searchParams.get('per_page') || '50'

          // Get environment variables
          const contentApiUrl = process.env.QURAN_CONTENT_API_BASE_URL

          if (!contentApiUrl) {
            console.error(
              'Missing QURAN_CONTENT_API_BASE_URL environment variable',
            )
            return new Response(
              JSON.stringify({
                success: false,
                error:
                  'Missing QURAN_CONTENT_API_BASE_URL environment variable',
              }),
              {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          // Get token from the global token manager
          const accessToken = await tokenManager.getToken()
          const clientId = tokenManager.getClientId()

          console.log(`Fetching verses for chapter ${chapterNumber}...`)
          // Fetch verses using the access token
          const versesResponse = await ky
            .get(
              `${contentApiUrl}/content/api/v4/verses/by_chapter/${chapterNumber}`,
              {
                headers: {
                  'x-auth-token': accessToken,
                  'x-client-id': clientId,
                },
                searchParams: {
                  fields: 'text_uthmani,translations',
                  translations: '85',
                  page: page,
                  per_page: perPage,
                },
              },
            )
            .json<VersesResponse>()

          console.log(
            'Verses received:',
            versesResponse.verses
              ? `${versesResponse.verses.length} verses`
              : 'no data',
          )

          return new Response(
            JSON.stringify({
              success: true,
              data: versesResponse,
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        } catch (error) {
          console.error('Error fetching verses:', error)
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to fetch verses',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }
      },
    },
  },
})
