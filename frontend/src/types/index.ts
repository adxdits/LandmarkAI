export interface UploadedImage {
  url: string
  file: File
}

// Updated to match real flight API data
export interface FlightResult {
  id: string
  airline: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  currency: string
  bookingUrl: string
  stops: number
  departureAirport: string
  arrivalAirport: string
  cabinClass: string
  // Monument info for context
  monument?: string
  city?: string
  country?: string
}

export interface CameraDialogProps {
  open: boolean
  onClose: () => void
  onCapture: () => void
  videoRef: React.RefObject<HTMLVideoElement | null>
  error: string | null
}

export interface UploadAreaProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onOpenCamera: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

export interface ImagePreviewProps {
  image: UploadedImage
  onClear: () => void
}

export interface FlightResultsProps {
  flights: FlightResult[]
}