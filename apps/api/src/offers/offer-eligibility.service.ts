import type { PaymentMethod } from "@kiwifyclone/schemas";
import { offersService } from "./offers.service.js";

export interface OfferEligibility {
  eligible: boolean;
  reason?: "offer_not_purchasable" | "payment_method_not_allowed";
}

export class OfferEligibilityService {
  check(offerId: string, method: PaymentMethod): OfferEligibility {
    try {
      offersService.ensureOfferCanBePurchased(offerId, method);
      return { eligible: true };
    } catch (error) {
      const reason = error instanceof Error && error.message === "payment_method_not_allowed" ? "payment_method_not_allowed" : "offer_not_purchasable";

      return {
        eligible: false,
        reason
      };
    }
  }
}

export const offerEligibilityService = new OfferEligibilityService();
