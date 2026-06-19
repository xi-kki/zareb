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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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

  if (error) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-danger-50/50 p-6 text-center">
        <Camera className="w-10 h-10 text-danger mx-auto mb-3" />
        <p className="text-sm font-medium text-danger mb-2">Camera unavailable</p>
        <p className="text-xs text-stone-500 mb-4">{error}</p>
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
      <div className="rounded-2xl overflow-hidden border border-stone-200 bg-black relative shadow-card">
        <canvas ref={canvasRef} className="hidden" />

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto max-h-[400px] object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex justify-center gap-4">
          <button
            onClick={capturePhoto}
            disabled={disabled}
            className="w-16 h-16 rounded-full bg-white border-4 border-white/50 flex items-center justify-center hover:bg-stone-100 transition-colors shadow-lg"
            title="Capture photo"
          >
            <div className="w-10 h-10 rounded-full border-2 border-stone-800" />
          </button>
          <button
            onClick={stopCamera}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            title="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <ScanLine className="w-24 h-24 text-white/30" />
        </div>

        <p className="absolute top-3 left-3 bg-black/40 text-white text-xs px-2 py-1 rounded-pill backdrop-blur-sm">
          Point at product label
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-brand/20 rounded-2xl bg-brand-50/30 p-6 text-center transition-all hover:border-brand/40 hover:bg-brand-50/50 group">
      <button
        onClick={startCamera}
        disabled={disabled || loading}
        className="w-full flex flex-col items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-10 h-10 text-brand animate-spin" />
            <span className="text-sm font-medium text-brand">Accessing camera...</span>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200">
              <Camera className="w-8 h-8 text-brand" />
            </div>
            <span className="font-display font-semibold text-stone-900 text-lg">
              Scan your product label now
            </span>
            <span className="text-sm text-stone-500 max-w-xs">
              Point your camera at any food label — Zareb reads the ingredients
            </span>
          </>
        )}
      </button>
    </div>
  );
}
