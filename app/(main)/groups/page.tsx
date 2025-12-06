"use client";

import { useState } from "react";
import { useMyGroups, useCreateGroup, useJoinGroup, type Group } from "@/hooks/useGroups";
import { Users, Plus, Hash, Copy, Check, Loader2, X } from "lucide-react";
import PhotoFeed from "@/components/features/photo/PhotoFeed";

export default function GroupsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: groupsData, isLoading, error } = useMyGroups();
  const createMutation = useCreateGroup();
  const joinMutation = useJoinGroup();

  const groups = groupsData?.groups || [];

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    try {
      await createMutation.mutateAsync({ name: groupName.trim() });
      setGroupName("");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim() || joinCode.length !== 6) return;

    try {
      await joinMutation.mutateAsync({ join_code: joinCode.trim().toUpperCase() });
      setJoinCode("");
      setShowJoinModal(false);
    } catch (error) {
      console.error("Failed to join group:", error);
    }
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">
            My Squads
          </h1>
          <p className="text-slate-400 text-sm">
            Manage your travel groups
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Create Group Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/20 text-white group"
          >
            <div className="p-3 bg-white/20 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8" />
            </div>
            <span className="font-bold text-lg">Create</span>
            <span className="text-xs text-white/80">New Squad</span>
          </button>

          {/* Join Group Card */}
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex flex-col items-center justify-center p-6 bg-slate-800 border border-white/10 rounded-xl shadow-md hover:bg-slate-750 transition-colors group"
          >
            <div className="p-3 bg-slate-700 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <Hash className="w-8 h-8 text-amber-400" />
            </div>
            <span className="font-bold text-lg text-white">Join</span>
            <span className="text-xs text-slate-400">Enter Code</span>
          </button>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-400">Failed to load groups.</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-slate-800/50 border border-white/5 rounded-xl p-8 text-center mb-8">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">No Squads Yet</h3>
            <p className="text-slate-400 text-sm">Create or join a group to start sharing!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mb-10">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onCopyCode={copyJoinCode}
                copiedCode={copiedCode}
              />
            ))}
          </div>
        )}

        {/* Photo Feed Section */}
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Squad Memories</h2>
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-xs font-medium rounded-full">Recent</span>
          </div>
          <PhotoFeed />
        </div>

        {/* Create Group Modal */}
        {showCreateModal && (
          <Modal
            title="Create New Squad"
            onClose={() => {
              setShowCreateModal(false);
              setGroupName("");
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Squad Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Summer Trip 2024"
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateGroup();
                    }
                  }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setGroupName("");
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || createMutation.isPending}
                  className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Squad"
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Join Group Modal */}
        {showJoinModal && (
          <Modal
            title="Join a Squad"
            onClose={() => {
              setShowJoinModal(false);
              setJoinCode("");
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enter Join Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
                    setJoinCode(value);
                  }}
                  placeholder="ABC123"
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-2xl font-mono tracking-widest uppercase"
                  autoFocus
                  maxLength={6}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && joinCode.length === 6) {
                      handleJoinGroup();
                    }
                  }}
                />
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Ask your friend for their 6-character squad code
                </p>
              </div>
              {joinMutation.isError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                  <p className="text-red-400 text-sm">
                    {joinMutation.error instanceof Error
                      ? joinMutation.error.message
                      : "Invalid code. Please try again."}
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode("");
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinGroup}
                  disabled={joinCode.length !== 6 || joinMutation.isPending}
                  className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold"
                >
                  {joinMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Squad"
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

interface GroupCardProps {
  group: Group;
  onCopyCode: (code: string) => void;
  copiedCode: string | null;
}

function GroupCard({ group, onCopyCode, copiedCode }: GroupCardProps) {
  // Generate a consistent color based on group ID
  const colors = [
    "border-amber-500",
    "border-blue-500",
    "border-emerald-500",
    "border-purple-500",
    "border-rose-500",
    "border-cyan-500"
  ];
  const colorClass = colors[(group.id.charCodeAt(0) || 0) % colors.length];

  return (
    <div className={`bg-slate-800 rounded-xl shadow-md overflow-hidden border-l-4 ${colorClass} p-5 hover:bg-slate-750 transition-colors`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{group.name}</h3>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Users className="w-4 h-4" />
            <span>
              {group.member_count !== undefined
                ? `${group.member_count} ${group.member_count === 1 ? "member" : "members"}`
                : "Active Squad"}
            </span>
          </div>
        </div>
      </div>

      {/* Join Code Ticket */}
      <div className="relative mt-2">
        {/* Dashed line */}
        <div className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-slate-700 -mx-5" />

        {/* Ticket Cutouts */}
        <div className="absolute top-0 -left-7 -translate-y-1/2 w-4 h-4 bg-slate-900 rounded-full" />
        <div className="absolute top-0 -right-7 -translate-y-1/2 w-4 h-4 bg-slate-900 rounded-full" />

        <div className="pt-4 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Join Code</span>

          <div className="flex items-center gap-3 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5">
            <span className="text-xl font-mono font-bold text-amber-400 tracking-[0.2em]">
              {group.join_code}
            </span>
            <button
              onClick={() => onCopyCode(group.join_code)}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              title="Copy code"
            >
              {copiedCode === group.join_code ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-800 border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
