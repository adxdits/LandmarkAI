import React from 'react'
import { Box, TextField, MenuItem, Typography } from '@mui/material'
import { Flight } from '@mui/icons-material'

interface OriginSelectorProps {
  value: string
  onChange: (value: string) => void
}

const airports = [
  { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris' },
  { code: 'JFK', name: 'New York JFK', city: 'New York' },
  { code: 'LHR', name: 'London Heathrow', city: 'London' },
  { code: 'FCO', name: 'Rome Fiumicino', city: 'Rome' },
  { code: 'MAD', name: 'Madrid Barajas', city: 'Madrid' },
  { code: 'BCN', name: 'Barcelona El Prat', city: 'Barcelona' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai' },
]

const OriginSelector: React.FC<OriginSelectorProps> = ({ value, onChange }) => {
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
        {airports.map((airport) => (
          <MenuItem key={airport.code} value={airport.code}>
            {airport.city} ({airport.code}) - {airport.name}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}

export default OriginSelector
