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

// Cache for airport codes to avoid repeated API calls
const airportCache = new Map<string, string>()
const airlineCache = new Map<string, string>()

interface CityToAirport {
  [key: string]: string
}

// Map cities to IATA airport codes (fallback)
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

// Get airport code from city name using Amadeus API
const getAirportCode = async (city: string, token: string): Promise<string> => {
  console.log('getAirportCode called with city:', city)
  if (airportCache.has(city)) {
    console.log('Using cached airport code:', airportCache.get(city))
    return airportCache.get(city)!
  }

  const response = await fetch(
    `${AMADEUS_API_BASE}/v1/reference-data/locations?keyword=${encodeURIComponent(city)}&subType=AIRPORT&page[limit]=1`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  ).catch(() => null)

  const json = response?.ok ? await response.json().catch(() => null) : null
  console.log('Airport API response for', city, ':', json)
  
  const code = json?.data?.[0]?.iataCode || cityToAirport[city] || 'CDG'
  console.log('Airport code for', city, ':', code)
    
  airportCache.set(city, code)
  return code
}

// Get airline name from carrier code using Amadeus API
const getAirlineName = async (carrierCode: string, token: string): Promise<string> => {
  if (airlineCache.has(carrierCode)) {
    return airlineCache.get(carrierCode)!
  }

  const response = await fetch(
    `${AMADEUS_API_BASE}/v1/reference-data/airlines?airlineCodes=${carrierCode}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  ).catch(() => null)

  const name = response?.ok
    ? (await response.json().catch(() => null))?.data?.[0]?.businessName || carrierNames[carrierCode] || carrierCode
    : carrierNames[carrierCode] || carrierCode
    
  airlineCache.set(carrierCode, name)
  return name
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
const transformAmadeusOffer = async (offer: AmadeusFlightOffer, token: string, departureDate: string): Promise<FlightOffer> => {
  const firstItinerary = offer.itineraries[0]
  const firstSegment = firstItinerary.segments[0]
  const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1]
  
  const carrierCode = firstSegment.carrierCode
  const airline = await getAirlineName(carrierCode, token)
  const airlineLogoUrl = `https://images.kiwi.com/airlines/64/${carrierCode}.png`
  
  const cabin = offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'ECONOMY'
  const cabinClass = cabin.charAt(0) + cabin.slice(1).toLowerCase()
  
  // Build Skyscanner URL with date format YYMMDD
  const originCode = firstSegment.departure.iataCode
  const destCode = lastSegment.arrival.iataCode
  const [year, month, day] = departureDate.split('-')
  const skyscannerDate = `${year.slice(2)}${month}${day}`
  const bookingUrl = `https://www.skyscanner.com/transport/flights/${originCode}/${destCode}/${skyscannerDate}/`
  
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
    bookingUrl,
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
 * @param departureDate - Departure date in YYYY-MM-DD format (optional, defaults to 7 days from now)
 * @returns Array of flight offers
 */
export const searchFlights = async (city: string, origin?: string, departureDate?: string): Promise<FlightOffer[]> => {
  console.log('searchFlights called:', { city, origin, departureDate })
  const token = await getAccessToken()
  console.log('Token obtained')
  const destinationCode = await getAirportCode(city, token)
  console.log('Destination code:', destinationCode)
  let originCode = origin || getUserLocation(destinationCode)
  console.log('Origin code:', originCode)
  
  // If origin and destination are the same, automatically switch to alternate origin
  if (originCode === destinationCode) {
    originCode = originCode === 'CDG' ? 'JFK' : 'CDG'
  }
    
  // Get departure date
  const departureDateStr = departureDate || (() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().split('T')[0]
  })()
    
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
    
    const response = await fetch(`${AMADEUS_API_BASE}/v2/shopping/flight-offers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/vnd.amadeus+json',
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      console.log('API response not OK:', response.status)
      return []
    }
    
    const data = await response.json()
    console.log('API data:', data)
    
    if (!data.data || data.data.length === 0) {
      console.log('No flights found in API response')
      return []
    }
    
    const offers = await Promise.all(data.data.slice(0, 3).map((offer: AmadeusFlightOffer) => transformAmadeusOffer(offer, token, departureDateStr)))
    console.log('Transformed offers:', offers)
    return offers
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
