"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Copy, Check, Loader2, Camera, MapPin } from "lucide-react";
import { useGroupDetail, useGroupMembers } from "@/hooks/useGroups";
import { usePhotoFeed } from "@/hooks/queries/usePhotos";
import Link from "next/link";
import Image from "next/image";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const { data: groupData, isLoading: groupLoading, error: groupError } = useGroupDetail(groupId);
  const { data: membersData, isLoading: membersLoading } = useGroupMembers(groupId);
  const { data: photosData, isLoading: photosLoading } = usePhotoFeed("group", groupId);

  const group = groupData?.group;
  const members = membersData?.members || [];
  const photos = photosData?.photos || [];

  const [copiedCode, setCopiedCode] = React.useState(false);

  const copyJoinCode = () => {
    if (group?.join_code) {
      navigator.clipboard.writeText(group.join_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (groupLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load group</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-medium rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-sky-950/90 to-slate-950/95" />
      
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/20 rounded-full mix-blend-screen blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-400/20 rounded-full mix-blend-screen blur-3xl" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-sky-400/40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{group.name}</h1>
            <p className="text-xs text-slate-400">Squad Details</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-6 pb-24">
        {/* Group Info Card */}
        <div className="backdrop-blur-xl bg-slate-950/70 border border-sky-400/40 rounded-2xl p-5 mb-6 shadow-lg shadow-sky-900/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-3">{group.name}</h2>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>{members.length} {members.length === 1 ? "member" : "members"}</span>
                </div>
                {group.owner && (
                  <div className="flex items-center gap-1.5">
                    <span>Owner: <span className="text-sky-300">{group.owner.name}</span></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Join Code */}
          <div className="pt-4 border-t border-sky-400/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Join Code
              </span>
              <button
                onClick={copyJoinCode}
                className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-lg border border-sky-400/30 hover:bg-slate-800/80 transition-colors"
              >
                <span className="text-lg font-mono font-bold text-sky-400 tracking-[0.2em]">
                  {group.join_code}
                </span>
                {copiedCode ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            Members
          </h3>
          {membersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="backdrop-blur-xl bg-slate-950/70 border border-sky-400/30 rounded-2xl p-6 text-center">
              <p className="text-slate-400">No members yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="backdrop-blur-xl bg-slate-950/70 border border-sky-400/40 rounded-xl p-4 flex items-center gap-3"
                >
                  {member.user?.avatar_url ? (
                    <Image
                      src={member.user.avatar_url}
                      alt={member.user.name || "User"}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border-2 border-sky-400/40"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg border-2 border-sky-400/40">
                      {member.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {member.user?.name || "Unknown User"}
                    </p>
                    {member.user?.email && (
                      <p className="text-xs text-slate-400 truncate">{member.user.email}</p>
                    )}
                  </div>
                  {group.owner_id === member.user_id && (
                    <span className="px-2 py-1 bg-sky-500/20 text-sky-400 text-xs font-medium rounded-full border border-sky-400/30">
                      Owner
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Photos Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-sky-400" />
              Squad Memories
            </h3>
            {photos.length > 0 && (
              <span className="text-sm text-slate-400">{photos.length} photos</span>
            )}
          </div>
          {photosLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
            </div>
          ) : photos.length === 0 ? (
            <div className="backdrop-blur-xl bg-slate-950/70 border border-sky-400/30 rounded-2xl p-8 text-center">
              <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-1">No photos yet</p>
              <p className="text-xs text-slate-500">Share your first memory with the squad!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/photos/${photo.id}`}
                  className="group relative aspect-square rounded-xl overflow-hidden backdrop-blur-xl bg-slate-950/70 border border-sky-400/30"
                >
                  <Image
                    src={photo.url || photo.gcs_url || ""}
                    alt={photo.caption || "Photo"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  {photo.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="absolute bottom-2 left-2 right-2 text-white text-xs line-clamp-2">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                  {photo.location && (
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5">
                      <MapPin className="w-3 h-3 text-white" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

