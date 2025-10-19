import { useState, useRef } from 'react'
import camera from '../utils/camera'
import type { UploadedImage, FlightResult } from '../types'

export const useImageUpload = () => {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [flightResults, setFlightResults] = useState<FlightResult[]>([])
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const simulateAnalysis = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setFlightResults([
        { id: 1, destination: 'Paris, France', price: '$450', duration: '8h 30m' },
        { id: 2, destination: 'Rome, Italy', price: '$380', duration: '9h 15m' },
        { id: 3, destination: 'Barcelona, Spain', price: '$320', duration: '7h 45m' },
      ])
    }, 2000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setUploadedImage({ url, file })
      simulateAnalysis()
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
          simulateAnalysis()
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
    fileInputRef,
    videoRef,
    handleFileUpload,
    handleOpenCamera,
    handleTakeSnapshot,
    handleCloseCamera,
    handleClearImage,
  }
}