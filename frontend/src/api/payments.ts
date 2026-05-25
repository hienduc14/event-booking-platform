import { apiRequest } from "./client";
import type { PaymentCreate, PaymentProcessRequest, PaymentProcessResult, PaymentRead } from "../types/payment";

export function createPayment(payload: PaymentCreate) {
  return apiRequest<PaymentRead>("/payments/create", { method: "POST", body: payload });
}

export function processPayment(payload: PaymentProcessRequest) {
  return apiRequest<PaymentProcessResult>("/payments/process", { method: "POST", body: payload });
}

