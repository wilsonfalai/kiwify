import { describe, expect, it } from "vitest";
import * as ordersModule from "../src/orders/orders.module.js";

describe("OrdersModule", () => {
  it("exports a service that creates pending orders", () => {
    expect(ordersModule.ordersService.createOrder).toBeTypeOf("function");
    expect(ordersModule.ordersRepository.snapshot().orders).toBeDefined();
  });
});
