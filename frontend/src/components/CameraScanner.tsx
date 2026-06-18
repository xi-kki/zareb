import { useState, useRef, useCallback } from "react";
import { Camera, Loader2, X, RefreshCw, ScanLine } from "lucide-react";

interface CameraScannerProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

export default function CameraScanner({ onCapture, disabled }: CameraScannerProps) {
  const [streaming, setStreaming] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      // Request camera with preferred environment (back) camera for labels
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreaming(true);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera access in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Could not access camera. Check permissions or use file upload.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `label-scan-${Date.now()}.jpg`, { type: "image/jpeg" });
        setCaptured(URL.createObjectURL(blob));
        onCapture(file);
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  }, [onCapture]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStreaming(false);
  }, []);

  const resetScanner = useCallback(() => {
    setCaptured(null);
    setError(null);
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    stopCamera();
  }, [stopCamera]);

  if (error) {
    return (
      <div className="rounded-xl border border-[#d6d6d6] bg-[#FEF2F2] p-6 text-center">
        <Camera className="w-10 h-10 text-[#DC2626] mx-auto mb-3" />
        <p className="text-sm font-medium text-[#B91C1C] mb-2">Camera unavailable</p>
        <p className="text-xs text-[#6B7280] mb-4">{error}</p>
        <div className="flex gap-2 justify-center">
          <button onClick={resetScanner} className="btn-secondary text-sm !py-2 !px-4">
            <RefreshCw className="w-4 h-4 mr-1 inline" /> Try again
          </button>
        </div>
      </div>
    );
  }

  if (streaming) {
    return (
      <div className="rounded-xl overflow-hidden border border-[#d6d6d6] bg-black relative">
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Video preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto max-h-[400px] object-cover"
        />

        {/* Controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex justify-center gap-4">
          <button
            onClick={capturePhoto}
            disabled={disabled}
            className="w-16 h-16 rounded-full bg-white border-4 border-white/50 flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Capture photo"
          >
            <div className="w-10 h-10 rounded-full border-2 border-[#1d1d1f]" />
          </button>
          <button
            onClick={stopCamera}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            title="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan frame guide */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <ScanLine className="w-24 h-24 text-white/30" />
        </div>

        <p className="absolute top-3 left-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
          Point at product label
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-[#0071E3]/30 rounded-xl bg-[#E8F4FD]/30 p-6 text-center transition-all hover:border-[#0071E3]/60 hover:bg-[#E8F4FD]/50">
      <button
        onClick={startCamera}
        disabled={disabled || loading}
        className="w-full flex flex-col items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-10 h-10 text-[#0071E3] animate-spin" />
            <span className="text-sm font-medium text-[#0071E3]">Accessing camera...</span>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-[#0071E3]/10 rounded-full flex items-center justify-center mb-1">
              <Camera className="w-8 h-8 text-[#0071E3]" />
            </div>
            <span className="text-lg font-semibold text-[#1d1d1f]">
              Scan your product label now
            </span>
            <span className="text-sm text-[#6B7280]">
              Point your camera at any food label — Zareb reads the ingredients
            </span>
          </>
        )}
      </button>
    </div>
  );
}
