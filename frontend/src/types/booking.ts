import type { ETicket } from "./ticket";

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PAYMENT_FAILED"
  | "CANCELLED"
  | "REFUNDING"
  | "REFUNDED"
  | "REFUND_FAILED"
  | string;

export type ReservationRequest = {
  customer_name: string;
  phone: string;
  email: string;
  schedule_id: number;
  event_day_id: number;
  ticket_ids: number[];
};

export type BookingRead = {
  booking_id: number;
  schedule_id: number;
  customer_name: string;
  phone: string;
  email: string;
  payment_account?: string | null;
  booking_status: BookingStatus;
  total_amount: string | number;
  expires_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  e_tickets: ETicket[];
};

export type BookingListItem = {
  booking_id: number;
  customer_name: string;
  email: string;
  phone: string;
  booking_status: BookingStatus;
  total_amount: string | number;
  created_at?: string | null;
};
