"use client";

import { usePhotoFeed } from "@/hooks/queries/usePhotos";
import { Loader2, MapPin, Lock, Users, Globe } from "lucide-react";
import type { Photo } from "@/lib/schemas/photos";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
}

function getVisibilityIcon(visibility: string) {
  switch (visibility) {
    case "private":
      return <Lock className="w-3 h-3" />;
    case "group":
      return <Users className="w-3 h-3" />;
    case "public":
      return <Globe className="w-3 h-3" />;
    default:
      return <Lock className="w-3 h-3" />;
  }
}

function getVisibilityLabel(visibility: string) {
  switch (visibility) {
    case "private":
      return "Private";
    case "group":
      return "Group";
    case "public":
      return "Public";
    default:
      return "Private";
  }
}

function getVisibilityBadgeColor(visibility: string) {
  switch (visibility) {
    case "private":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "group":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "public":
      return "bg-white/20 text-white border-white/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
}

interface PhotoCardProps {
  photo: Photo;
}

function PhotoCard({ photo }: PhotoCardProps) {
  const user = photo.user;
  const location = photo.location;
  const photoUrl = photo.url || photo.gcs_url || "";

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        {/* User Avatar */}
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name || "User"}
            className="w-10 h-10 rounded-full border-2 border-white/20"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-2 border-white/20">
            <span className="text-white font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
        )}

        {/* User Name & Timestamp */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">
            {user?.name || "Unknown User"}
          </p>
          <p className="text-xs text-slate-300">
            {photo.uploaded_at ? formatRelativeTime(photo.uploaded_at) : "Recently"}
          </p>
        </div>

        {/* Visibility Badge */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getVisibilityBadgeColor(
            photo.visibility || "private"
          )}`}
        >
          {getVisibilityIcon(photo.visibility || "private")}
          <span className="hidden sm:inline">
            {getVisibilityLabel(photo.visibility || "private")}
          </span>
        </div>
      </div>

      {/* Photo */}
      <div className="relative aspect-square bg-slate-800">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={photo.caption || "Memory"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
            <span className="text-4xl">📸</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 space-y-2">
        {/* Caption */}
        {photo.caption && (
          <p className="text-sm text-white line-clamp-2">{photo.caption}</p>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Near {location.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PhotoFeed() {
  const { data: photosData, isLoading, error } = usePhotoFeed("all");
  const photos = photosData?.photos || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
        <p className="text-red-200">Failed to load photos. Please try again.</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Memories Yet</h3>
        <p className="text-slate-300">Go explore and capture your adventures!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}

export default PhotoFeed;

