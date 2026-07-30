import {
  createProductLessonSchema,
  createProductModuleSchema,
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type CreateProductLessonInput,
  type CreateProductModuleInput,
  type Product,
  type ProductLesson,
  type ProductModule,
  type UpdateProductInput
} from "@kiwifyclone/schemas";
import { productsRepository } from "./products.repository.js";

let nextId = 1;

function id(prefix: string): string {
  return `${prefix}_${nextId++}`;
}

function now(): string {
  return new Date().toISOString();
}

export class ProductsService {
  listForProducer(producerId: string): Product[] {
    return productsRepository.snapshot().products.filter((product) => product.producerId === producerId);
  }

  listAll(): Product[] {
    return [...productsRepository.snapshot().products];
  }

  createProduct(producerId: string, input: CreateProductInput): Product {
    const value = createProductSchema.parse(input);
    const timestamp = now();

    if (productsRepository.snapshot().products.some((product) => product.slug === value.slug)) {
      throw new Error("product_slug_already_exists");
    }

    const product: Product = {
      id: id("product"),
      producerId,
      title: value.title,
      slug: value.slug,
      description: value.description,
      imageUrl: value.imageUrl,
      status: value.status,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    productsRepository.snapshot().products.push(product);
    return product;
  }

  updateProduct(producerId: string, productId: string, input: UpdateProductInput): Product {
    const value = updateProductSchema.parse(input);
    const product = this.getOwnedProduct(producerId, productId);

    if (value.slug && productsRepository.snapshot().products.some((item) => item.slug === value.slug && item.id !== productId)) {
      throw new Error("product_slug_already_exists");
    }

    Object.assign(product, value, { updatedAt: now() });
    return product;
  }

  createModule(producerId: string, productId: string, input: CreateProductModuleInput): ProductModule {
    this.getOwnedProduct(producerId, productId);
    const value = createProductModuleSchema.parse(input);

    if (
      productsRepository
        .snapshot()
        .modules.some((module) => module.productId === productId && module.position === value.position)
    ) {
      throw new Error("module_position_already_exists");
    }

    const timestamp = now();
    const module: ProductModule = {
      id: id("module"),
      productId,
      title: value.title,
      description: value.description,
      position: value.position,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    productsRepository.snapshot().modules.push(module);
    return module;
  }

  createLesson(producerId: string, moduleId: string, input: CreateProductLessonInput): ProductLesson {
    const module = productsRepository.snapshot().modules.find((item) => item.id === moduleId);

    if (!module) {
      throw new Error("module_not_found");
    }

    this.getOwnedProduct(producerId, module.productId);
    const value = createProductLessonSchema.parse(input);

    if (
      productsRepository
        .snapshot()
        .lessons.some((lesson) => lesson.moduleId === moduleId && lesson.position === value.position)
    ) {
      throw new Error("lesson_position_already_exists");
    }

    const timestamp = now();
    const lesson: ProductLesson = {
      id: id("lesson"),
      moduleId,
      title: value.title,
      description: value.description,
      contentType: value.contentType,
      textContent: value.textContent,
      videoUrl: value.videoUrl,
      position: value.position,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    productsRepository.snapshot().lessons.push(lesson);
    return lesson;
  }

  getOwnedProduct(producerId: string, productId: string): Product {
    const product = productsRepository
      .snapshot()
      .products.find((item) => item.id === productId && item.producerId === producerId);

    if (!product) {
      throw new Error("product_not_found");
    }

    return product;
  }
}

export const productsService = new ProductsService();
