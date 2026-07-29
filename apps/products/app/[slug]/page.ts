import type { Offer, Product } from "@kiwifyclone/schemas";
import { renderPublicOffer } from "../../components/public-offer.js";

export interface PublicProductPageModel {
  product: Product;
  offers: Offer[];
}

export function renderPublicProductPage(model: PublicProductPageModel): string {
  const activeOffers = model.offers.filter((offer) => offer.status === "active");

  if (model.product.status !== "active" || activeOffers.length === 0) {
    return "Produto indisponível";
  }

  return [
    model.product.title,
    model.product.description,
    model.product.imageUrl ?? "",
    ...activeOffers.map((offer) => renderPublicOffer(offer))
  ]
    .filter(Boolean)
    .join("\n");
}
