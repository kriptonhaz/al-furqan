import { createFileRoute } from '@tanstack/react-router'
import ky from 'ky'
import type { RecitationsResponse } from '../types/surah'
import tokenManager from '../utils/tokenManager'

export const Route = createFileRoute('/api/recitations')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const contentApiUrl = process.env.QURAN_CONTENT_API_BASE_URL

          if (!contentApiUrl) {
            throw new Error(
              'Missing QURAN_CONTENT_API_BASE_URL environment variable',
            )
          }

          // Get token from the global token manager
          const accessToken = await tokenManager.getToken()
          const clientId = tokenManager.getClientId()

          // Fetch the recitations list using the access token
          const recitationsResponse = await ky
            .get(`${contentApiUrl}/content/api/v4/resources/recitations`, {
              headers: {
                'x-auth-token': accessToken,
                'x-client-id': clientId,
              },
            })
            .json<RecitationsResponse>()

          return new Response(
            JSON.stringify({
              success: true,
              data: recitationsResponse.recitations,
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
        } catch (error) {
          console.error('Error fetching recitations:', error)

          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to fetch recitations',
              details: error instanceof Error ? error.message : 'Unknown error',
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
