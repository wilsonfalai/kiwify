import { z } from "zod";

export const offerStatusSchema = z.enum(["active", "inactive"]);
export const paymentMethodSchema = z.enum(["pix", "credit_card"]);

export const offerSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  name: z.string().min(1),
  priceCents: z.number().int().positive(),
  currency: z.string().length(3).default("BRL"),
  status: offerStatusSchema,
  allowedPaymentMethods: z.array(paymentMethodSchema).min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1)
});

export const createOfferSchema = z.object({
  name: z.string().min(1),
  priceCents: z.number().int().positive(),
  currency: z.string().length(3).default("BRL"),
  status: offerStatusSchema.default("active"),
  allowedPaymentMethods: z.array(paymentMethodSchema).min(1)
});

export type OfferStatus = z.infer<typeof offerStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type Offer = z.infer<typeof offerSchema>;
export type CreateOfferInput = z.input<typeof createOfferSchema>;
