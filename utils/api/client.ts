/**
 * API Client for Flask Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on init (client-side only)
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || `Request failed with status ${response.status}` };
      }

      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return { error: 'Network error. Please try again.' };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const result = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (result.data?.token) {
      this.setToken(result.data.token);
    }
    
    return result;
  }

  async register(email: string, password: string, name?: string) {
    const result = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    if (result.data?.token) {
      this.setToken(result.data.token);
    }
    
    return result;
  }

  async googleAuth(credential: string) {
    const result = await this.request<{ token: string; user: any }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    
    if (result.data?.token) {
      this.setToken(result.data.token);
    }
    
    return result;
  }

  async getCurrentUser() {
    return this.request<{ user: any; progress: any }>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Game endpoints
  async getProgress() {
    return this.request<any>('/game/progress');
  }

  async visitLocation(locationId?: string, locationName?: string) {
    return this.request<any>('/game/visit-location', {
      method: 'POST',
      body: JSON.stringify({ location_id: locationId, location_name: locationName }),
    });
  }

  async learnPhrase(phrase: string, meaning?: string) {
    return this.request<any>('/game/learn-phrase', {
      method: 'POST',
      body: JSON.stringify({ phrase, meaning }),
    });
  }

  async getAchievements() {
    return this.request<any>('/game/achievements');
  }

  async getVisitedLocations() {
    return this.request<any>('/game/visited-locations');
  }

  async getStats() {
    return this.request<any>('/game/stats');
  }

  async getLeaderboard(limit = 10) {
    return this.request<any>(`/game/leaderboard?limit=${limit}`);
  }

  // Location endpoints
  async getLocations(category?: string) {
    const url = category ? `/locations?category=${category}` : '/locations';
    return this.request<any>(url);
  }

  async getLocation(locationId: string) {
    return this.request<any>(`/locations/${locationId}`);
  }

  async searchLocations(query: string) {
    return this.request<any>(`/locations/search?q=${encodeURIComponent(query)}`);
  }

  async getNearbyLocations(lat: number, lng: number, radius = 5) {
    return this.request<any>(`/locations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }

  // Quest endpoints
  async getQuests() {
    return this.request<any>('/quests');
  }

  async getMyQuests() {
    return this.request<any>('/quests/my-quests');
  }

  async startQuest(questId: string) {
    return this.request<any>(`/quests/${questId}/start`, { method: 'POST' });
  }

  async advanceQuest(questId: string) {
    return this.request<any>(`/quests/${questId}/advance`, { method: 'POST' });
  }

  async abandonQuest(questId: string) {
    return this.request<any>(`/quests/${questId}/abandon`, { method: 'POST' });
  }

  // Photo endpoints
  async getPhotos() {
    return this.request<any>('/photos');
  }

  async uploadPhoto(file: File, locationId?: string, caption?: string, isSelfie = false) {
    const formData = new FormData();
    formData.append('file', file);
    if (locationId) formData.append('location_id', locationId);
    if (caption) formData.append('caption', caption);
    formData.append('is_selfie', String(isSelfie));

    const url = `${API_BASE_URL}/photos/upload`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || 'Upload failed' };
      }
      return { data };
    } catch (error) {
      return { error: 'Network error during upload' };
    }
  }

  async deletePhoto(photoId: string) {
    return this.request<any>(`/photos/${photoId}`, { method: 'DELETE' });
  }

  // RAG endpoints
  async searchKnowledge(query: string, category?: string) {
    return this.request<any>('/rag/search', {
      method: 'POST',
      body: JSON.stringify({ query, category }),
    });
  }

  async getContext(query: string) {
    return this.request<any>('/rag/context', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async getKnowledgeStats() {
    return this.request<any>('/rag/stats');
  }
}

// Export singleton instance
export const api = new ApiClient();
export default api;


