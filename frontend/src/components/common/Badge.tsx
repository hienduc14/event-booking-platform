type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneByStatus: Record<string, BadgeTone> = {
  ACTIVE: "success",
  PAID: "success",
  SUCCESS: "success",
  VALID: "success",
  PENDING: "warning",
  PENDING_PAYMENT: "warning",
  INITIATED: "warning",
  PROCESSING: "warning",
  REFUNDING: "warning",
  CANCELLED: "danger",
  FAILED: "danger",
  PAYMENT_FAILED: "danger",
  REFUND_FAILED: "danger",
  REFUNDED: "info",
  USED: "neutral",
};

export function Badge({ children, tone }: { children: React.ReactNode; tone?: BadgeTone }) {
  const value = String(children);
  const resolvedTone = tone ?? toneByStatus[value] ?? "neutral";
  return <span className={`badge badge-${resolvedTone}`}>{children}</span>;
}

