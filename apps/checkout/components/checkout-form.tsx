"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  checkoutFormSchema,
  type CheckoutFormData,
  type CheckoutFormInput
} from "@kiwifyclone/schemas";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface CheckoutFormProps {
  offerId: string;
}

interface CheckoutOffer {
  product: {
    title: string;
    description: string;
  };
  offer: {
    name: string;
    priceCents: number;
    currency: string;
    allowedPaymentMethods: Array<"pix" | "credit_card">;
  };
}

interface CheckoutResult {
  orderId: string;
  paymentId: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: "pix" | "credit_card";
  pix?: {
    qrCode?: string;
    payload?: string;
    expirationDate?: string;
  };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatPrice(priceCents: number, currency: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency
  }).format(priceCents / 100);
}

async function jsonRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(body.error ?? "Não foi possível concluir o checkout.");
  }

  return body;
}

export function CheckoutForm({ offerId }: CheckoutFormProps) {
  const [offer, setOffer] = useState<CheckoutOffer | null>(null);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CheckoutFormInput, unknown, CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customer: {
        name: "",
        email: "",
        document: "",
        phone: ""
      },
      paymentMethod: "pix",
      card: {
        number: "",
        holderName: "",
        expiryMonth: "",
        expiryYear: "",
        ccv: "",
        postalCode: "",
        addressNumber: "",
        addressComplement: ""
      }
    }
  });
  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    let active = true;

    jsonRequest<CheckoutOffer>(`${apiUrl}/checkout/offers/${encodeURIComponent(offerId)}`)
      .then((value) => {
        if (active) {
          setOffer(value);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "Oferta indisponível.");
        }
      });

    return () => {
      active = false;
    };
  }, [offerId]);

  async function submit(data: CheckoutFormData) {
    setSubmitError("");
    setResult(null);

    try {
      const created = await jsonRequest<{ order: { id: string } }>(
        `${apiUrl}/checkout/orders`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            offerId,
            customer: data.customer
          })
        }
      );
      const endpoint =
        data.paymentMethod === "pix"
          ? "pix"
          : "credit-card";
      const paymentBody =
        data.paymentMethod === "credit_card"
          ? JSON.stringify({ card: data.card })
          : undefined;
      const payment = await jsonRequest<CheckoutResult>(
        `${apiUrl}/checkout/orders/${created.order.id}/payments/${endpoint}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: paymentBody
        }
      );

      setResult(payment);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Não foi possível concluir o pagamento."
      );
    }
  }

  if (loadError) {
    return (
      <section className="checkout-state checkout-state--error">
        <p className="eyebrow">Oferta indisponível</p>
        <h1>Este checkout não pode ser iniciado.</h1>
        <p>{loadError}</p>
      </section>
    );
  }

  if (!offer) {
    return (
      <section className="checkout-state" aria-live="polite">
        <span className="loading-mark" />
        <p>Preparando checkout…</p>
      </section>
    );
  }

  return (
    <div className="checkout-grid">
      <aside className="order-summary">
        <p className="eyebrow">Seu pedido</p>
        <h1>{offer.product.title}</h1>
        <p className="offer-name">{offer.offer.name}</p>
        <div className="price">
          <span>Total</span>
          <strong>{formatPrice(offer.offer.priceCents, offer.offer.currency)}</strong>
        </div>
        <p className="summary-note">{offer.product.description}</p>
      </aside>

      <section className="payment-workspace">
        {result ? (
          <div className="payment-result" aria-live="polite">
            <p className="eyebrow">Pedido confirmado</p>
            <h2>
              {result.paymentStatus === "approved"
                ? "Pagamento aprovado."
                : "Agora é só concluir o pagamento."}
            </h2>
            <dl>
              <div>
                <dt>Pedido</dt>
                <dd>{result.orderId}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{result.paymentStatus}</dd>
              </div>
            </dl>
            {result.pix?.payload ? (
              <div className="pix-instructions">
                <span>Pix copia e cola</span>
                <code>{result.pix.payload}</code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(result.pix?.payload ?? "")}
                >
                  Copiar código Pix
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <form onSubmit={handleSubmit(submit)} noValidate>
            <div className="form-heading">
              <p className="eyebrow">Dados de pagamento</p>
              <h2>Finalize sua compra</h2>
              <p>Informe os dados usados na cobrança e escolha como pagar.</p>
            </div>

            <fieldset>
              <legend>Comprador</legend>
              <label className="field field--wide">
                <span>Nome completo</span>
                <input autoComplete="name" {...register("customer.name")} />
                <small>{errors.customer?.name?.message}</small>
              </label>
              <label className="field field--wide">
                <span>E-mail</span>
                <input type="email" autoComplete="email" {...register("customer.email")} />
                <small>{errors.customer?.email?.message}</small>
              </label>
              <label className="field">
                <span>CPF ou CNPJ</span>
                <input inputMode="numeric" {...register("customer.document")} />
                <small>{errors.customer?.document?.message}</small>
              </label>
              <label className="field">
                <span>Telefone</span>
                <input type="tel" autoComplete="tel" {...register("customer.phone")} />
                <small>{errors.customer?.phone?.message}</small>
              </label>
            </fieldset>

            <fieldset>
              <legend>Forma de pagamento</legend>
              <div className="method-switch">
                {offer.offer.allowedPaymentMethods.includes("pix") ? (
                  <label>
                    <input type="radio" value="pix" {...register("paymentMethod")} />
                    <span>
                      <strong>Pix</strong>
                      <small>Confirmação rápida</small>
                    </span>
                  </label>
                ) : null}
                {offer.offer.allowedPaymentMethods.includes("credit_card") ? (
                  <label>
                    <input
                      type="radio"
                      value="credit_card"
                      {...register("paymentMethod")}
                    />
                    <span>
                      <strong>Cartão</strong>
                      <small>Processamento imediato</small>
                    </span>
                  </label>
                ) : null}
              </div>
            </fieldset>

            {paymentMethod === "credit_card" ? (
              <fieldset className="card-fields">
                <legend>Cartão de crédito</legend>
                <label className="field field--wide">
                  <span>Número do cartão</span>
                  <input
                    inputMode="numeric"
                    autoComplete="cc-number"
                    {...register("card.number")}
                  />
                  <small>{errors.card?.number?.message}</small>
                </label>
                <label className="field field--wide">
                  <span>Nome impresso</span>
                  <input autoComplete="cc-name" {...register("card.holderName")} />
                  <small>{errors.card?.holderName?.message}</small>
                </label>
                <label className="field">
                  <span>Validade</span>
                  <div className="field-pair">
                    <input
                      placeholder="MM"
                      inputMode="numeric"
                      autoComplete="cc-exp-month"
                      {...register("card.expiryMonth")}
                    />
                    <input
                      placeholder="AAAA"
                      inputMode="numeric"
                      autoComplete="cc-exp-year"
                      {...register("card.expiryYear")}
                    />
                  </div>
                  <small>
                    {errors.card?.expiryMonth?.message ?? errors.card?.expiryYear?.message}
                  </small>
                </label>
                <label className="field">
                  <span>CVV</span>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    {...register("card.ccv")}
                  />
                  <small>{errors.card?.ccv?.message}</small>
                </label>
                <label className="field">
                  <span>CEP</span>
                  <input
                    inputMode="numeric"
                    autoComplete="postal-code"
                    {...register("card.postalCode")}
                  />
                  <small>{errors.card?.postalCode?.message}</small>
                </label>
                <label className="field">
                  <span>Número</span>
                  <input autoComplete="address-line2" {...register("card.addressNumber")} />
                  <small>{errors.card?.addressNumber?.message}</small>
                </label>
              </fieldset>
            ) : null}

            {submitError ? (
              <p className="submit-error" role="alert">
                {submitError}
              </p>
            ) : null}

            <button className="submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Processando…"
                : paymentMethod === "pix"
                  ? "Gerar cobrança Pix"
                  : "Pagar com cartão"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
