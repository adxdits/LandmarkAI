import React from 'react'
import { Box, Typography } from '@mui/material'

const Footer: React.FC = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        px: 3,
        mt: 'auto',
        borderTop: '1px solid #EBEBEB',
        bgcolor: 'white'
      }}
    >
      <Typography variant="body2" color="text.secondary" align="center">
        © 2025 OneEurotrip • Discover the world through your lens
      </Typography>
    </Box>
  )
}

export default Footer