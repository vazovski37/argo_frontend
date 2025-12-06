"use client";

import { useState, useEffect, useCallback } from "react";
import { Drawer } from "vaul";
import { X, Map, Navigation2, Maximize2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamic import to avoid SSR issues
const InteractiveMap = dynamic(
  () => import("@/components/features/map/InteractiveMap").then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-800 animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    ),
  }
);

// Controller interface for external access
interface MapDrawerController {
  open: (locationId: string) => void;
  close: () => void;
  isOpen: boolean;
}

// Global controller instance - allows opening drawer from anywhere
export const mapDrawerController: MapDrawerController = {
  open: () => {
    console.warn("[MapDrawer] Controller not initialized yet");
  },
  close: () => {
    console.warn("[MapDrawer] Controller not initialized yet");
  },
  isOpen: false,
};

interface MapDrawerProps {
  className?: string;
}

export function MapDrawer({ className }: MapDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedLocationId, setFocusedLocationId] = useState<string | null>(null);
  const [photoFilter, setPhotoFilter] = useState<"all" | "private" | "group" | "public">("all");

  // Open the drawer and focus on a specific location
  const handleOpen = useCallback((locationId: string) => {
    console.log("[MapDrawer] Opening drawer for location:", locationId);
    setFocusedLocationId(locationId);
    setIsOpen(true);
  }, []);

  // Close the drawer
  const handleClose = useCallback(() => {
    console.log("[MapDrawer] Closing drawer");
    setIsOpen(false);
    // Clear focused location after animation
    setTimeout(() => setFocusedLocationId(null), 300);
  }, []);

  // Register the controller methods on mount
  useEffect(() => {
    mapDrawerController.open = handleOpen;
    mapDrawerController.close = handleClose;
    
    // Keep isOpen in sync
    Object.defineProperty(mapDrawerController, "isOpen", {
      get: () => isOpen,
      configurable: true,
    });

    console.log("[MapDrawer] Controller initialized");

    return () => {
      // Reset controller on unmount
      mapDrawerController.open = () => console.warn("[MapDrawer] Controller not mounted");
      mapDrawerController.close = () => console.warn("[MapDrawer] Controller not mounted");
    };
  }, [handleOpen, handleClose, isOpen]);

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Drawer.Content
          className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl bg-slate-900 border-t border-white/10 outline-none ${className}`}
          style={{ height: "85vh", maxHeight: "85vh" }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1.5 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl">
                <Map className="w-5 h-5 text-white" />
              </div>
              <div>
                <Drawer.Title className="text-lg font-bold text-white">
                  Quest Map
                </Drawer.Title>
                <Drawer.Description className="text-xs text-slate-400">
                  {focusedLocationId ? "Showing location" : "Explore Poti"}
                </Drawer.Description>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Expand to full page */}
              <Link
                href={`/map${focusedLocationId ? `?focus=${focusedLocationId}` : ""}`}
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                title="Open full map"
              >
                <Maximize2 className="w-5 h-5 text-slate-400" />
              </Link>
              
              {/* Close button */}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                aria-label="Close map"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Photo Filter Controls */}
          <div className="px-4 py-2 border-b border-white/10 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Photos:</span>
              <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
                {(["all", "private", "group", "public"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPhotoFilter(filter)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      photoFilter === filter
                        ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg"
                        : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                    }`}
                    title={
                      filter === "all"
                        ? "All photos"
                        : filter === "private"
                          ? "My photos only"
                          : filter === "group"
                            ? "Group photos"
                            : "Public photos"
                    }
                  >
                    {filter === "all" && "🌍 All"}
                    {filter === "private" && "🔒 Mine"}
                    {filter === "group" && "👥 Groups"}
                    {filter === "public" && "🌐 Public"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map Content */}
          <div className="flex-1 overflow-hidden">
            {isOpen && (
              <div className="h-full w-full">
                <InteractiveMap focusedLocationId={focusedLocationId} photoFilter={photoFilter} />
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-3 border-t border-white/10 bg-slate-900/80">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Navigation2 className="w-3 h-3" />
              <span>Drag down to close • Tap markers for details</span>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default MapDrawer;

