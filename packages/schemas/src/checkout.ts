import { z } from "zod";
import { checkoutCustomerSchema } from "./customer.js";
import { paymentMethodSchema, transientCreditCardSchema } from "./payment.js";

export const checkoutCardSchema = transientCreditCardSchema.extend({
  postalCode: z.string().transform((value) => value.replace(/\D/g, "")).pipe(z.string().min(8).max(8)),
  addressNumber: z.string().trim().min(1),
  addressComplement: z.string().trim().min(1).optional()
});

export const creditCardPaymentRequestSchema = z.object({
  card: checkoutCardSchema,
  remoteIp: z.string().trim().min(1).default("127.0.0.1")
});

const checkoutCardDraftSchema = z.object({
  number: z.string().optional(),
  holderName: z.string().optional(),
  expiryMonth: z.string().optional(),
  expiryYear: z.string().optional(),
  ccv: z.string().optional(),
  postalCode: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional()
});

export const checkoutFormSchema = z
  .object({
    customer: checkoutCustomerSchema,
    paymentMethod: paymentMethodSchema,
    card: checkoutCardDraftSchema.optional()
  })
  .superRefine((value, context) => {
    if (value.paymentMethod !== "credit_card") {
      return;
    }

    const result = checkoutCardSchema.safeParse(value.card);

    if (!result.success) {
      for (const issue of result.error.issues) {
        context.addIssue({
          code: "custom",
          path: ["card", ...issue.path],
          message: issue.message
        });
      }
    }
  });

export type CheckoutCard = z.infer<typeof checkoutCardSchema>;
export type CreditCardPaymentRequest = z.infer<typeof creditCardPaymentRequestSchema>;
export type CheckoutFormInput = z.input<typeof checkoutFormSchema>;
export type CheckoutFormData = z.output<typeof checkoutFormSchema>;
