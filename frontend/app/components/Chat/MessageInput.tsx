'use client';
import { useState } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Paper,
  InputAdornment,
  CircularProgress 
} from '@mui/material';
import { Send, AttachFile } from '@mui/icons-material';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function MessageInput({ 
  onSendMessage, 
  isLoading = false,
  placeholder = "Plan your trip... Ask me anything about European destinations!"
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'background.default',
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 2,
              },
            },
            '& .MuiInputBase-input': {
              py: 1.5,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    disabled={isLoading}
                    sx={{ color: 'text.secondary' }}
                  >
                    <AttachFile fontSize="small" />
                  </IconButton>
                  <IconButton
                    type="submit"
                    size="small"
                    disabled={!message.trim() || isLoading}
                    sx={{
                      color: message.trim() && !isLoading ? 'primary.main' : 'text.disabled',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'white',
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Send fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Paper>
  );
}