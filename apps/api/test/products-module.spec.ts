import { describe, expect, it } from "vitest";
import * as productsModule from "../src/products/products.module.js";

describe("ProductsModule", () => {
  it("exports products controller and services", () => {
    expect(productsModule.handleProductsRequest).toBeTypeOf("function");
    expect(productsModule.productsService).toBeDefined();
    expect(productsModule.publicProductsService).toBeDefined();
  });
});
