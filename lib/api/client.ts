/**
 * Server-side API client for Flask backend communication
 * This client is used ONLY in Next.js API routes (server-side)
 */

import { z } from "zod";

const FLASK_API_URL = process.env.FLASK_API_URL || "http://localhost:5000/api";

interface FetchOptions extends RequestInit {
  token?: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Server-side fetch wrapper for Flask backend
 */
async function fetchFromFlask<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${FLASK_API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      // Disable caching for API calls
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    return { data, status: response.status };
  } catch (error) {
    console.error(`[Flask API] Error fetching ${endpoint}:`, error);
    return {
      error: error instanceof Error ? error.message : "Network error",
      status: 500,
    };
  }
}

/**
 * Validate response data with Zod schema
 */
function validateResponse<T>(
  response: ApiResponse<unknown>,
  schema: z.ZodType<T>
): ApiResponse<T> {
  if (response.error || !response.data) {
    return response as ApiResponse<T>;
  }

  try {
    const validated = schema.parse(response.data);
    return { data: validated, status: response.status };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[Flask API] Validation error:", error.errors);
      return {
        error: "Invalid response from server",
        status: response.status,
      };
    }
    throw error;
  }
}

// ============================================
// Auth API
// ============================================

import {
  AuthResponseSchema,
  CurrentUserResponseSchema,
  type AuthResponse,
  type CurrentUserResponse,
} from "@/lib/schemas/auth";

export async function login(
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> {
  const response = await fetchFromFlask<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return validateResponse(response, AuthResponseSchema);
}

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<ApiResponse<AuthResponse>> {
  const response = await fetchFromFlask<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  return validateResponse(response, AuthResponseSchema);
}

export async function googleAuth(
  credential: string
): Promise<ApiResponse<AuthResponse>> {
  const response = await fetchFromFlask<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  return validateResponse(response, AuthResponseSchema);
}

export async function getCurrentUser(
  token: string
): Promise<ApiResponse<CurrentUserResponse>> {
  const response = await fetchFromFlask<CurrentUserResponse>("/auth/me", {
    token,
  });
  return validateResponse(response, CurrentUserResponseSchema);
}

// ============================================
// Game API
// ============================================

import {
  GameStateSchema,
  AchievementsResponseSchema,
  VisitLocationResponseSchema,
  VisitedLocationsResponseSchema,
  LearnPhraseResponseSchema,
  GameStatsSchema,
  LeaderboardResponseSchema,
  type GameState,
  type AchievementsResponse,
  type VisitLocationResponse,
  type VisitedLocationsResponse,
  type LearnPhraseResponse,
  type GameStats,
  type LeaderboardResponse,
} from "@/lib/schemas/game";

export async function getProgress(
  token: string
): Promise<ApiResponse<GameState>> {
  const response = await fetchFromFlask<GameState>("/game/progress", { token });
  return validateResponse(response, GameStateSchema);
}

export async function getAchievements(
  token: string
): Promise<ApiResponse<AchievementsResponse>> {
  const response = await fetchFromFlask<AchievementsResponse>(
    "/game/achievements",
    { token }
  );
  return validateResponse(response, AchievementsResponseSchema);
}

export async function visitLocation(
  token: string,
  locationId?: string,
  locationName?: string
): Promise<ApiResponse<VisitLocationResponse>> {
  const response = await fetchFromFlask<VisitLocationResponse>(
    "/game/visit-location",
    {
      method: "POST",
      body: JSON.stringify({
        location_id: locationId,
        location_name: locationName,
      }),
      token,
    }
  );
  return validateResponse(response, VisitLocationResponseSchema);
}

export async function getVisitedLocations(
  token: string
): Promise<ApiResponse<VisitedLocationsResponse>> {
  const response = await fetchFromFlask<VisitedLocationsResponse>(
    "/game/visited-locations",
    { token }
  );
  return validateResponse(response, VisitedLocationsResponseSchema);
}

export async function learnPhrase(
  token: string,
  phrase: string,
  meaning?: string
): Promise<ApiResponse<LearnPhraseResponse>> {
  const response = await fetchFromFlask<LearnPhraseResponse>(
    "/game/learn-phrase",
    {
      method: "POST",
      body: JSON.stringify({ phrase, meaning }),
      token,
    }
  );
  return validateResponse(response, LearnPhraseResponseSchema);
}

export async function getStats(
  token: string
): Promise<ApiResponse<GameStats>> {
  const response = await fetchFromFlask<GameStats>("/game/stats", { token });
  return validateResponse(response, GameStatsSchema);
}

export async function getLeaderboard(
  limit = 10
): Promise<ApiResponse<LeaderboardResponse>> {
  const response = await fetchFromFlask<LeaderboardResponse>(
    `/game/leaderboard?limit=${limit}`
  );
  return validateResponse(response, LeaderboardResponseSchema);
}

// ============================================
// Locations API
// ============================================

import {
  LocationsResponseSchema,
  LocationSchema,
  NearbyLocationsResponseSchema,
  LocationCategoriesResponseSchema,
  type LocationsResponse,
  type Location,
  type NearbyLocationsResponse,
  type LocationCategoriesResponse,
} from "@/lib/schemas/locations";

export async function getLocations(
  category?: string
): Promise<ApiResponse<LocationsResponse>> {
  const url = category ? `/locations?category=${category}` : "/locations";
  const response = await fetchFromFlask<LocationsResponse>(url);
  return validateResponse(response, LocationsResponseSchema);
}

export async function getLocation(
  locationId: string
): Promise<ApiResponse<Location>> {
  const response = await fetchFromFlask<Location>(`/locations/${locationId}`);
  return validateResponse(response, LocationSchema);
}

export async function searchLocations(
  query: string
): Promise<ApiResponse<LocationsResponse>> {
  const response = await fetchFromFlask<LocationsResponse>(
    `/locations/search?q=${encodeURIComponent(query)}`
  );
  return validateResponse(response, LocationsResponseSchema);
}

export async function getNearbyLocations(
  lat: number,
  lng: number,
  radius = 5
): Promise<ApiResponse<NearbyLocationsResponse>> {
  const response = await fetchFromFlask<NearbyLocationsResponse>(
    `/locations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
  );
  return validateResponse(response, NearbyLocationsResponseSchema);
}

export async function getLocationCategories(): Promise<
  ApiResponse<LocationCategoriesResponse>
> {
  const response = await fetchFromFlask<LocationCategoriesResponse>(
    "/locations/categories"
  );
  return validateResponse(response, LocationCategoriesResponseSchema);
}

// ============================================
// Quests API
// ============================================

import {
  QuestsResponseSchema,
  QuestSchema,
  UserQuestsResponseSchema,
  StartQuestResponseSchema,
  AdvanceQuestResponseSchema,
  AbandonQuestResponseSchema,
  type QuestsResponse,
  type Quest,
  type UserQuestsResponse,
  type StartQuestResponse,
  type AdvanceQuestResponse,
  type AbandonQuestResponse,
} from "@/lib/schemas/quests";

export async function getQuests(
  includeDaily = true
): Promise<ApiResponse<QuestsResponse>> {
  const url = `/quests?daily=${includeDaily}`;
  const response = await fetchFromFlask<QuestsResponse>(url);
  return validateResponse(response, QuestsResponseSchema);
}

export async function getQuest(
  questId: string
): Promise<ApiResponse<Quest>> {
  const response = await fetchFromFlask<Quest>(`/quests/${questId}`);
  return validateResponse(response, QuestSchema);
}

export async function getUserQuests(
  token: string
): Promise<ApiResponse<UserQuestsResponse>> {
  const response = await fetchFromFlask<UserQuestsResponse>("/quests/my-quests", {
    token,
  });
  return validateResponse(response, UserQuestsResponseSchema);
}

export async function startQuest(
  token: string,
  questId: string
): Promise<ApiResponse<StartQuestResponse>> {
  const response = await fetchFromFlask<StartQuestResponse>(
    `/quests/${questId}/start`,
    {
      method: "POST",
      token,
    }
  );
  return validateResponse(response, StartQuestResponseSchema);
}

export async function advanceQuest(
  token: string,
  questId: string
): Promise<ApiResponse<AdvanceQuestResponse>> {
  const response = await fetchFromFlask<AdvanceQuestResponse>(
    `/quests/${questId}/advance`,
    {
      method: "POST",
      token,
    }
  );
  return validateResponse(response, AdvanceQuestResponseSchema);
}

export async function abandonQuest(
  token: string,
  questId: string
): Promise<ApiResponse<AbandonQuestResponse>> {
  const response = await fetchFromFlask<AbandonQuestResponse>(
    `/quests/${questId}/abandon`,
    {
      method: "POST",
      token,
    }
  );
  return validateResponse(response, AbandonQuestResponseSchema);
}

// ============================================
// Photos API
// ============================================

import {
  PhotosResponseSchema,
  UploadPhotoResponseSchema,
  DeletePhotoResponseSchema,
  type PhotosResponse,
  type UploadPhotoResponse,
  type DeletePhotoResponse,
} from "@/lib/schemas/photos";

export async function getPhotos(
  token: string
): Promise<ApiResponse<PhotosResponse>> {
  const response = await fetchFromFlask<PhotosResponse>("/photos", { token });
  return validateResponse(response, PhotosResponseSchema);
}

export async function getLocationPhotos(
  locationId: string
): Promise<ApiResponse<PhotosResponse>> {
  const response = await fetchFromFlask<PhotosResponse>(
    `/photos/location/${locationId}`
  );
  return validateResponse(response, PhotosResponseSchema);
}

export async function deletePhoto(
  token: string,
  photoId: string
): Promise<ApiResponse<DeletePhotoResponse>> {
  const response = await fetchFromFlask<DeletePhotoResponse>(
    `/photos/${photoId}`,
    {
      method: "DELETE",
      token,
    }
  );
  return validateResponse(response, DeletePhotoResponseSchema);
}

// ============================================
// RAG API
// ============================================

import {
  RagQueryResponseSchema,
  RagContextResponseSchema,
  RagInfoResponseSchema,
  type RagQueryResponse,
  type RagContextResponse,
  type RagInfoResponse,
} from "@/lib/schemas/rag";

export async function queryRag(
  query: string,
  topK = 5,
  threshold = 0.5,
  token?: string
): Promise<ApiResponse<RagQueryResponse>> {
  const response = await fetchFromFlask<RagQueryResponse>("/rag/vertex/query", {
    method: "POST",
    body: JSON.stringify({ query, top_k: topK, threshold }),
    token,
  });
  return validateResponse(response, RagQueryResponseSchema);
}

export async function getRagContext(
  query: string,
  maxChunks = 5,
  token?: string
): Promise<ApiResponse<RagContextResponse>> {
  const response = await fetchFromFlask<RagContextResponse>(
    "/rag/vertex/context",
    {
      method: "POST",
      body: JSON.stringify({ query, max_chunks: maxChunks }),
      token,
    }
  );
  return validateResponse(response, RagContextResponseSchema);
}

export async function getRagInfo(): Promise<ApiResponse<RagInfoResponse>> {
  const response = await fetchFromFlask<RagInfoResponse>("/rag/vertex/info");
  return validateResponse(response, RagInfoResponseSchema);
}

// Export the fetch function for custom endpoints
export { fetchFromFlask, validateResponse };

