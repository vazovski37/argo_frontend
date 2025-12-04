"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";

// Types
export interface Group {
  id: string;
  name: string;
  join_code: string;
  owner_id: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  member_count?: number;
  created_at: string;
}

export interface GroupsResponse {
  groups: Group[];
  total: number;
}

export interface CreateGroupInput {
  name: string;
}

export interface CreateGroupResponse {
  group: Group;
  message: string;
}

export interface JoinGroupInput {
  join_code: string;
}

export interface JoinGroupResponse {
  group: Group;
  message: string;
}

// API functions
async function fetchMyGroups(): Promise<GroupsResponse> {
  const response = await fetch("/api/groups/my-groups");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch groups");
  }

  return response.json();
}

async function createGroup(input: CreateGroupInput): Promise<CreateGroupResponse> {
  const response = await fetch("/api/groups/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create group");
  }

  return data;
}

async function joinGroup(input: JoinGroupInput): Promise<JoinGroupResponse> {
  const response = await fetch("/api/groups/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to join group");
  }

  return data;
}

// Hooks
export function useMyGroups(enabled = true) {
  return useQuery({
    queryKey: queryKeys.groups.myGroups(),
    queryFn: fetchMyGroups,
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
}

