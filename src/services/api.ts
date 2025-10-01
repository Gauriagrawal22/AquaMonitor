class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:3001/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('aquamonitor_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Network error' } }));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication methods
  async login(username: string, password: string) {
    const response = await this.request<{
      token: string;
      user: {
        id: number;
        username: string;
        email: string;
        fullName: string;
        role: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    this.token = response.token;
    localStorage.setItem('aquamonitor_token', response.token);
    return response;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }) {
    const response = await this.request<{
      token: string;
      user: any;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.token = response.token;
    localStorage.setItem('aquamonitor_token', response.token);
    return response;
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/profile');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('aquamonitor_token');
  }

  // Station methods
  async getStations(params?: { search?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString();
    return this.request<{ stations: any[] }>(`/stations${query ? `?${query}` : ''}`);
  }

  async getStation(id: string) {
    return this.request<{ station: any }>(`/stations/${id}`);
  }

  async createStation(stationData: any) {
    return this.request('/stations', {
      method: 'POST',
      body: JSON.stringify(stationData),
    });
  }

  async updateStation(id: string, stationData: any) {
    return this.request(`/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stationData),
    });
  }

  async deleteStation(id: string) {
    return this.request(`/stations/${id}`, {
      method: 'DELETE',
    });
  }

  // Water readings methods
  async getStationReadings(stationId: string, params?: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    
    const query = searchParams.toString();
    return this.request<{
      readings: any[];
      pagination: any;
    }>(`/readings/station/${stationId}${query ? `?${query}` : ''}`);
  }

  async getLatestReadings() {
    return this.request<{ readings: any[] }>('/readings/latest');
  }

  async addReading(readingData: {
    stationId: string;
    waterLevel: number;
    temperature?: number;
    phLevel?: number;
  }) {
    return this.request('/readings', {
      method: 'POST',
      body: JSON.stringify(readingData),
    });
  }

  async getAnalytics(stationId: string, period: string = '7d') {
    return this.request<{
      analytics: any;
      trend: any[];
    }>(`/readings/analytics/${stationId}?period=${period}`);
  }

  // Alerts methods
  async getAlerts(params?: {
    status?: 'active' | 'acknowledged' | 'all';
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const query = searchParams.toString();
    return this.request<{
      alerts: any[];
      pagination: any;
    }>(`/alerts${query ? `?${query}` : ''}`);
  }

  async getStationAlerts(stationId: string) {
    return this.request<{ alerts: any[] }>(`/alerts/station/${stationId}`);
  }

  async createAlert(alertData: {
    stationId: string;
    alertType: string;
    severity?: string;
    message?: string;
  }) {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async acknowledgeAlert(alertId: number) {
    return this.request(`/alerts/${alertId}/acknowledge`, {
      method: 'PATCH',
    });
  }

  async getAlertStats() {
    return this.request<{
      stats: any;
      alertsByType: any[];
    }>('/alerts/stats');
  }

  // Health check
  async checkHealth() {
    return this.request<{
      status: string;
      database: string;
      timestamp: string;
    }>('/health');
  }
}

export default new ApiService();