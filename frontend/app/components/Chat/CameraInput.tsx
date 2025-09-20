'use client';

import { useState, useRef } from 'react';
import { 
  Box, 
  Paper,
  Typography,
  Fab,
  Stack
} from '@mui/material';
import { CameraAlt, PhotoLibrary, FlipCameraAndroid } from '@mui/icons-material';

/**
 * Props interface for the CameraInput component
 */
interface CameraInputProps {
  /** Callback function called when an image is captured/selected */
  onImageCapture: (imageData: string, imageFile: File) => void;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
}

/**
 * CameraInput component - Allows users to capture photos using camera or select from gallery
 */
export default function CameraInput({ 
  onImageCapture, 
  isLoading = false 
}: CameraInputProps) {
  // State to track if an image is being processed
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  // References to hidden file input elements
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles camera button click - triggers the camera input
   */
  const handleCameraClick = (): void => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  /**
   * Handles gallery button click - triggers the gallery input
   */
  const handleGalleryClick = (): void => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  /**
   * Processes the selected/captured image file
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }
    
    setIsProcessingImage(true);
    
    // Convert file to base64 data URL for preview and processing
    const fileReader = new FileReader();
    
    fileReader.onload = (loadEvent) => {
      const imageDataUrl = loadEvent.target?.result as string;
      
      // Send the image data to parent component
      onImageCapture(imageDataUrl, selectedFile);
      setIsProcessingImage(false);
      
      // Reset input values to allow selecting the same file again
      resetFileInputs();
    };
    
    fileReader.readAsDataURL(selectedFile);
  };

  /**
   * Resets both file input values
   */
  const resetFileInputs = (): void => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
  };

  // Determine if buttons should be disabled
  const isButtonDisabled = isLoading || isProcessingImage;

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 3,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        textAlign: 'center',
      }}
    >
      {/* Header text */}
      <Typography 
        variant="body2" 
        color="text.secondary" 
        gutterBottom
        sx={{ marginBottom: 3 }}
      >
        Take a photo of where you want to go or choose from gallery
      </Typography>
      
      {/* Action buttons container */}
      <Stack 
        direction="row" 
        spacing={3} 
        justifyContent="center" 
        alignItems="center"
      >
        {/* Camera capture button */}
        <CameraButton
          onClick={handleCameraClick}
          disabled={isButtonDisabled}
          isProcessing={isProcessingImage}
        />

        {/* Gallery selection button */}
        <GalleryButton
          onClick={handleGalleryClick}
          disabled={isButtonDisabled}
        />
      </Stack>
      
      {/* Hidden file inputs */}
      <HiddenFileInputs
        cameraInputRef={cameraInputRef}
        galleryInputRef={galleryInputRef}
        onFileChange={handleFileChange}
      />
    </Paper>
  );
}

/**
 * Camera button component with icon and label
 */
interface CameraButtonProps {
  onClick: () => void;
  disabled: boolean;
  isProcessing: boolean;
}

function CameraButton({ onClick, disabled, isProcessing }: CameraButtonProps) {
  return (
    <Box textAlign="center">
      <Fab
        color="primary"
        size="large"
        onClick={onClick}
        disabled={disabled}
        sx={{
          width: 70,
          height: 70,
          '&:hover': {
            transform: 'scale(1.05)',
            transition: 'transform 0.2s ease-in-out',
          },
        }}
      >
        {isProcessing ? (
          <FlipCameraAndroid sx={{ fontSize: 28 }} />
        ) : (
          <CameraAlt sx={{ fontSize: 28 }} />
        )}
      </Fab>
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ display: 'block', marginTop: 1 }}
      >
        Camera
      </Typography>
    </Box>
  );
}

/**
 * Gallery button component with icon and label
 */
interface GalleryButtonProps {
  onClick: () => void;
  disabled: boolean;
}

function GalleryButton({ onClick, disabled }: GalleryButtonProps) {
  return (
    <Box textAlign="center">
      <Fab
        color="secondary"
        size="large"
        onClick={onClick}
        disabled={disabled}
        sx={{
          width: 70,
          height: 70,
          '&:hover': {
            transform: 'scale(1.05)',
            transition: 'transform 0.2s ease-in-out',
          },
        }}
      >
        <PhotoLibrary sx={{ fontSize: 28 }} />
      </Fab>
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ display: 'block', marginTop: 1 }}
      >
        Gallery
      </Typography>
    </Box>
  );
}

/**
 * Hidden file input elements for camera and gallery access
 */
interface HiddenFileInputsProps {
  cameraInputRef: React.RefObject<HTMLInputElement>;
  galleryInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function HiddenFileInputs({ 
  cameraInputRef, 
  galleryInputRef, 
  onFileChange 
}: HiddenFileInputsProps) {
  return (
    <>
      {/* Camera input - uses 'capture' attribute to access camera directly */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
        style={{ display: 'none' }}
        id="camera-input"
      />
      
      {/* Gallery input - allows selecting from device storage */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{ display: 'none' }}
        id="gallery-input"
      />
    </>
  );
}