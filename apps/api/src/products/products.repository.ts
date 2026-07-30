import type { Offer, Product, ProductLesson, ProductModule } from "@kiwifyclone/schemas";

export interface ProductRecordSet {
  products: Product[];
  modules: ProductModule[];
  lessons: ProductLesson[];
  offers: Offer[];
}

export class ProductsRepository {
  private readonly records: ProductRecordSet;

  constructor(records: ProductRecordSet = createEmptyProductRecordSet()) {
    this.records = records;
  }

  reset(records: ProductRecordSet = createEmptyProductRecordSet()): void {
    this.records.products.splice(0, this.records.products.length, ...records.products);
    this.records.modules.splice(0, this.records.modules.length, ...records.modules);
    this.records.lessons.splice(0, this.records.lessons.length, ...records.lessons);
    this.records.offers.splice(0, this.records.offers.length, ...records.offers);
  }

  snapshot(): ProductRecordSet {
    return this.records;
  }
}

export function createEmptyProductRecordSet(): ProductRecordSet {
  return {
    products: [],
    modules: [],
    lessons: [],
    offers: []
  };
}

export const productsRepository = new ProductsRepository();
