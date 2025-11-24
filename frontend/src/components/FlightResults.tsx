import React, { useState, useEffect } from 'react'
import { Box, Typography, Stack, Paper, Chip, Button, CircularProgress } from '@mui/material'
import { Snackbar, Alert } from '@mui/material'
import { Flight, FlightTakeoff, FlightLand, AirlineSeatReclineNormal } from '@mui/icons-material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import type { FlightResultsProps } from '../types'
import { formatFlightDate, formatPrice } from '../services/flightApi'
import { saveFlightForUser, checkUserHasTicket } from '../services/historyApi'

const FlightResults: React.FC<FlightResultsProps> = ({ flights }) => {
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({})
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({ open: false, severity: 'success', message: '' })
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({})
  // map flight.id -> created ticket id (if available). Used to clear saved state when a history entry is deleted elsewhere

  useEffect(() => {
    // Check for each flight whether the current user already saved it
    const stored = localStorage.getItem('currentUserId')
    if (!stored) return
    const userId = Number(stored)
    if (!userId) return

    const toDate = (s: string | undefined) => {
      if (!s) return undefined
      try {
        const d = new Date(s)
        if (isNaN(d.getTime())) return undefined
        return d.toISOString().slice(0, 10)
      } catch (e) {
        return undefined
      }
    }

    flights.forEach(async (flight) => {
      try {
        const exists = await checkUserHasTicket({
          userId,
          poiName: flight.monument || flight.city || 'Destination',
          poiLocation: `${flight.city || ''}, ${flight.country || ''}`,
          price: Number(flight.price) || 0,
          transport_mode: 'Avion',
          start_date: toDate(flight.departureTime),
          end_date: toDate(flight.arrivalTime),
        })
        // checkUserHasTicket returns a boolean (true if user already saved this ticket)
        if (exists) {
          setSavedIds(prev => ({ ...prev, [flight.id]: true }))
        }
      } catch (e) {
        // ignore check errors; keep button enabled
        // eslint-disable-next-line no-console
        console.debug('history check failed', e)
      }
    })
  }, [flights])

  // Listen for deletions from other components (Header dispatches a `historyDeleted` CustomEvent with detail.ticketId)
  useEffect(() => {
    const onHistoryDeleted = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent)?.detail || {}
        // Ticket id may be provided in detail, but we don't need it here — we'll refresh checks for all flights
        // debug hook to help trace why UI didn't update
        // eslint-disable-next-line no-console
        console.debug('FlightResults: received historyDeleted', detail)

        // For each flight, re-run the checkUserHasTicket to recompute saved state.
        ;(async () => {
          try {
            const stored = localStorage.getItem('currentUserId')
            if (!stored) return
            const userId = Number(stored)
            if (!userId) return

            const toDate = (s: string | undefined) => {
              if (!s) return undefined
              try {
                const d = new Date(s)
                if (isNaN(d.getTime())) return undefined
                return d.toISOString().slice(0, 10)
              } catch (e) {
                return undefined
              }
            }

            const results = await Promise.all(flights.map(async (flight) => {
              try {
                const exists = await checkUserHasTicket({
                  userId,
                  poiName: flight.monument || flight.city || 'Destination',
                  poiLocation: `${flight.city || ''}, ${flight.country || ''}`,
                  price: Number(flight.price) || 0,
                  transport_mode: 'Avion',
                  start_date: toDate(flight.departureTime),
                  end_date: toDate(flight.arrivalTime),
                })
                return { flightId: flight.id, exists }
              } catch (e) {
                // treat errors as not existing
                return { flightId: flight.id, exists: false }
              }
            }))

            // Build new savedIds map from results
            const nextSaved: Record<string, boolean> = {}
            results.forEach(r => {
              if (r.exists) nextSaved[r.flightId] = true
            })
            setSavedIds(nextSaved)
            // eslint-disable-next-line no-console
            console.debug('FlightResults: recomputed savedIds after deletion', nextSaved)
          } catch (e) {
            // ignore overall errors
          }
        })()
      } catch (e) {
        // ignore
      }
    }

    window.addEventListener('historyDeleted', onHistoryDeleted as EventListener)
    return () => window.removeEventListener('historyDeleted', onHistoryDeleted as EventListener)
  }, [flights])

  // Recompute saved state when the selected user changes
  useEffect(() => {
    const onUserChanged = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent)?.detail || {}
        // eslint-disable-next-line no-console
        console.debug('FlightResults: received userChanged', detail)

        ;(async () => {
          try {
            const stored = localStorage.getItem('currentUserId')
            if (!stored) {
              setSavedIds({})
              return
            }
            const userId = Number(stored)
            if (!userId) {
              setSavedIds({})
              return
            }

            const toDate = (s: string | undefined) => {
              if (!s) return undefined
              try {
                const d = new Date(s)
                if (isNaN(d.getTime())) return undefined
                return d.toISOString().slice(0, 10)
              } catch (e) {
                return undefined
              }
            }

            const results = await Promise.all(flights.map(async (flight) => {
              try {
                const exists = await checkUserHasTicket({
                  userId,
                  poiName: flight.monument || flight.city || 'Destination',
                  poiLocation: `${flight.city || ''}, ${flight.country || ''}`,
                  price: Number(flight.price) || 0,
                  transport_mode: 'Avion',
                  start_date: toDate(flight.departureTime),
                  end_date: toDate(flight.arrivalTime),
                })
                return { flightId: flight.id, exists }
              } catch (e) {
                return { flightId: flight.id, exists: false }
              }
            }))

            const nextSaved: Record<string, boolean> = {}
            results.forEach(r => { if (r.exists) nextSaved[r.flightId] = true })
            setSavedIds(nextSaved)
            // eslint-disable-next-line no-console
            console.debug('FlightResults: recomputed savedIds on user change', nextSaved)
          } catch (e) {
            // ignore
          }
        })()
      } catch (e) {
        // ignore
      }
    }

    window.addEventListener('userChanged', onUserChanged as EventListener)
    return () => window.removeEventListener('userChanged', onUserChanged as EventListener)
  }, [flights])

  const handleBookNow = (bookingUrl: string) => {
    window.open(bookingUrl, '_blank', 'noopener,noreferrer')
  }

  const handleSave = async (flight: any) => {
    const id = flight.id
    try {
      setSavingIds(prev => ({ ...prev, [id]: true }))
      const stored = localStorage.getItem('currentUserId')
      if (!stored) throw new Error('No current user selected')
      const userId = Number(stored)
        await saveFlightForUser(flight, userId)
      // mark as saved in UI
      setSavedIds(prev => ({ ...prev, [id]: true }))
      // simple feedback - alert for now
      setSnack({ open: true, severity: 'success', message: 'Flight saved to your history' })
    } catch (e: any) {
      console.error('Save failed', e)
      setSnack({ open: true, severity: 'error', message: 'Error during save: ' + (e?.message || '') })
    } finally {
      setSavingIds(prev => ({ ...prev, [id]: false }))
    }
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
                {((flight as any).airlineLogoUrl) ? (
                  <img 
                    src={(flight as any).airlineLogoUrl} 
                    alt={flight.airline}
                    style={{ width: 40, height: 40, objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : null}
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
              <Stack direction="row" spacing={2} alignItems="center">
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

                <Button
                  variant={savedIds[flight.id] ? 'contained' : 'outlined'}
                  color={savedIds[flight.id] ? 'success' : 'primary'}
                  size="large"
                  onClick={() => handleSave(flight)}
                  disabled={Boolean(savingIds[flight.id]) || Boolean(savedIds[flight.id])}
                  startIcon={savedIds[flight.id] ? <CheckCircleOutlineIcon /> : undefined}
                  sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                  {savingIds[flight.id] ? <CircularProgress size={18} /> : (savedIds[flight.id] ? 'Sauvegardé' : 'Sauvegarder')}
                </Button>
              </Stack>
            </Box>
          </Paper>
        ))}
      </Stack>
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default FlightResults