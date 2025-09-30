import { createFileRoute } from '@tanstack/react-router'
import tokenManager from '../utils/tokenManager'

export const Route = createFileRoute('/api/translations')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const accessToken = await tokenManager.getToken();
          const clientId = tokenManager.getClientId();

          if (!accessToken || !clientId) {
            return new Response(
              JSON.stringify({ error: 'Authentication tokens not available' }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }

          const response = await fetch(
            'https://apis.quran.foundation/content/api/v4/resources/translations',
            {
              method: 'GET',
              headers: {
                'x-auth-token': accessToken,
                'x-client-id': clientId,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Error fetching translations:', error);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to fetch translations',
              message: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      },
    },
  },
});