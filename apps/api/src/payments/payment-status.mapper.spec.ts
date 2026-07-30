import { describe, expect, it } from "vitest";
import { mapAsaasPaymentStatus } from "./payment-status.mapper.js";

describe("Asaas payment status mapper", () => {
  it.each(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"])("maps %s to approved", (status) => {
    expect(mapAsaasPaymentStatus(status)).toBe("approved");
  });

  it.each(["PENDING", "AWAITING_RISK_ANALYSIS"])("maps %s to pending", (status) => {
    expect(mapAsaasPaymentStatus(status)).toBe("pending");
  });

  it("maps overdue charges to refused", () => {
    expect(mapAsaasPaymentStatus("OVERDUE")).toBe("refused");
  });

  it.each(["REFUNDED", "REFUND_REQUESTED", "CHARGEBACK_REQUESTED", "DELETED"])(
    "maps %s to canceled",
    (status) => {
      expect(mapAsaasPaymentStatus(status)).toBe("canceled");
    }
  );

  it("does not change state for unknown statuses", () => {
    expect(mapAsaasPaymentStatus("FUTURE_STATUS")).toBeNull();
    expect(mapAsaasPaymentStatus(undefined)).toBeNull();
  });
});
