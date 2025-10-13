import React from 'react'
import { Box } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from './theme'
import { useImageUpload } from './hooks/useImageUpload'
import {
  Header,
  WelcomeMessage,
  UploadArea,
  ImagePreview,
  AnalysisLoading,
  FlightResults,
  CameraDialog,
  Footer
} from './components/index'

const App: React.FC = () => {
  const {
    uploadedImage,
    isAnalyzing,
    flightResults,
    isCameraOpen,
    cameraError,
    fileInputRef,
    videoRef,
    handleFileUpload,
    handleOpenCamera,
    handleTakeSnapshot,
    handleCloseCamera,
    handleClearImage,
  } = useImageUpload()

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header />
        
        <Box 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            maxWidth: '900px',
            width: '100%',
            mx: 'auto',
            px: 3,
            py: 4,
          }}
        >
          {!uploadedImage && <WelcomeMessage />}

          {!uploadedImage ? (
            <UploadArea 
              onFileUpload={handleFileUpload}
              onOpenCamera={handleOpenCamera}
              fileInputRef={fileInputRef}
            />
          ) : (
            <Box>
              <ImagePreview 
                image={uploadedImage}
                onClear={handleClearImage}
              />

              {isAnalyzing && <AnalysisLoading />}

              {!isAnalyzing && flightResults.length > 0 && (
                <FlightResults flights={flightResults} />
              )}
            </Box>
          )}
        </Box>

        <Footer />

        <CameraDialog 
          open={isCameraOpen}
          onClose={handleCloseCamera}
          onCapture={handleTakeSnapshot}
          videoRef={videoRef}
          error={cameraError}
        />
      </Box>
    </ThemeProvider>
  )
}

export default App