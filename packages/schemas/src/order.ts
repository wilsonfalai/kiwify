import { z } from "zod";
import { checkoutCustomerSchema } from "./customer.js";

export const orderStatusValues = ["pending", "paid", "refused", "canceled"] as const;
export const orderStatusSchema = z.enum(orderStatusValues);

export const createOrderInputSchema = z.object({
  offerId: z.string().min(1),
  customer: checkoutCustomerSchema
});

export const orderSchema = z.object({
  id: z.string().min(1),
  customerId: z.string().min(1),
  status: orderStatusSchema,
  totalCents: z.number().int().positive(),
  currency: z.string().length(3),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  paidAt: z.string().min(1).optional()
});

export const orderItemSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  offerId: z.string().min(1),
  productId: z.string().min(1),
  titleSnapshot: z.string().min(1),
  priceCents: z.number().int().positive(),
  currency: z.string().length(3)
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
