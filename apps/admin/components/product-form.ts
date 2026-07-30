import type { CreateOfferInput, CreateProductInput, CreateProductLessonInput, CreateProductModuleInput } from "@kiwifyclone/schemas";

export interface AdminProductDraft {
  product: CreateProductInput;
  modules: CreateProductModuleInput[];
  lessons: CreateProductLessonInput[];
  offers: CreateOfferInput[];
}

export function createDefaultProductDraft(): AdminProductDraft {
  return {
    product: {
      title: "",
      slug: "",
      description: "",
      status: "draft"
    },
    modules: [],
    lessons: [],
    offers: []
  };
}

export function validateProductDraft(draft: AdminProductDraft): string[] {
  const errors: string[] = [];

  if (!draft.product.title) {
    errors.push("product.title_required");
  }

  if (!draft.product.slug) {
    errors.push("product.slug_required");
  }

  if (draft.offers.some((offer) => offer.priceCents <= 0)) {
    errors.push("offer.price_required");
  }

  return errors;
}
