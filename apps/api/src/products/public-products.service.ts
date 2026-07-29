import type { Offer, Product } from "@kiwifyclone/schemas";
import { productsRepository } from "./products.repository.js";

export interface PublicProductView {
  product: Product;
  offers: Offer[];
}

export class PublicProductsService {
  getActiveProductBySlug(slug: string): PublicProductView | null {
    const product = productsRepository
      .snapshot()
      .products.find((item) => item.slug === slug && item.status === "active");

    if (!product) {
      return null;
    }

    const offers = productsRepository
      .snapshot()
      .offers.filter((offer) => offer.productId === product.id && offer.status === "active");

    return {
      product,
      offers
    };
  }
}

export const publicProductsService = new PublicProductsService();
