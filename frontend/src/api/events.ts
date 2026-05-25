import { apiRequest } from "./client";
import type { EventRead, EventSummary } from "../types/event";
import type { ListParams } from "../types/api";

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

