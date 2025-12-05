"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useUploadPhoto, type UploadPhotoInput } from "@/hooks/mutations/usePhotoMutations";
import { useMyGroups } from "@/hooks/useGroups";
import { Copy, Check, Loader2 } from "lucide-react";

interface PhotoCaptureProps {
  videoStream?: MediaStream | null;
  isCapturing?: boolean;
  className?: string;
  onUploadComplete?: () => void;
}

type VisibilityType = "private" | "group" | "public";

export function PhotoCapture({ 
  videoStream, 
  isCapturing = false, 
  className = "",
  onUploadComplete 
}: PhotoCaptureProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<VisibilityType>("private");
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const capturedFileRef = useRef<File | null>(null);
  
  const uploadMutation = useUploadPhoto();
  const { data: groupsData } = useMyGroups();
  const groups = groupsData?.groups || [];

  // Get location when preview is shown
  useEffect(() => {
    if (showPreview && !location) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setLocationError(null);
          },
          (error) => {
            console.error("Geolocation error:", error);
            setLocationError("Could not get location. Please enable location services.");
          },
          { timeout: 10000, maximumAge: 60000 }
        );
      } else {
        setLocationError("Geolocation is not supported by your browser.");
      }
    }
  }, [showPreview, location]);

  // Capture from video stream
  const captureFromVideo = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !videoStream) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Ensure video is playing
    try {
      if (video.paused) {
        await video.play();
      }
    } catch (error) {
      console.error("Error playing video:", error);
    }
    
    // Wait for video to have valid dimensions and be ready
    let attempts = 0;
    while ((video.videoWidth === 0 || video.videoHeight === 0) && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    // Check if video has valid dimensions
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    if (videoWidth === 0 || videoHeight === 0) {
      console.error("Video dimensions are invalid:", videoWidth, videoHeight, "readyState:", video.readyState);
      alert("Camera not ready. Please wait a moment and try again.");
      return;
    }
    
    // Set canvas dimensions to match video
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) {
      console.error("Failed to get canvas context");
      return;
    }
    
    // Draw video frame to canvas
    try {
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    } catch (error) {
      console.error("Error drawing video to canvas:", error);
      alert("Failed to capture photo. Please try again.");
      return;
    }

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("Failed to create blob from canvas");
        alert("Failed to process photo. Please try again.");
        return;
      }
      
      // Verify blob has content (not empty/black)
      if (blob.size < 1000) {
        console.warn("Blob size is very small, might be black image:", blob.size);
      }
      
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
      capturedFileRef.current = file;
      setPreviewUrl(URL.createObjectURL(blob));
      setShowPreview(true);
    }, "image/jpeg", 0.95);
  }, [videoStream]);

  // Handle file upload
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    capturedFileRef.current = file;
    setPreviewUrl(URL.createObjectURL(file));
    setShowPreview(true);
  }, []);

  // Upload photo with selected visibility
  const handleUpload = useCallback(async (vis: VisibilityType, groupId?: string) => {
    const file = capturedFileRef.current;
    if (!file) return;

    if (!location) {
      setLocationError("Please wait for location to be determined.");
      return;
    }

    const uploadData: UploadPhotoInput = {
      file,
      latitude: location.lat,
      longitude: location.lng,
      visibility: vis,
      groupId: vis === "group" ? groupId : undefined,
      caption: caption.trim() || undefined,
      isSelfie: false, // Can be enhanced later
    };

    try {
      await uploadMutation.mutateAsync(uploadData);
      
      // Reset state
      setPreviewUrl(null);
      setShowPreview(false);
      setCaption("");
      setVisibility("private");
      setSelectedGroupId(undefined);
      capturedFileRef.current = null;
      setLocation(null);
      setLocationError(null);
      
      onUploadComplete?.();
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  }, [location, caption, uploadMutation, onUploadComplete]);

  // Cancel photo
  const cancelPhoto = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setShowPreview(false);
    setCaption("");
    setVisibility("private");
    setSelectedGroupId(undefined);
    capturedFileRef.current = null;
    setLocation(null);
    setLocationError(null);
  }, [previewUrl]);

  // Copy join code
  const copyJoinCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  // Attach video stream and ensure it's playing
  useEffect(() => {
    if (videoRef.current && videoStream) {
      if (videoRef.current.srcObject !== videoStream) {
        videoRef.current.srcObject = videoStream;
      }
      
      // Ensure video is playing
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
  }, [videoStream]);

  const isLoading = uploadMutation.isPending;
  const hasMultipleGroups = groups.length > 1;
  const canUploadGroup = visibility === "group" && (hasMultipleGroups ? selectedGroupId : groups[0]?.id);

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

      {/* Preview & Share Screen */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Preview Image */}
            <div className="relative mb-4">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full rounded-2xl shadow-2xl"
            />
              {locationError && (
                <div className="absolute top-2 left-2 right-2 bg-red-500/90 text-white text-xs p-2 rounded-lg">
                  {locationError}
                </div>
              )}
              {!location && !locationError && (
                <div className="absolute top-2 left-2 right-2 bg-blue-500/90 text-white text-xs p-2 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Getting location...
                </div>
              )}
            </div>

            {/* Caption Input */}
            <div className="mb-4">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption (optional)..."
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            </div>

            {/* Visibility Action Buttons */}
            <div className="space-y-3">
              {/* Private Button */}
              <button
                onClick={() => handleUpload("private")}
                disabled={isLoading || !location}
                className={`w-full px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  visibility === "private"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading && visibility === "private" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🔒</span>
                    Private
                  </>
                )}
              </button>

              {/* Group Button */}
              {groups.length > 0 && (
                <div className="space-y-2">
                  {hasMultipleGroups && visibility === "group" && (
                    <select
                      value={selectedGroupId || ""}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select a group...</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id} className="bg-gray-800">
                          {group.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => handleUpload("group", selectedGroupId || groups[0]?.id)}
                    disabled={isLoading || !location || !canUploadGroup}
                    className={`w-full px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      visibility === "group"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading && visibility === "group" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <span className="text-xl">👥</span>
                        Group {hasMultipleGroups ? `(${groups.find(g => g.id === (selectedGroupId || groups[0]?.id))?.name})` : ""}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Public Button */}
              <button
                onClick={() => handleUpload("public")}
                disabled={isLoading || !location}
                className={`w-full px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  visibility === "public"
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading && visibility === "public" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🌍</span>
                    Public
                  </>
                )}
              </button>
            </div>

            {/* Cancel Button */}
            <button
              onClick={cancelPhoto}
              disabled={isLoading}
              className="mt-4 w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
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
              disabled={isCapturing || isLoading}
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
          disabled={isLoading}
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
