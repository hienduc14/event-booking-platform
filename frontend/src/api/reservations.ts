import { apiRequest } from "./client";
import type { BookingRead, ReservationRequest } from "../types/booking";

export function createReservation(payload: ReservationRequest) {
  return apiRequest<BookingRead>("/reservations", { method: "POST", body: payload });
}

