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
  created_at: string;
};

export type Conversation = {
  id: string;
  agent_id: string;
  agent_name: string;
  status: "active" | "completed";
  started_at: string;
  ended_at: string | null;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
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
};
