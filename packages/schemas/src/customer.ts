import { z } from "zod";
import type { PaymentMethod, PaymentProviderName } from "./payment.js";

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

export const customerDocumentSchema = z
  .string()
  .transform(digits)
  .refine((value) => value.length === 11 || value.length === 14, {
    message: "Documento deve conter 11 ou 14 dígitos."
  });

export const customerPhoneSchema = z
  .string()
  .transform(digits)
  .refine((value) => value.length >= 10 && value.length <= 13, {
    message: "Telefone deve conter entre 10 e 13 dígitos."
  });

export const checkoutCustomerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  document: z.preprocess(
    (value) => (value === "" ? undefined : value),
    customerDocumentSchema.optional()
  ),
  phone: z.preprocess(
    (value) => (value === "" ? undefined : value),
    customerPhoneSchema.optional()
  )
});

export interface CustomerPaymentRequirements {
  provider: PaymentProviderName;
  method: PaymentMethod;
}

export function customerForPaymentSchema(requirements: CustomerPaymentRequirements) {
  return checkoutCustomerSchema.superRefine((customer, context) => {
    if (
      (requirements.provider === "asaas" || requirements.method === "credit_card") &&
      !customer.document
    ) {
      context.addIssue({
        code: "custom",
        path: ["document"],
        message: "Documento é obrigatório para este pagamento."
      });
    }

    if (
      requirements.provider === "asaas" &&
      requirements.method === "credit_card" &&
      !customer.phone
    ) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Telefone é obrigatório para cartão via Asaas."
      });
    }
  });
}

export type CheckoutCustomer = z.infer<typeof checkoutCustomerSchema>;
