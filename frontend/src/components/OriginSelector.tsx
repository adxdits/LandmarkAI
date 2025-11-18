import React, { useEffect, useState } from 'react'
import { Box, TextField, MenuItem, Typography, CircularProgress } from '@mui/material'
import { Flight } from '@mui/icons-material'

interface OriginSelectorProps {
  value: string
  onChange: (value: string) => void
}

interface Airport {
  code: string
  name: string
  city: string
}

const AMADEUS_API_KEY = 'lffMk7tTpZcsmSoQ7pbmumZtZQ7rU1Ak'
const AMADEUS_API_SECRET = 'pVyzB7uyHCIUobUr'
const AMADEUS_API_BASE = 'https://test.api.amadeus.com'

const OriginSelector: React.FC<OriginSelectorProps> = ({ value, onChange }) => {
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(true)
  const hasInitialized = React.useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true
    
    const fetchAirports = async () => {
      const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: AMADEUS_API_KEY,
          client_secret: AMADEUS_API_SECRET,
        }),
      }).catch(() => null)

      if (!tokenResponse?.ok) {
        setLoading(false)
        return
      }

      const { access_token } = await tokenResponse.json()

      const cities = ['Paris', 'New York', 'London', 'Rome', 'Madrid', 'Barcelona', 'Amsterdam', 'Frankfurt', 'Munich', 'Dubai']
      const airportPromises = cities.map(async (city) => {
        const response = await fetch(
          `${AMADEUS_API_BASE}/v1/reference-data/locations?keyword=${encodeURIComponent(city)}&subType=AIRPORT&page[limit]=1`,
          { headers: { 'Authorization': `Bearer ${access_token}` } }
        ).catch(() => null)

        if (response?.ok) {
          const data = await response.json()
          const airport = data?.data?.[0]
          if (airport) {
            return {
              code: airport.iataCode,
              name: airport.name,
              city: airport.address?.cityName || city
            }
          }
        }
        return null
      })

      const results = await Promise.all(airportPromises)
      const filteredAirports = results.filter((a): a is Airport => a !== null)
      setAirports(filteredAirports)
      
      if (filteredAirports.length > 0 && !value) {
        onChange(filteredAirports[0].code)
      }
      
      setLoading(false)
    }

    fetchAirports()
  }, [])

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Flight sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
        <Typography variant="body2" fontWeight={600} color="text.primary">
          Point de départ
        </Typography>
      </Box>
      <TextField
        select
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        disabled={loading}
        sx={{
          bgcolor: 'white',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#EBEBEB',
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      >
        {loading ? (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Chargement des aéroports...
          </MenuItem>
        ) : (
          airports.map((airport) => (
            <MenuItem key={airport.code} value={airport.code}>
              {airport.city} ({airport.code}) - {airport.name}
            </MenuItem>
          ))
        )}
      </TextField>
    </Box>
  )
}

export default OriginSelector
