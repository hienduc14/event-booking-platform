import { apiRequest } from "./client";
import type { ETicket } from "../types/ticket";

export function getTicketsByBooking(bookingId: number) {
  return apiRequest<ETicket[]>(`/tickets/booking/${bookingId}`);
}

export function getTicketByCode(ticketCode: string) {
  return apiRequest<ETicket>(`/tickets/${encodeURIComponent(ticketCode)}`);
}

