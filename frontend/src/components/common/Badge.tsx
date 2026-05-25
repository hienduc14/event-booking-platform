type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";
type BadgeVariant = "soft" | "solid";

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

export function Badge({
  children,
  tone,
  variant = "soft",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  variant?: BadgeVariant;
}) {
  const value = String(children);
  const resolvedTone = tone ?? toneByStatus[value.toUpperCase()] ?? "neutral";
  return <span className={`badge badge-${variant} badge-${resolvedTone}`}>{children}</span>;
}
