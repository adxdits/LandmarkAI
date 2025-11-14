import { useState, useRef } from 'react'
import camera from '../utils/camera'
import type { UploadedImage, FlightResult } from '../types'
import { searchFlights } from '../services/flightApi'

// Backend API URL - Using Vite proxy
const API_URL = '/api/image'
export const useImageUpload = () => {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [flightResults, setFlightResults] = useState<FlightResult[]>([])
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [originAirport, setOriginAirport] = useState<string>('CDG')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true)
    setFlightResults([])
    setCameraError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/recognize`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
    
      // After monument recognition, search for real flights
      if (data.monument && data.city) {
        try {
          // Search flights to the monument's city
          const flights = await searchFlights(data.city, originAirport)
          
          // Add monument context to each flight
          const flightsWithContext = flights.map(flight => ({
            ...flight,
            monument: data.monument,
            city: data.city,
            country: data.country
          }))
          
          setFlightResults(flightsWithContext)
        } catch (flightError) {
          console.error('Error fetching flights:', flightError)
          // Show monument info even if flights fail
          setCameraError('Flights unavailable, but monument recognized')
        }
      } else {
        // Monument not recognized
        setFlightResults([])
        setCameraError('Monument non reconnu. Essayez avec une autre image.')
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error)
      setCameraError('Erreur de connexion au serveur. Vérifiez que le backend est démarré.')
      setFlightResults([])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setUploadedImage({ url, file })
      analyzeImage(file)
    }
  }

  const handleOpenCamera = async () => {
    setCameraError(null)
    setIsCameraOpen(true)
    try {
      await camera.startCamera(680, 480)
      if (videoRef.current && camera.video) {
        videoRef.current.srcObject = camera.video.srcObject
        videoRef.current.play()
      }
    } catch (error) {
      console.error('Error opening camera:', error)
      setCameraError('Unable to access camera. Please check permissions.')
      setIsCameraOpen(false)
    }
  }

  const handleTakeSnapshot = () => {
    const snapshot = camera.takeSnapshot()
    if (snapshot) {
      fetch(snapshot)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'camera-snapshot.png', { type: 'image/png' })
          const url = snapshot
          setUploadedImage({ url, file })
          handleCloseCamera()
          analyzeImage(file)
        })
    }
  }

  const handleCloseCamera = () => {
    camera.stopCamera()
    setIsCameraOpen(false)
    setCameraError(null)
  }

  const handleClearImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.url)
    }
    setUploadedImage(null)
    setFlightResults([])
    setIsAnalyzing(false)
  }

  return {
    uploadedImage,
    isAnalyzing,
    flightResults,
    isCameraOpen,
    cameraError,
    originAirport,
    setOriginAirport,
    fileInputRef,
    videoRef,
    handleFileUpload,
    handleOpenCamera,
    handleTakeSnapshot,
    handleCloseCamera,
    handleClearImage,
  }
}