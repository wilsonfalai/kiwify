import type { Offer, Product, ProductLesson, ProductModule } from "@kiwifyclone/schemas";

export interface AdminProductsPageModel {
  products: Product[];
  modules: ProductModule[];
  lessons: ProductLesson[];
  offers: Offer[];
}

export function renderAdminProductsPage(model: AdminProductsPageModel): string {
  const productRows = model.products
    .map((product) => {
      const offerCount = model.offers.filter((offer) => offer.productId === product.id).length;
      const moduleCount = model.modules.filter((module) => module.productId === product.id).length;

      return `${product.title} (${product.status}) - ${moduleCount} módulos - ${offerCount} ofertas`;
    })
    .join("\n");

  return ["Produtos", "Criar produto", "Criar módulos", "Criar aulas", "Criar oferta", productRows].filter(Boolean).join("\n");
}
