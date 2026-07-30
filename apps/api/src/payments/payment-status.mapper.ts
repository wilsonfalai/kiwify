import type { PaymentStatus } from "@kiwifyclone/schemas";

const APPROVED = new Set(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"]);
const PENDING = new Set(["PENDING", "AWAITING_RISK_ANALYSIS"]);
const REFUSED = new Set(["OVERDUE"]);
const CANCELED = new Set([
  "REFUNDED",
  "REFUND_REQUESTED",
  "REFUND_IN_PROGRESS",
  "CHARGEBACK_REQUESTED",
  "CHARGEBACK_DISPUTE",
  "AWAITING_CHARGEBACK_REVERSAL",
  "DELETED"
]);

export function mapAsaasPaymentStatus(status: unknown): PaymentStatus | null {
  if (typeof status !== "string") {
    return null;
  }

  const normalized = status.trim().toUpperCase();

  if (APPROVED.has(normalized)) {
    return "approved";
  }

  if (PENDING.has(normalized)) {
    return "pending";
  }

  if (REFUSED.has(normalized)) {
    return "refused";
  }

  if (CANCELED.has(normalized)) {
    return "canceled";
  }

  return null;
}
