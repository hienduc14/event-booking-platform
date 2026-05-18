import { apiRequest } from "./client";
import type { Artist, ArtistCreate, EventArtistCreate, EventArtistRead } from "../types/artist";
import type { BookingListItem } from "../types/booking";
import type { Refund } from "../types/refund";
import type { Venue, VenueCreate, VenueUpdate } from "../types/venue";

export type AdminToken = {
  access_token: string;
  token_type: string;
};

export function loginAdmin(username: string, password: string) {
  const form = new URLSearchParams();
  form.set("username", username);
  form.set("password", password);
  return apiRequest<AdminToken>("/admin/login", { method: "POST", form });
}

export function listVenues(token: string) {
  return apiRequest<Venue[]>("/admin/venues", { token });
}

export function createVenue(payload: VenueCreate, token: string) {
  return apiRequest<Venue>("/admin/venues", { method: "POST", body: payload, token });
}

export function updateVenue(venueId: number, payload: VenueUpdate, token: string) {
  return apiRequest<Venue>(`/admin/venues/${venueId}`, { method: "PUT", body: payload, token });
}

export function listArtists(token: string) {
  return apiRequest<Artist[]>("/admin/artists", { token });
}

export function createArtist(payload: ArtistCreate, token: string) {
  return apiRequest<Artist>("/admin/artists", { method: "POST", body: payload, token });
}

export function assignArtist(payload: EventArtistCreate, token: string) {
  return apiRequest<EventArtistRead>("/admin/artists/assign", { method: "POST", body: payload, token });
}

export function listBookings(token: string) {
  return apiRequest<BookingListItem[]>("/admin/bookings", { token });
}

export function listPendingRefunds(token: string) {
  return apiRequest<Refund[]>("/admin/refunds/pending", { token });
}

export function processAllRefunds(token: string) {
  return apiRequest<{ message: string }>("/admin/refunds/process-all", { method: "POST", token });
}
