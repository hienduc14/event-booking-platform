export type PaymentMethod = "ONLINE_BANKING" | "CARD_PAYMENT";
export type PaymentStatus = "INITIATED" | "AWAITING_TRANSFER" | "SUCCESS" | "FAILED" | "EXPIRED" | string;

export type CompanyBankInfo = {
  bank_name: string;
  account_name: string;
  account_number: string;
  qr_code_url: string;
};

export type PaymentCreate = {
  booking_id: number;
  payment_method: PaymentMethod;
};

export type PaymentRead = {
  payment_id: number;
  booking_id: number;
  gateway_transaction_id?: string | null;
  payment_method: PaymentMethod;
  amount: string | number;
  status: PaymentStatus;
  company_bank: CompanyBankInfo;
  refund_account_required: boolean;
  card_payment_required: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PaymentProcessRequest = {
  booking_id: number;
  payment_method: PaymentMethod;
  refund_account?: string;
  card_number?: string;
  expiration?: string;
  cvv?: string;
};

export type PaymentProcessResult = {
  message: string;
  status: PaymentStatus;
  booking_status: string;
  tickets_ready: boolean;
};
