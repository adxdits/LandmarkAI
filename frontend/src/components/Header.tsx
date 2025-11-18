import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Avatar } from '@mui/material'
import { Flight, Menu as MenuIcon } from '@mui/icons-material'

const Header: React.FC = () => {
  return (
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        bgcolor: 'white', 
        borderBottom: '1px solid #EBEBEB',
      }}
    >
      <Toolbar>
        <IconButton edge="start" sx={{ mr: 2, color: 'primary.main' }}>
          <MenuIcon />
        </IconButton>
        <Flight sx={{ mr: 1, color: 'primary.main' }} />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            color: 'primary.main',
            fontWeight: 700,
            fontSize: '1.5rem'
          }}
        >
          OneEurotrip
        </Typography>
        <Avatar sx={{ bgcolor: 'secondary.main' }}>U</Avatar>
      </Toolbar>
    </AppBar>
  )
}

export default Header