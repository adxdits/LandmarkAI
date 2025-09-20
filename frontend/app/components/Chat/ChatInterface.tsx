'use client';
import { useState, useRef, useEffect } from 'react';
import { Box, Container, Typography, Paper, Divider } from '@mui/material';
import ChatMessage from './ChatMessage';
import CameraInput from './CameraInput';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  image?: string;
  imageFile?: File;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Set mounted to true to enable client-side rendering
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Initialize welcome message after component mounts to avoid hydration issues
    if (!isInitialized && isMounted) {
      setMessages([{
        id: '1',
        text: "Show me where do you wanna go",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      setIsInitialized(true);
    }
  }, [isInitialized, isMounted]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCameraCapture = async (imageData: string, imageFile: File) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `📸 ${imageFile.name}`,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: imageData,
      imageFile: imageFile,
    };

    setMessages(prev => [...prev, userMessage]);
    // Here you would process the image with your backend
    console.log('Image data:', imageData);
    console.log('Image file:', imageFile);
  };

  // Prevent SSR hydration issues by only rendering on client
  if (!isMounted) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Loading chat...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          py: 2,
          px: 3,
          backgroundColor: 'background.paper',
          borderRadius: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h5" fontWeight={600} color="primary.main">
            AI Trip Planner
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your personal European travel assistant
          </Typography>
        </Container>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          py: 3,
        }}
      >
        <Container maxWidth="md">
          {!isInitialized ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Loading...
              </Typography>
            </Box>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.text}
                isUser={message.isUser}
                timestamp={message.timestamp}
                image={message.image}
              />
            ))
          )}
          
          {isLoading && (
            <ChatMessage
              message="I'm thinking about your request..."
              isUser={false}
            />
          )}
          
          <div ref={messagesEndRef} />
        </Container>
      </Box>

      {/* Camera Input Area */}
      <Container maxWidth="md" sx={{ pb: 2 }}>
        {isInitialized && (
          <CameraInput
            onImageCapture={handleCameraCapture}
            isLoading={isLoading}
          />
        )}
      </Container>
    </Box>
  );
}