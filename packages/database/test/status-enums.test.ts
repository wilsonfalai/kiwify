import { orderStatusValues, paymentStatusValues } from "@kiwifyclone/schemas";
import { describe, expect, it } from "vitest";
import { orderStatusEnum, paymentStatusEnum } from "../src/schema/enums.js";

describe("canonical order and payment statuses", () => {
  it("keeps shared schemas and database enums consistent", () => {
    expect(orderStatusEnum.enumValues).toEqual([...orderStatusValues]);
    expect(paymentStatusEnum.enumValues).toEqual([...paymentStatusValues]);
  });
});
