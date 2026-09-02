export type SubscriptionStatus = "none" | "trialing" | "active" | "expired";

export type BillingStatus = {
  status: SubscriptionStatus;
  daysRemaining: number | null;
  plan: string | null;
  currentPeriodEnd: string | null;
};

export type Appointment = {
  fullName: string;
  phone: string;
  service: string;
  date: string;
  time: string;
};

export type SavedAppointment = Appointment & {
  id: string;
  name?: string;
  source?: string;
  created_at?: string;
};

export type Agent = {
  id: string;
  name: string;
  instructions: string;
  services: string[];
  telegram_chat_id: string;
  telegram_configured: boolean;
  voice?: string;
  language?: string;
  personality?: string;
  tone?: string;
  slug?: string;
  created_at: string;
  updated_at?: string;
};

export type Conversation = {
  id: string;
  agent_id: string;
  agent_name: string;
  status: "active" | "completed";
  started_at: string;
  ended_at: string | null;
};

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:3000" : "");

function getAuthHeader(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const devToken = import.meta.env.DEV ? "local-dev-token" : null;
  return token || devToken ? { Authorization: `Bearer ${token ?? devToken}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...getAuthHeader(),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? "לא ניתן להשלים את הפעולה כרגע");
  }

  return data as T;
}

export const api = {
  register(email: string, password: string) {
    return request<{ success: true; access_token?: string; refresh_token?: string; message: string; requiresEmailConfirmation?: boolean; user?: { id: string; email: string } }>("/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getBillingStatus() {
    return request<{ success: true } & BillingStatus>("/billing/status");
  },

  startTrial() {
    return request<{ success: true; subscription: unknown }>("/billing/start-trial", { method: "POST" });
  },

  checkAvailability(date: string, service: string) {
    return request<{ success: true; date: string; slots: string[] }>("/tool/check_availability", {
      method: "POST",
      body: JSON.stringify({ date, service }),
    });
  },
  bookAppointment(appointment: Appointment) {
    return request<{ success: true; appointment: SavedAppointment }>("/tool/book_appointment", {
      method: "POST",
      body: JSON.stringify({ ...appointment, name: appointment.fullName }),
    });
  },
  listAppointments() {
    return request<{ success: true; appointments: SavedAppointment[] }>("/tool/appointments");
  },
  listAgents() {
    return request<{ success: true; agents: Agent[] }>("/agents");
  },
  getAgent(agentId: string) {
    return request<{ success: true; agent: Agent }>(`/agents/${agentId}`);
  },
  createAgent(agent: {
    name: string;
    instructions: string;
    services: string;
    telegram_bot_token: string;
    telegram_chat_id: string;
    voice: string;
    language: string;
    personality: string;
    tone: string;
  }) {
    return request<{ success: true; agent: Agent }>("/agents", {
      method: "POST",
      body: JSON.stringify(agent),
    });
  },
  listConversations() {
    return request<{ success: true; conversations: Conversation[] }>("/conversations");
  },
  createRealtimeSession() {
    return request<{ client_secret: unknown; expires_at?: number }>("/xai/session", { method: "POST" });
  },
  getVoiceToken(agentId?: string) {
    return request<{ success: true; token: string; expires_in: number }>("/xai/voice-token", {
      method: "POST",
      body: JSON.stringify({ agent_id: agentId }),
    });
  },
};
