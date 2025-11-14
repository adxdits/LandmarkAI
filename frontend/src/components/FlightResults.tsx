import React from 'react'
import { Box, Typography, Stack, Paper, Chip, Button } from '@mui/material'
import { Flight, FlightTakeoff, FlightLand, AirlineSeatReclineNormal } from '@mui/icons-material'
import type { FlightResultsProps } from '../types'
import { formatFlightDate, formatPrice } from '../services/flightApi'

const FlightResults: React.FC<FlightResultsProps> = ({ flights }) => {
  const handleBookNow = (bookingUrl: string) => {
    window.open(bookingUrl, '_blank', 'noopener,noreferrer')
  }

  // Show monument info if available
  const monumentInfo = flights[0]?.monument
  const cityInfo = flights[0]?.city
  const countryInfo = flights[0]?.country

  return (
    <Box>
      {monumentInfo && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: 'primary.main',
            border: '2px solid',
            borderColor: 'primary.main',
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" fontWeight={700} color="white" gutterBottom>
            Monument Reconnu
          </Typography>
          <Typography variant="body1" color="white">
            <strong>{monumentInfo}</strong> • {cityInfo}, {countryInfo}
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Flight sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Vols Disponibles vers {cityInfo}
        </Typography>
      </Box>

      <Stack spacing={2}>
        {flights.map((flight) => (
          <Paper 
            key={flight.id}
            elevation={0}
            sx={{ 
              p: 3,
              bgcolor: 'white',
              border: '1px solid #EBEBEB',
              borderRadius: 3,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            {/* Airline and Cabin Class */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img 
                  src={flight.airlineLogoUrl} 
                  alt={flight.airline}
                  style={{ width: 40, height: 40, objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <Typography variant="h6" fontWeight={700} color="primary.dark">
                  {flight.airline}
                </Typography>
              </Box>
              <Chip
                icon={<AirlineSeatReclineNormal />}
                label={flight.cabinClass}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            {/* Flight Times */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FlightTakeoff sx={{ color: 'secondary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Départ • {flight.departureAirport}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatFlightDate(flight.departureTime)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ textAlign: 'center', px: 2 }}>
                <Chip 
                  label={flight.duration} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'secondary.light',
                    color: 'white',
                    fontWeight: 600
                  }} 
                />
                <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                  {flight.stops === 0 ? 'Direct' : `${flight.stops} escale${flight.stops > 1 ? 's' : ''}`}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, textAlign: 'right' }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Arrivée • {flight.arrivalAirport}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatFlightDate(flight.arrivalTime)}
                    </Typography>
                  </Box>
                  <FlightLand sx={{ color: 'secondary.main' }} />
                </Stack>
              </Box>
            </Box>

            {/* Price and Book Button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid #EBEBEB' }}>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {formatPrice(flight.price, flight.currency)}
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => handleBookNow(flight.bookingUrl)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(255, 56, 92, 0.3)',
                  }
                }}
              >
                Réserver Maintenant
              </Button>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

export default FlightResults