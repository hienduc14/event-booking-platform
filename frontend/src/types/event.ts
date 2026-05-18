export type EventStatus = "ACTIVE" | "CANCELLED" | "INACTIVE" | string;

export type EventSummary = {
  event_id: number;
  event_name: string;
  description?: string | null;
  banner_url?: string | null;
  status: EventStatus;
};

export type EventRead = EventSummary & {
  created_at: string;
  updated_at: string;
};

export type EventCreate = {
  event_name: string;
  description?: string;
  banner_url?: string;
};

export type EventUpdate = Partial<EventCreate> & {
  status?: EventStatus;
};

export type EventScheduleCreate = {
  event_id: number;
  venue_id: number;
};

export type EventScheduleRead = EventScheduleCreate & {
  schedule_id: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type EventDayCreate = {
  schedule_id: number;
  date: string;
};

export type EventDayRead = EventDayCreate & {
  event_day_id: number;
  status: string;
  created_at: string;
  updated_at: string;
};

