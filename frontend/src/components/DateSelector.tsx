import React from 'react'
import { Box, TextField, Typography } from '@mui/material'
import { CalendarToday } from '@mui/icons-material'

interface DateSelectorProps {
  value: string
  onChange: (value: string) => void
}

const DateSelector: React.FC<DateSelectorProps> = ({ value, onChange }) => {
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 1)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <CalendarToday sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
        <Typography variant="body2" fontWeight={600} color="text.primary">
          Date de départ
        </Typography>
      </Box>
      <TextField
        type="date"
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        inputProps={{
          min: minDateStr,
          max: maxDateStr
        }}
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
      />
    </Box>
  )
}

export default DateSelector
