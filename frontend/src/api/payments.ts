import { apiRequest } from "./client";
import type { PaymentCreate, PaymentRead, PaymentWebhookPayload } from "../types/payment";

export function createPayment(payload: PaymentCreate) {
  return apiRequest<PaymentRead>("/payments/create", { method: "POST", body: payload });
}

export function sendPaymentWebhook(payload: PaymentWebhookPayload) {
  return apiRequest<{ message: string }>("/payments/webhook", { method: "POST", body: payload });
}

