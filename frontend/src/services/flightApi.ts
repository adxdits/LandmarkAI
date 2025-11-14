// Flight API Service - Using Amadeus API
// Documentation: https://developers.amadeus.com/self-service/category/flights

const AMADEUS_API_KEY = 'lffMk7tTpZcsmSoQ7pbmumZtZQ7rU1Ak'
const AMADEUS_API_SECRET = 'pVyzB7uyHCIUobUr'
const AMADEUS_API_BASE = 'https://test.api.amadeus.com'

export interface FlightOffer {
  id: string
  airline: string
  carrierCode: string
  airlineLogoUrl: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  currency: string
  bookingUrl: string
  stops: number
  departureAirport: string
  arrivalAirport: string
  cabinClass: string
}

// Amadeus API Response Types
interface AmadeusFlightOffer {
  id: string
  itineraries: Array<{
    duration: string
    segments: Array<{
      departure: {
        iataCode: string
        at: string
      }
      arrival: {
        iataCode: string
        at: string
      }
      carrierCode: string
      number: string
    }>
  }>
  price: {
    total: string
    currency: string
  }
  travelerPricings: Array<{
    fareDetailsBySegment: Array<{
      cabin: string
    }>
  }>
}

interface AmadeusTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface CityToAirport {
  [key: string]: string
}

// Map cities to IATA airport codes
const cityToAirport: CityToAirport = {
  'Paris': 'CDG',
  'Rome': 'FCO',
  'London': 'LHR',
  'New York': 'JFK',
  'San Francisco': 'SFO',
  'Agra': 'AGR',
  'Sydney': 'SYD',
  'Rio de Janeiro': 'GIG',
  'Cairo': 'CAI',
  'Athens': 'ATH',
  'Barcelona': 'BCN',
  'Munich': 'MUC',
  'Beijing': 'PEK',
  'Amman': 'AMM',
  'Lima': 'LIM',
  'Delhi': 'DEL',
  'Istanbul': 'IST',
}

// Carrier codes to airline names
const carrierNames: { [key: string]: string } = {
  'AF': 'Air France',
  'BA': 'British Airways',
  'LH': 'Lufthansa',
  'EK': 'Emirates',
  'QR': 'Qatar Airways',
  'AA': 'American Airlines',
  'DL': 'Delta Air Lines',
  'UA': 'United Airlines',
  'IB': 'Iberia',
  'KL': 'KLM',
  'TK': 'Turkish Airlines',
}

// Get access token from Amadeus API
let cachedToken: { token: string; expiresAt: number } | null = null

const getAccessToken = async (): Promise<string> => {
  // Return cached token if still valid
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: AMADEUS_API_KEY,
      client_secret: AMADEUS_API_SECRET,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`)
  }

  const data: AmadeusTokenResponse = await response.json()
  
  // Cache token (expires in 30 minutes typically)
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // Refresh 1 min early
  }

  return data.access_token
}

// Get user's location based on destination (avoid same origin/destination)
const getUserLocation = (destinationCode: string): string => {
  // If destination is Paris, use New York as origin
  if (destinationCode === 'CDG') {
    return 'JFK'
  }
  // Otherwise, default to Paris
  return 'CDG'
}

// Convert Amadeus duration format (PT2H30M) to readable format
const parseDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?/)
  if (!match) return duration
  
  const hours = match[1] ? match[1].replace('H', 'h ') : ''
  const minutes = match[2] ? match[2].replace('M', 'm') : ''
  
  return (hours + minutes).trim()
}

// Transform Amadeus response to our FlightOffer format
const transformAmadeusOffer = (offer: AmadeusFlightOffer): FlightOffer => {
  const firstItinerary = offer.itineraries[0]
  const firstSegment = firstItinerary.segments[0]
  const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1]
  
  const carrierCode = firstSegment.carrierCode
  const airline = carrierNames[carrierCode] || carrierCode
  const airlineLogoUrl = `https://images.kiwi.com/airlines/64/${carrierCode}.png`
  
  const cabin = offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'ECONOMY'
  const cabinClass = cabin.charAt(0) + cabin.slice(1).toLowerCase()
  
  return {
    id: offer.id,
    airline,
    carrierCode,
    airlineLogoUrl,
    departureTime: firstSegment.departure.at,
    arrivalTime: lastSegment.arrival.at,
    duration: parseDuration(firstItinerary.duration),
    price: parseFloat(offer.price.total),
    currency: offer.price.currency,
    bookingUrl: `https://www.google.com/flights?q=flights+from+${firstSegment.departure.iataCode}+to+${lastSegment.arrival.iataCode}`,
    stops: firstItinerary.segments.length - 1,
    departureAirport: firstSegment.departure.iataCode,
    arrivalAirport: lastSegment.arrival.iataCode,
    cabinClass,
  }
}

/**
 * Search for flights to a destination city
 * @param city - Destination city name
 * @param origin - Origin airport code (optional, auto-determined if not provided)
 * @returns Array of flight offers
 */
export const searchFlights = async (city: string, origin?: string): Promise<FlightOffer[]> => {
  const destinationCode = cityToAirport[city] || 'CDG'
  let originCode = origin || getUserLocation(destinationCode)
  
  // If origin and destination are the same, automatically switch to alternate origin
  if (originCode === destinationCode) {
    originCode = originCode === 'CDG' ? 'JFK' : 'CDG'
    console.log(`Origin and destination were same (${destinationCode}), auto-switched origin to ${originCode}`)
  }
  
  try {
    // Get access token
    const token = await getAccessToken()
    
    // Get departure date (7 days from now)
    const departureDate = new Date()
    departureDate.setDate(departureDate.getDate() + 7)
    const departureDateStr = departureDate.toISOString().split('T')[0]
    
    // Build request body according to Amadeus API spec
    const requestBody = {
      currencyCode: 'EUR',
      originDestinations: [
        {
          id: '1',
          originLocationCode: originCode,
          destinationLocationCode: destinationCode,
          departureDateTimeRange: {
            date: departureDateStr
          }
        }
      ],
      travelers: [
        {
          id: '1',
          travelerType: 'ADULT'
        }
      ],
      sources: ['GDS'],
      searchCriteria: {
        maxFlightOffers: 3
      }
    }
    
    console.log('Calling Amadeus API POST with body:', requestBody)
    
    const response = await fetch(`${AMADEUS_API_BASE}/v2/shopping/flight-offers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/vnd.amadeus+json',
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Amadeus API error details:', errorBody)
      throw new Error(`Amadeus API error: ${response.statusText} - ${errorBody}`)
    }
    
    const data = await response.json()
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No flights found')
    }
    
    // Transform and return up to 3 offers
    return data.data.slice(0, 3).map(transformAmadeusOffer)
    
  } catch (error) {
    console.error('Error fetching flights from Amadeus:', error)
    throw error
  }
}

/**
 * Format date for display
 */
export const formatFlightDate = (isoDate: string): string => {
  const date = new Date(isoDate)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format duration
 */
export const formatDuration = (duration: string): string => {
  return duration
}

/**
 * Format price
 */
export const formatPrice = (price: number, currency: string): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(price)
}
