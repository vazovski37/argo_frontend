"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useLocations } from "@/hooks/queries/useLocations";
import { useVisitLocation } from "@/hooks/mutations/useVisitLocation";
import { MapPin, Navigation, CheckCircle, Loader2, AlertCircle, Route } from "lucide-react";
import type { Location } from "@/lib/schemas/locations";

// Poti, Georgia coordinates
const POTI_CENTER = { lat: 42.15, lng: 41.67 };

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Category colors for markers
const CATEGORY_COLORS: Record<string, { background: string; glyph: string; border: string }> = {
  landmark: { background: "#F59E0B", glyph: "#FFFFFF", border: "#D97706" },
  restaurant: { background: "#EF4444", glyph: "#FFFFFF", border: "#DC2626" },
  museum: { background: "#8B5CF6", glyph: "#FFFFFF", border: "#7C3AED" },
  nature: { background: "#10B981", glyph: "#FFFFFF", border: "#059669" },
  beach: { background: "#06B6D4", glyph: "#FFFFFF", border: "#0891B2" },
  default: { background: "#F59E0B", glyph: "#FFFFFF", border: "#D97706" },
};

interface UserPosition {
  lat: number;
  lng: number;
  accuracy?: number;
}

// Directions Renderer Component
function DirectionsRenderer({
  directions,
  onClear,
}: {
  directions: google.maps.DirectionsResult | null;
  onClear: () => void;
}) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!map || !routesLibrary) return;

    // Initialize renderer if not exists
    if (!rendererRef.current) {
      rendererRef.current = new routesLibrary.DirectionsRenderer({
        suppressMarkers: true, // We already have our own markers
        polylineOptions: {
          strokeColor: "#6366F1",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });
    }

    const renderer = rendererRef.current;
    renderer.setMap(map);

    if (directions) {
      renderer.setDirections(directions);
    }

    return () => {
      renderer.setMap(null);
    };
  }, [map, routesLibrary, directions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.setMap(null);
        rendererRef.current = null;
      }
    };
  }, []);

  if (!directions) return null;

  // Show route info
  const leg = directions.routes[0]?.legs[0];
  if (!leg) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-slate-200 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Route className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{leg.distance?.text}</p>
            <p className="text-sm text-slate-500">{leg.duration?.text} by car</p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Clear Route
        </button>
      </div>
    </div>
  );
}

// Map Content Component (needs to be inside APIProvider)
function MapContent() {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  
  const [userPos, setUserPos] = useState<UserPosition | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [checkedInLocations, setCheckedInLocations] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  // Fetch locations
  const { data: locationsData, isLoading: locationsLoading, error: locationsError } = useLocations();
  
  // Visit location mutation
  const visitMutation = useVisitLocation();

  // Watch user position
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserPos({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Clear directions when closing info window
  const handleCloseInfoWindow = useCallback(() => {
    setSelectedLocation(null);
    setDirectionsResponse(null);
  }, []);

  // Handle check-in
  const handleCheckIn = useCallback(async (location: Location) => {
    if (!userPos) {
      setToast({ message: "Unable to get your location", type: "error" });
      return;
    }

    if (!location.latitude || !location.longitude) {
      setToast({ message: "Location coordinates unavailable", type: "error" });
      return;
    }

    const distance = calculateDistance(
      userPos.lat,
      userPos.lng,
      location.latitude,
      location.longitude
    );

    if (distance > 100) {
      setToast({
        message: `Too far away! You're ${Math.round(distance)}m from ${location.name}. Get within 100m to check in.`,
        type: "error",
      });
      return;
    }

    try {
      const result = await visitMutation.mutateAsync({ locationId: location.id });
      
      if (result.success) {
        setCheckedInLocations((prev) => new Set([...prev, location.id]));
        setToast({
          message: `${result.message || "Checked in!"} +${result.xp_earned || location.xp_reward}XP`,
          type: "success",
        });
        handleCloseInfoWindow();
      } else {
        setToast({ message: result.message || "Already visited", type: "error" });
      }
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Check-in failed",
        type: "error",
      });
    }
  }, [userPos, visitMutation, handleCloseInfoWindow]);

  // Handle get directions
  const handleGetDirections = useCallback(async () => {
    if (!userPos || !selectedLocation || !routesLibrary || !selectedLocation.latitude || !selectedLocation.longitude) {
      setToast({ message: "Unable to calculate directions", type: "error" });
      return;
    }

    setIsRouting(true);

    try {
      const directionsService = new routesLibrary.DirectionsService();
      
      const result = await directionsService.route({
        origin: { lat: userPos.lat, lng: userPos.lng },
        destination: { lat: selectedLocation.latitude, lng: selectedLocation.longitude },
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirectionsResponse(result);
      setSelectedLocation(null); // Close info window to show route
    } catch (error) {
      console.error("Directions error:", error);
      setToast({ message: "Could not calculate route", type: "error" });
    } finally {
      setIsRouting(false);
    }
  }, [userPos, selectedLocation, routesLibrary]);

  // Get marker color based on category
  const getMarkerColors = (category: string) => {
    return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.default;
  };

  // Calculate distance to selected location
  const getDistanceToSelected = useCallback(() => {
    if (!userPos || !selectedLocation?.latitude || !selectedLocation?.longitude) return null;
    return calculateDistance(
      userPos.lat,
      userPos.lng,
      selectedLocation.latitude,
      selectedLocation.longitude
    );
  }, [userPos, selectedLocation]);

  const locations = locationsData?.locations || [];

  return (
    <>
      <Map
        defaultCenter={POTI_CENTER}
        defaultZoom={13}
        mapId="DEMO_MAP_ID"
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="w-full h-full"
      >
        {/* Quest Location Markers */}
        {locations.map((location) => {
          if (!location.latitude || !location.longitude) return null;
          
          const colors = getMarkerColors(location.category);
          const isCheckedIn = checkedInLocations.has(location.id);

          return (
            <AdvancedMarker
              key={location.id}
              position={{ lat: location.latitude, lng: location.longitude }}
              onClick={() => {
                setSelectedLocation(location);
                setDirectionsResponse(null); // Clear existing route
              }}
              title={location.name}
            >
              <Pin
                background={isCheckedIn ? "#10B981" : colors.background}
                glyphColor={colors.glyph}
                borderColor={isCheckedIn ? "#059669" : colors.border}
                scale={1.2}
              />
            </AdvancedMarker>
          );
        })}

        {/* User Location Marker (Blue Pulsing Dot) */}
        {userPos && (
          <AdvancedMarker position={{ lat: userPos.lat, lng: userPos.lng }}>
            <div className="relative">
              {/* Pulse ring */}
              <div className="absolute -inset-3 bg-blue-500/30 rounded-full animate-ping" />
              {/* Accuracy circle */}
              <div className="absolute -inset-2 bg-blue-500/20 rounded-full" />
              {/* Center dot */}
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
            </div>
          </AdvancedMarker>
        )}

        {/* Info Window for Selected Location */}
        {selectedLocation && selectedLocation.latitude && selectedLocation.longitude && (
          <InfoWindow
            position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
            onCloseClick={handleCloseInfoWindow}
            pixelOffset={[0, -40]}
          >
            <div className="min-w-[280px] max-w-[320px] p-1">
              {/* Header */}
              <div className="flex items-start gap-2 mb-2">
                <div
                  className="p-1.5 rounded-lg"
                  style={{
                    backgroundColor: getMarkerColors(selectedLocation.category).background + "20",
                  }}
                >
                  <MapPin
                    className="w-4 h-4"
                    style={{ color: getMarkerColors(selectedLocation.category).background }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {selectedLocation.name}
                  </h3>
                  <span className="text-xs text-slate-500 capitalize">
                    {selectedLocation.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-full">
                  <span className="text-amber-700 font-bold text-sm">
                    +{selectedLocation.xp_reward} XP
                  </span>
                </div>
              </div>

              {/* Description */}
              {selectedLocation.description && (
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {selectedLocation.description}
                </p>
              )}

              {/* Distance indicator */}
              {userPos && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                  <Navigation className="w-3 h-3" />
                  <span>
                    {(() => {
                      const dist = getDistanceToSelected();
                      if (dist === null) return "Distance unknown";
                      if (dist < 1000) return `${Math.round(dist)}m away`;
                      return `${(dist / 1000).toFixed(1)}km away`;
                    })()}
                  </span>
                  {getDistanceToSelected() !== null && getDistanceToSelected()! <= 100 && (
                    <span className="text-green-600 font-medium">• In range!</span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {/* Get Directions Button */}
                <button
                  onClick={handleGetDirections}
                  disabled={!userPos || isRouting}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRouting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Routing...</span>
                    </>
                  ) : (
                    <>
                      <Route className="w-4 h-4" />
                      <span>Directions</span>
                    </>
                  )}
                </button>

                {/* Check In Button */}
                {checkedInLocations.has(selectedLocation.id) ? (
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Checked In!</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckIn(selectedLocation)}
                    disabled={visitMutation.isPending || !userPos}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {visitMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Checking in...</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        <span>Check In</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Directions Renderer */}
      <DirectionsRenderer 
        directions={directionsResponse} 
        onClear={() => setDirectionsResponse(null)} 
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm ${
            toast.type === "success"
              ? "bg-green-500/95 text-white"
              : "bg-red-500/95 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Loading State */}
      {locationsLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20">
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-lg">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="font-medium text-slate-700">Loading quest locations...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {locationsError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-3 bg-red-500/95 text-white rounded-xl shadow-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Failed to load locations</span>
        </div>
      )}

      {/* User Location Status */}
      {!userPos && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-md text-sm text-slate-600">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span>Getting your location...</span>
        </div>
      )}
    </>
  );
}

// Main Component
export function InteractiveMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center bg-slate-100 rounded-xl">
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Map Configuration Error</h3>
          <p className="text-slate-600">
            Google Maps API key not found. Please set{" "}
            <code className="bg-slate-200 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in
            your environment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[80vh] w-full rounded-xl overflow-hidden shadow-xl border border-slate-200 relative">
      <APIProvider apiKey={apiKey}>
        <MapContent />
      </APIProvider>
    </div>
  );
}

export default InteractiveMap;

