"use client";

import { useState, useRef, useCallback } from "react";

interface PhotoCaptureProps {
  onCapture: (file: File, type: 'selfie' | 'place' | 'food' | 'achievement') => Promise<void>;
  videoStream?: MediaStream | null;
  isCapturing?: boolean;
  className?: string;
}

export function PhotoCapture({ onCapture, videoStream, isCapturing = false, className = "" }: PhotoCaptureProps) {
  const [photoType, setPhotoType] = useState<'selfie' | 'place' | 'food' | 'achievement'>('place');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Capture from video stream
  const captureFromVideo = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !videoStream) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw mirrored for selfie
    if (photoType === 'selfie') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0);
    
    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const file = new File([blob], `${photoType}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setPreviewUrl(URL.createObjectURL(blob));
      setShowOptions(true);
      
      // Store file for later use
      (window as any).__capturedFile = file;
    }, 'image/jpeg', 0.9);
  }, [videoStream, photoType]);

  // Handle file upload
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setShowOptions(true);
    (window as any).__capturedFile = file;
  }, []);

  // Confirm and upload
  const confirmPhoto = useCallback(async () => {
    const file = (window as any).__capturedFile;
    if (!file) return;

    setIsProcessing(true);
    try {
      await onCapture(file, photoType);
      setPreviewUrl(null);
      setShowOptions(false);
      (window as any).__capturedFile = null;
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [onCapture, photoType]);

  // Cancel photo
  const cancelPhoto = useCallback(() => {
    setPreviewUrl(null);
    setShowOptions(false);
    (window as any).__capturedFile = null;
  }, []);

  // Attach video stream
  if (videoRef.current && videoStream && videoRef.current.srcObject !== videoStream) {
    videoRef.current.srcObject = videoStream;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input 
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview overlay */}
      {previewUrl && showOptions && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative max-w-lg w-full">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full rounded-2xl shadow-2xl"
            />
            
            {/* Photo type selector */}
            <div className="mt-4 flex justify-center gap-2">
              {(['selfie', 'place', 'food', 'achievement'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setPhotoType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    photoType === type
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {type === 'selfie' && '🤳 Selfie'}
                  {type === 'place' && '🏛️ Place'}
                  {type === 'food' && '🍽️ Food'}
                  {type === 'achievement' && '🏆 Achievement'}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={cancelPhoto}
                disabled={isProcessing}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all disabled:opacity-50"
              >
                Retake
              </button>
              <button
                onClick={confirmPhoto}
                disabled={isProcessing}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <span>📸</span>
                    Save Photo (+{photoType === 'achievement' ? 15 : 10} XP)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capture buttons */}
      <div className="flex items-center gap-2">
        {/* Camera capture button (if video stream available) */}
        {videoStream && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="hidden"
            />
            <button
              onClick={captureFromVideo}
              disabled={isCapturing || isProcessing}
              className="p-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all disabled:opacity-50"
              title="Take Photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </>
        )}

        {/* Upload from gallery */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="p-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all disabled:opacity-50"
          title="Upload Photo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default PhotoCapture;






