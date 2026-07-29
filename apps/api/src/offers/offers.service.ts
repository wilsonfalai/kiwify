import { createOfferSchema, type CreateOfferInput, type Offer, type PaymentMethod } from "@kiwifyclone/schemas";
import { productsRepository } from "../products/products.repository.js";
import { productsService } from "../products/products.service.js";

let nextOfferId = 1;

function id(): string {
  return `offer_${nextOfferId++}`;
}

function now(): string {
  return new Date().toISOString();
}

export class OffersService {
  createOffer(producerId: string, productId: string, input: CreateOfferInput): Offer {
    productsService.getOwnedProduct(producerId, productId);
    const value = createOfferSchema.parse(input);
    const timestamp = now();
    const offer: Offer = {
      id: id(),
      productId,
      name: value.name,
      priceCents: value.priceCents,
      currency: value.currency,
      status: value.status,
      allowedPaymentMethods: value.allowedPaymentMethods,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    productsRepository.snapshot().offers.push(offer);
    return offer;
  }

  getOffer(offerId: string): Offer | null {
    return productsRepository.snapshot().offers.find((offer) => offer.id === offerId) ?? null;
  }

  ensureOfferCanBePurchased(offerId: string, method: PaymentMethod): Offer {
    const offer = this.getOffer(offerId);

    if (!offer || offer.status !== "active") {
      throw new Error("offer_not_purchasable");
    }

    const product = productsRepository.snapshot().products.find((item) => item.id === offer.productId);

    if (!product || product.status !== "active") {
      throw new Error("offer_not_purchasable");
    }

    if (!offer.allowedPaymentMethods.includes(method)) {
      throw new Error("payment_method_not_allowed");
    }

    return offer;
  }
}

export const offersService = new OffersService();
