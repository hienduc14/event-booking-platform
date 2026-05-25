export type EventStatus = "ACTIVE" | "CANCELLED" | "INACTIVE" | string;

export type EventSummary = {
  event_id: number;
  event_name: string;
  description?: string | null;
  number_of_days?: number | null;
  banner_url?: string | null;
  status: EventStatus;
};

export type EventVenue = {
  venue_id: number;
  venue_name: string;
  city: string;
  capacity: number;
};

export type EventTicketConfig = {
  config_id: number;
  schedule_id: number;
  ticket_type: string;
  price: string | number;
  max_quantity: number;
  remaining_quantity?: number | null;
};

export type EventSeat = {
  ticket_id: number;
  ticket_config_id: number;
  ticket_status: string;
  row_label?: string | null;
  col_number?: number | null;
  ticket_type?: string | null;
  price?: string | number | null;
};

export type EventDay = {
  event_day_id: number;
  schedule_id: number;
  date: string;
  seats: EventSeat[];
  available_tickets: EventSeat[];
};

export type EventSchedule = {
  schedule_id: number;
  event_id: number;
  venue_id: number;
  registration_start?: string | null;
  registration_end?: string | null;
  seat_layout?: string | null;
  venue: EventVenue;
  ticket_configs: EventTicketConfig[];
  event_days: EventDay[];
};

export type EventRead = EventSummary & {
  created_at?: string | null;
  updated_at?: string | null;
  schedules: EventSchedule[];
};
