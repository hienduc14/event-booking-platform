export type TicketConfig = {
  config_id: number;
  schedule_id: number;
  ticket_type: string;
  price: string | number;
  max_quantity: number;
  remaining_quantity?: number | null;
  created_at: string;
  updated_at: string;
};

export type TicketConfigCreate = {
  schedule_id: number;
  ticket_type: string;
  price: number;
  max_quantity: number;
};

