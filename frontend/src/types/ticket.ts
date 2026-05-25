export type TicketStatus = "Available" | "Holding" | "Valid" | "Used" | "Canceled" | "Refunded" | "Reserved" | string;

export type ETicket = {
  ticket_id: number;
  ticket_config_id: number;
  event_day_id: number;
  booking_id?: number | null;
  ticket_code?: string | null;
  ticket_status: TicketStatus;
  row_label?: string | null;
  col_number?: number | null;
  ticket_type?: string | null;
  price?: string | number | null;
  event_name?: string | null;
  venue_name?: string | null;
  date?: string | null;
  customer_name?: string | null;
  qr_code_url?: string | null;
  issued_at?: string | null;
  used_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};
