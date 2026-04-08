const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('novu_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; clientId: string; userId: string; role: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (body: {
      email: string;
      password: string;
      clientName: string;
      businessType: string;
      avgDealValue?: number;
    }) => request<{ token: string; client: { id: string; name: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  },

  dashboard: {
    summary: () => request<DashboardSummary>('/dashboard/summary'),
    timeline: (days?: number) => request<{ timeline: TimelinePoint[]; days: number }>(`/dashboard/timeline?days=${days || 7}`),
  },

  leads: {
    list: (page = 1, limit = 50) => request<{ leads: Lead[]; total: number }>(`/leads?page=${page}&limit=${limit}`),
    create: (data: { name: string; email?: string; phone?: string }) =>
      request<Lead>('/leads', { method: 'POST', body: JSON.stringify(data) }),
    import: (leads: Array<{ name: string; email?: string; phone?: string }>) =>
      request<{ imported: number; total: number }>('/leads/import', {
        method: 'POST',
        body: JSON.stringify({ leads }),
      }),
  },

  events: {
    create: (leadId: string, type: string, payload?: Record<string, unknown>) =>
      request<{ event: Event; jobsCreated: number }>('/events', {
        method: 'POST',
        body: JSON.stringify({ leadId, type, payload }),
      }),
    bulk: (type: string, payload?: Record<string, unknown>) =>
      request<{ leadsProcessed: number; eventsCreated: number; jobsCreated: number }>('/events/bulk', {
        method: 'POST',
        body: JSON.stringify({ type, payload }),
      }),
  },

  workflows: {
    list: () => request<{ workflows: Workflow[] }>('/workflows'),
    create: (data: { name: string; triggerType: string; steps: WorkflowStep[] }) =>
      request<Workflow>('/workflows', { method: 'POST', body: JSON.stringify(data) }),
    toggle: (id: string, isActive: boolean) =>
      request<Workflow>(`/workflows/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
  },

  health: () => request<{ status: string; timestamp: string }>('/health'),
};

// Types
export interface DashboardSummary {
  clientName: string;
  leadsContacted: number;
  messagesSent: number;
  recoveredRevenue: number;
  avgDealValue: number;
  channelBreakdown: Record<string, number>;
  jobBreakdown: Record<string, number>;
}

export interface TimelinePoint {
  date: string;
  total: number;
  email?: number;
  sms?: number;
}

export interface Lead {
  id: string;
  clientId: string;
  name: string;
  email?: string;
  phone?: string;
  metadata: string;
  createdAt: string;
}

export interface Workflow {
  id: string;
  clientId: string;
  name: string;
  triggerType: string;
  steps: string;
  isActive: boolean;
  createdAt: string;
}

export interface WorkflowStep {
  delay: string;
  channel: 'email' | 'sms';
  messageHint?: string;
}
