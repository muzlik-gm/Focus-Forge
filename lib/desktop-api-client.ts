/**
 * Desktop API Client
 * 
 * Handles API communication for the desktop app with the cloud backend.
 * Uses the same MongoDB database as the web version.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

class DesktopApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  /**
   * Set authentication token
   */
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

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Make authenticated API request
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      console.log(`[DesktopAPI] ${options.method || 'GET'} ${endpoint}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error(`[DesktopAPI] Error ${response.status}:`, data);
        return {
          ok: false,
          status: response.status,
          error: data?.error || { message: 'Request failed' },
        };
      }

      console.log(`[DesktopAPI] Success:`, data);
      return {
        ok: true,
        status: response.status,
        data,
      };
    } catch (error: any) {
      console.error(`[DesktopAPI] Network error:`, error);
      return {
        ok: false,
        status: 0,
        error: {
          message: error.message || 'Network error',
          code: 'NETWORK_ERROR',
        },
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ============================================================================
  // Authentication Methods
  // ============================================================================

  /**
   * Register new user
   */
  async register(data: { name: string; email: string; password: string }) {
    console.log('[DesktopAPI] Registering user:', data.email);
    const response = await this.post('/api/auth/register', data);
    
    if (response.ok && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  /**
   * Login user
   */
  async login(data: { email: string; password: string }) {
    console.log('[DesktopAPI] Logging in user:', data.email);
    
    // Use NextAuth credentials endpoint
    const response = await this.post('/api/auth/callback/credentials', data);
    
    if (response.ok && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  /**
   * Logout user
   */
  async logout() {
    console.log('[DesktopAPI] Logging out user');
    this.setToken(null);
    localStorage.removeItem('user');
    return { ok: true };
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    console.log('[DesktopAPI] Getting current user');
    return this.get('/api/auth/session');
  }

  // ============================================================================
  // Tasks Methods
  // ============================================================================

  async getTasks() {
    return this.get('/api/tasks');
  }

  async createTask(data: any) {
    return this.post('/api/tasks', data);
  }

  async updateTask(id: string, data: any) {
    return this.put(`/api/tasks/${id}`, data);
  }

  async deleteTask(id: string) {
    return this.delete(`/api/tasks/${id}`);
  }

  // ============================================================================
  // Focus Sessions Methods
  // ============================================================================

  async getSessions() {
    return this.get('/api/sessions');
  }

  async startSession(data: any) {
    return this.post('/api/sessions/start', data);
  }

  async stopSession(id: string) {
    return this.post(`/api/sessions/${id}/stop`, {});
  }

  async pauseSession(id: string) {
    return this.post(`/api/sessions/${id}/pause`, {});
  }

  async resumeSession(id: string) {
    return this.post(`/api/sessions/${id}/resume`, {});
  }

  // ============================================================================
  // Analytics Methods
  // ============================================================================

  async getDashboardAnalytics() {
    return this.get('/api/analytics/dashboard');
  }

  async getWeeklyAnalytics() {
    return this.get('/api/analytics/weekly');
  }

  async getMonthlyAnalytics() {
    return this.get('/api/analytics/monthly');
  }

  // ============================================================================
  // Settings Methods
  // ============================================================================

  async getSettings() {
    return this.get('/api/settings');
  }

  async updateSettings(data: any) {
    return this.put('/api/settings', data);
  }

  async updateProfile(data: any) {
    return this.put('/api/settings/profile', data);
  }

  async updateNotifications(data: any) {
    return this.put('/api/settings/notifications', data);
  }
}

// Export singleton instance
export const desktopApi = new DesktopApiClient();

// Export class for testing
export { DesktopApiClient };
