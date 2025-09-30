import { createFileRoute } from '@tanstack/react-router'
import ky from 'ky'
import tokenManager from '../utils/tokenManager'

export const Route = createFileRoute('/api/languages')({
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

          // Fetch the languages list using the access token
          const response = await ky
            .get(`${contentApiUrl}/content/api/v4/resources/languages`, {
              headers: {
                'x-auth-token': accessToken,
                'x-client-id': clientId,
              },
            })
            .json()
          
          return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          })
        } catch (error) {
          console.error('Error fetching languages:', error)
          return new Response(
            JSON.stringify({ 
              error: 'Failed to fetch languages',
              details: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          )
        }
      },
    },
  },
})