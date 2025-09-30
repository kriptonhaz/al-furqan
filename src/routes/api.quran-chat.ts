import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/quran-chat')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const { message } = body

          if (!message) {
            return new Response(JSON.stringify({ error: 'Message is required' }), { 
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            })
          }

          const openRouterApiUrl = process.env.OPENROUTER_API_BASE_URL
          const openRouterToken = process.env.OPENROUTER_API_TOKEN
          const openRouterModel = process.env.OPENROUTER_MODEL

          if (!openRouterApiUrl || !openRouterToken || !openRouterModel) {
            return new Response(JSON.stringify({ error: 'OpenRouter API configuration is missing' }), { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            })
          }

          const response = await fetch(`${openRouterApiUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: openRouterModel,
              messages: [
                {
                  role: 'system',
                  content: 'You are a quran bot agent that will reply the user chat with quran surah and verses, the language will also follow along with the user prompt'
                },
                {
                  role: 'user',
                  content: message
                }
              ],
              max_tokens: 500,
              temperature: 0.7
            })
          })

          if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`)
          }

          const data = await response.json()
          
          return new Response(JSON.stringify({ 
            success: true, 
            data: data.choices[0].message.content 
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })

        } catch (error) {
          console.error('Error in quran-chat API:', error)
          return new Response(JSON.stringify({ 
            error: 'Failed to process chat request',
            message: error instanceof Error ? error.message : 'Unknown error'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      },
    },
  },
})