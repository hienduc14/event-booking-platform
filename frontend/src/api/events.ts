import { apiRequest } from "./client";
import type { EventCreate, EventDayCreate, EventDayRead, EventRead, EventScheduleCreate, EventScheduleRead, EventSummary, EventUpdate } from "../types/event";
import type { ListParams } from "../types/api";
import type { TicketConfig, TicketConfigCreate } from "../types/ticketConfig";

function listQuery(params?: ListParams) {
  const search = new URLSearchParams();
  if (params?.skip !== undefined) search.set("skip", String(params.skip));
  if (params?.limit !== undefined) search.set("limit", String(params.limit));
  const value = search.toString();
  return value ? `?${value}` : "";
}

export function getEvents(params?: ListParams) {
  return apiRequest<EventSummary[]>(`/events${listQuery(params)}`);
}

export function getEvent(eventId: number) {
  return apiRequest<EventRead>(`/events/${eventId}`);
}

export function createAdminEvent(payload: EventCreate, token: string) {
  return apiRequest<EventRead>("/admin/events", { method: "POST", body: payload, token });
}

export function updateAdminEvent(eventId: number, payload: EventUpdate, token: string) {
  return apiRequest<EventRead>(`/admin/events/${eventId}`, { method: "PUT", body: payload, token });
}

export function cancelAdminEvent(eventId: number, reason: string, token: string) {
  return apiRequest<{ message: string }>(`/admin/events/${eventId}/cancel?reason=${encodeURIComponent(reason)}`, {
    method: "POST",
    token,
  });
}

export function createSchedule(payload: EventScheduleCreate, token: string) {
  return apiRequest<EventScheduleRead>("/admin/events/schedules", { method: "POST", body: payload, token });
}

export function createEventDay(payload: EventDayCreate, token: string) {
  return apiRequest<EventDayRead>("/admin/events/days", { method: "POST", body: payload, token });
}

export function createTicketConfig(payload: TicketConfigCreate, token: string) {
  return apiRequest<TicketConfig>("/admin/events/ticket-configs", { method: "POST", body: payload, token });
}

