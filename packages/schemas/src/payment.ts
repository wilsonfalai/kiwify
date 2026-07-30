import { z } from "zod";

export const paymentProviderNameSchema = z.enum(["asaas", "fake"]);
export const paymentStatusSchema = z.enum(["pending", "approved", "refused", "canceled"]);

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

export type PaymentProviderName = z.infer<typeof paymentProviderNameSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PaymentCustomerInput = z.infer<typeof paymentCustomerInputSchema>;
export type TransientCreditCardInput = z.infer<typeof transientCreditCardSchema>;
export type CreditCardHolderInfo = z.infer<typeof creditCardHolderInfoSchema>;
