"use client";

import { useState } from "react";
import { useMyGroups, useCreateGroup, useJoinGroup, type Group } from "@/hooks/useGroups";
import { Users, Plus, UserPlus, Copy, Check, Loader2, X } from "lucide-react";
import PhotoFeed from "@/components/PhotoFeed";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            My Travel Squads
          </h1>
          <p className="text-slate-300 text-lg">
            Create or join groups to share memories with friends
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Create Group Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Create Group</h2>
                <p className="text-slate-300">Start a new travel squad</p>
              </div>
            </div>
          </button>

          {/* Join Group Card */}
          <button
            onClick={() => setShowJoinModal(true)}
            className="group relative p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Join Group</h2>
                <p className="text-slate-300">Enter a 6-character code</p>
              </div>
            </div>
          </button>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-200">Failed to load groups. Please try again.</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Groups Yet</h3>
            <p className="text-slate-300 mb-6">Create or join a group to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Memories</h2>
            <p className="text-slate-300">Photos shared by you and your groups</p>
          </div>
          <PhotoFeed />
        </div>

        {/* Create Group Modal */}
        {showCreateModal && (
          <Modal
            title="Create New Group"
            onClose={() => {
              setShowCreateModal(false);
              setGroupName("");
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Summer Trip 2024"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateGroup();
                    }
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setGroupName("");
                  }}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || createMutation.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Join Group Modal */}
        {showJoinModal && (
          <Modal
            title="Join Group"
            onClose={() => {
              setShowJoinModal(false);
              setJoinCode("");
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono tracking-widest"
                  autoFocus
                  maxLength={6}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && joinCode.length === 6) {
                      handleJoinGroup();
                    }
                  }}
                />
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Enter the 6-character code shared by your group
                </p>
              </div>
              {joinMutation.isError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                  <p className="text-red-200 text-sm">
                    {joinMutation.error instanceof Error
                      ? joinMutation.error.message
                      : "Failed to join group"}
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode("");
                  }}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinGroup}
                  disabled={joinCode.length !== 6 || joinMutation.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {joinMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join"
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
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
      {/* Group Name */}
      <h3 className="text-2xl font-bold text-white mb-3">{group.name}</h3>

      {/* Member Count */}
      <div className="flex items-center gap-2 text-slate-300 mb-4">
        <Users className="w-4 h-4" />
        <span className="text-sm">
          {group.member_count !== undefined
            ? `${group.member_count} ${group.member_count === 1 ? "member" : "members"}`
            : "Active Squad"}
        </span>
      </div>

      {/* Join Code Section */}
      <div className="pt-4 border-t border-white/10">
        <label className="block text-xs text-slate-400 mb-2">Join Code</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg">
            <span className="text-2xl font-mono font-bold text-white tracking-widest">
              {group.join_code}
            </span>
          </div>
          <button
            onClick={() => onCopyCode(group.join_code)}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
            title="Copy join code"
          >
            {copiedCode === group.join_code ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5 text-white" />
            )}
          </button>
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-800 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
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

