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
  const [originAirport, setOriginAirport] = useState<string>('')
  const [departureDate, setDepartureDate] = useState<string>(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().split('T')[0]
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const analyzeImage = async (file: File) => {
    console.log('analyzeImage called')
    setIsAnalyzing(true)
    setFlightResults([])
    setCameraError(null)
    
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_URL}/recognize`, {
      method: 'POST',
      body: formData,
    }).catch(() => null)

    console.log('Backend response:', response)

    if (response?.ok) {
      const data = await response.json().catch(() => null)
      console.log('Backend data:', data)
      
      if (data?.monument && data?.city) {
        console.log('Searching flights for:', data.city, originAirport, departureDate)
        const flights = await searchFlights(data.city, originAirport, departureDate).catch(() => [])
        console.log('Flights found:', flights)
        
        const flightsWithContext = flights.map(flight => ({
          ...flight,
          monument: data.monument,
          city: data.city,
          country: data.country
        }))
        
        setFlightResults(flightsWithContext)
      }
    }
    
    setIsAnalyzing(false)
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
    
    const started = await camera.startCamera(680, 480).catch(() => false)
    
    if (started && videoRef.current && camera.video) {
      videoRef.current.srcObject = camera.video.srcObject
      videoRef.current.play().catch(() => {})
    } else {
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
    departureDate,
    setDepartureDate,
    fileInputRef,
    videoRef,
    handleFileUpload,
    handleOpenCamera,
    handleTakeSnapshot,
    handleCloseCamera,
    handleClearImage,
  }
}