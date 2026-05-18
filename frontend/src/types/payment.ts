export type PaymentStatus = "INITIATED" | "SUCCESS" | "FAILED" | "EXPIRED" | string;

export type PaymentCreate = {
  booking_id: number;
  payment_method: string;
};

export type PaymentRead = {
  payment_id: number;
  booking_id: number;
  gateway_transaction_id?: string | null;
  payment_method: string;
  amount: string | number;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
};

export type PaymentWebhookPayload = {
  transaction_id: string;
  booking_id: number;
  status: "SUCCESS" | "FAILED";
  amount: string | number;
  signature?: string;
};

