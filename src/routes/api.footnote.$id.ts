import { createFileRoute } from '@tanstack/react-router'
import ky from 'ky'
import type { FootNoteResponse } from '../types/surah'
import tokenManager from '../utils/tokenManager'

export const Route = createFileRoute('/api/footnote/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const { id: footnoteId } = params
          const contentApiUrl = process.env.QURAN_CONTENT_API_BASE_URL

          if (!contentApiUrl) {
            throw new Error('Missing QURAN_CONTENT_API_BASE_URL environment variable')
          }

          if (!footnoteId) {
            throw new Error('Footnote ID is required')
          }

          // Get token from the global token manager
          const accessToken = await tokenManager.getToken()
          const clientId = tokenManager.getClientId()

          // Fetch the footnote using the access token
          console.log(`Fetching footnote ${footnoteId}...`)
          const footnoteResponse = await ky
            .get(`${contentApiUrl}/content/api/v4/foot_notes/${footnoteId}`, {
              headers: {
                'x-auth-token': accessToken,
                'x-client-id': clientId,
              },
            })
            .json<FootNoteResponse>()

          console.log(
            'Footnote received:',
            footnoteResponse.foot_note
              ? `ID: ${footnoteResponse.foot_note.id}`
              : 'no data',
          )

          return new Response(
            JSON.stringify({
              success: true,
              data: footnoteResponse.foot_note,
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
        } catch (error) {
          console.error('Footnote fetch failed:', error)

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