import { describe, expect, it } from "vitest";
import * as offersModule from "../src/offers/offers.module.js";

describe("OffersModule", () => {
  it("exports offers controller and services", () => {
    expect(offersModule.handleOffersRequest).toBeTypeOf("function");
    expect(offersModule.offersService).toBeDefined();
    expect(offersModule.offerEligibilityService).toBeDefined();
  });
});
