export type BookingStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PAYMENT_FAILED"
  | "CANCELLED"
  | "REFUNDING"
  | "REFUNDED"
  | "REFUND_FAILED"
  | string;

export type BookingItem = {
  config_id: number;
  quantity: number;
};

export type ReservationRequest = {
  customer_name: string;
  phone: string;
  email: string;
  payment_account: string;
  schedule_id: number;
  event_day_id: number;
  items: BookingItem[];
};

export type BookingDetailRead = {
  booking_detail_id: number;
  config_id: number;
  event_day_id: number;
  quantity: number;
  unit_price: string | number;
  subtotal: string | number;
};

export type BookingRead = {
  booking_id: number;
  schedule_id: number;
  customer_name: string;
  phone: string;
  email: string;
  payment_account: string;
  booking_status: BookingStatus;
  total_amount: string | number;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
  booking_details: BookingDetailRead[];
};

export type BookingListItem = {
  booking_id: number;
  customer_name: string;
  email: string;
  phone: string;
  booking_status: BookingStatus;
  total_amount: string | number;
  created_at: string;
};

