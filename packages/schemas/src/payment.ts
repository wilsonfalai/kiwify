import { z } from "zod";

export const paymentProviderNameValues = ["asaas", "fake"] as const;
export const paymentMethodValues = ["pix", "credit_card"] as const;
export const paymentStatusValues = ["pending", "approved", "refused", "canceled"] as const;

export const paymentProviderNameSchema = z.enum(paymentProviderNameValues);
export const paymentMethodSchema = z.enum(paymentMethodValues);
export const paymentStatusSchema = z.enum(paymentStatusValues);

export const paymentCustomerInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  document: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  externalReference: z.string().min(1).optional()
});

export const transientCreditCardSchema = z.object({
  number: z.string().min(12).max(19),
  holderName: z.string().min(1),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
  expiryYear: z.string().regex(/^\d{4}$/),
  ccv: z.string().regex(/^\d{3,4}$/)
});

export const creditCardHolderInfoSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  document: z.string().min(1),
  postalCode: z.string().min(1),
  addressNumber: z.string().min(1),
  addressComplement: z.string().min(1).optional(),
  phone: z.string().min(1).optional()
});

export const paymentSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  provider: paymentProviderNameSchema,
  method: paymentMethodSchema,
  status: paymentStatusSchema,
  amountCents: z.number().int().positive(),
  currency: z.string().length(3),
  safeMetadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  approvedAt: z.string().min(1).optional(),
  refusedAt: z.string().min(1).optional()
});

export type PaymentProviderName = z.infer<typeof paymentProviderNameSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PaymentCustomerInput = z.infer<typeof paymentCustomerInputSchema>;
export type TransientCreditCardInput = z.infer<typeof transientCreditCardSchema>;
export type CreditCardHolderInfo = z.infer<typeof creditCardHolderInfoSchema>;
export type Payment = z.infer<typeof paymentSchema>;
