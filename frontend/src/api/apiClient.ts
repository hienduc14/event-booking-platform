const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export async function fetchEvents() {
  const response = await fetch(`${API_BASE}/events/`);
  return response.json();
}

export async function createTicket(payload: unknown) {
  const response = await fetch(`${API_BASE}/tickets/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}
