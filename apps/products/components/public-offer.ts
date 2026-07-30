import type { Offer } from "@kiwifyclone/schemas";

export function formatPrice(offer: Offer): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: offer.currency
  }).format(offer.priceCents / 100);
}

export function renderPublicOffer(offer: Offer): string {
  return `${offer.name} - ${formatPrice(offer)} - Comprar`;
}
