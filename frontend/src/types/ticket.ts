export type TicketStatus = "VALID" | "USED" | "CANCELLED" | "REFUNDED" | string;

export type ETicket = {
  ticket_code: string;
  booking_detail_id: number;
  ticket_status: TicketStatus;
  qr_code_url?: string | null;
  issued_at: string;
  used_at?: string | null;
  created_at: string;
  updated_at: string;
};

