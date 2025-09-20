'use client';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import { Person, SmartToy } from '@mui/icons-material';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  image?: string;
}

export default function ChatMessage({ message, isUser, timestamp, image }: ChatMessageProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        mb: 3,
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          width: 40,
          height: 40,
        }}
      >
        {isUser ? <Person /> : <SmartToy />}
      </Avatar>
      
      <Box sx={{ maxWidth: '70%', minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: isUser ? 'primary.main' : 'background.paper',
            color: isUser ? 'white' : 'text.primary',
            borderRadius: 3,
            border: isUser ? 'none' : '1px solid',
            borderColor: 'divider',
          }}
        >
          {image && (
            <Box
              sx={{
                mb: image && message ? 2 : 0,
                borderRadius: 2,
                overflow: 'hidden',
                maxWidth: '300px',
                cursor: 'pointer',
              }}
              onClick={() => {
                // Open image in full screen
                const newWindow = window.open();
                if (newWindow) {
                  newWindow.document.write(`
                    <html>
                      <head><title>Image Preview</title></head>
                      <body style="margin:0;padding:20px;background:#000;display:flex;justify-content:center;align-items:center;min-height:100vh;">
                        <img src="${image}" style="max-width:100%;max-height:100%;object-fit:contain;" />
                      </body>
                    </html>
                  `);
                }
              }}
            >
              <img
                src={image}
                alt="Captured destination"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '8px',
                }}
              />
            </Box>
          )}
          
          {message && (
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.5,
              }}
            >
              {message}
            </Typography>
          )}
        </Paper>
        
        {timestamp && (
          <Typography
            variant="caption"
            color="text.secondary"
            suppressHydrationWarning={true}
            sx={{
              display: 'block',
              mt: 0.5,
              px: 1,
              textAlign: isUser ? 'right' : 'left',
            }}
          >
            {timestamp}
          </Typography>
        )}
      </Box>
    </Box>
  );
}