export type RefundStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | string;

export type Refund = {
  refund_id: number;
  booking_id: number;
  gateway_refund_id?: string | null;
  amount: string | number;
  status: RefundStatus;
  reason?: string | null;
  is_manual: boolean;
  created_at: string;
  updated_at: string;
};

