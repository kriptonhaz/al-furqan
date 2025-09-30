import ky from 'ky'

interface TokenData {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  expires_at: number // Timestamp when token expires
}

class TokenManager {
  private static instance: TokenManager
  private tokenData: TokenData | null = null
  private tokenPromise: Promise<TokenData> | null = null

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  private isTokenValid(): boolean {
    if (!this.tokenData) return false
    
    // Check if token expires in the next 60 seconds (buffer time)
    const now = Date.now()
    const bufferTime = 60 * 1000 // 60 seconds
    
    return this.tokenData.expires_at > (now + bufferTime)
  }

  private async fetchNewToken(): Promise<TokenData> {
    const clientId = process.env.QURAN_CLIENT_ID
    const clientSecret = process.env.QURAN_CLIENT_SECRET
    const baseUrl = process.env.QURAN_API_BASE_URL

    if (!clientId || !clientSecret || !baseUrl) {
      throw new Error('Missing required environment variables for OAuth2')
    }

    console.log('Fetching new OAuth2 token...')
    
    // Use the same method as the working Surah API
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const tokenResponse = await ky
      .post(`${baseUrl}/oauth2/token`, {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'content',
        }).toString(),
      })
      .json<{
        access_token: string
        token_type: string
        expires_in: number
        scope: string
      }>()

    // Calculate expiry timestamp
    const expires_at = Date.now() + (tokenResponse.expires_in * 1000)

    const tokenData: TokenData = {
      ...tokenResponse,
      expires_at,
    }

    this.tokenData = tokenData
    console.log('New OAuth2 token obtained, expires at:', new Date(expires_at).toISOString())
    
    return tokenData
  }

  async getToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.isTokenValid() && this.tokenData) {
      console.log('Using cached OAuth2 token')
      return this.tokenData.access_token
    }

    // If we're already fetching a token, wait for that promise
    if (this.tokenPromise) {
      console.log('Waiting for ongoing token request...')
      const tokenData = await this.tokenPromise
      return tokenData.access_token
    }

    // Fetch a new token
    this.tokenPromise = this.fetchNewToken()
    
    try {
      const tokenData = await this.tokenPromise
      return tokenData.access_token
    } finally {
      // Clear the promise so future calls can make new requests if needed
      this.tokenPromise = null
    }
  }

  // Method to get client ID for API calls
  getClientId(): string {
    const clientId = process.env.QURAN_CLIENT_ID
    if (!clientId) {
      throw new Error('QURAN_CLIENT_ID environment variable is missing')
    }
    return clientId
  }

  // Method to clear token (useful for testing or forced refresh)
  clearToken(): void {
    this.tokenData = null
    this.tokenPromise = null
    console.log('Token cache cleared')
  }
}

export default TokenManager.getInstance()