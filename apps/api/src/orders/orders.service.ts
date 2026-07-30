import {
  createOrderInputSchema,
  type CheckoutCustomer,
  type CreateOrderInput,
  type Order,
  type OrderItem
} from "@kiwifyclone/schemas";
import { offersService } from "../offers/offers.service.js";
import { productsRepository } from "../products/products.repository.js";
import { ordersRepository, type CustomerRecord } from "./orders.repository.js";

let nextOrderId = 1;

function id(prefix: string): string {
  return `${prefix}_${nextOrderId++}`;
}

function now(): string {
  return new Date().toISOString();
}

export class CheckoutDomainError extends Error {
  constructor(
    public readonly code:
      | "checkout_already_paid"
      | "checkout_payment_exists"
      | "offer_not_purchasable"
      | "order_not_found"
      | "payment_method_not_allowed"
      | "product_not_found"
  ) {
    super(code);
    this.name = "CheckoutDomainError";
  }
}

export class OrdersService {
  startCheckout(offerId: string) {
    const offer = offersService.getOffer(offerId);

    if (!offer || offer.status !== "active") {
      throw new CheckoutDomainError("offer_not_purchasable");
    }

    const product = productsRepository
      .snapshot()
      .products.find((item) => item.id === offer.productId && item.status === "active");

    if (!product) {
      throw new CheckoutDomainError("offer_not_purchasable");
    }

    return { product, offer };
  }

  createOrder(input: CreateOrderInput): { order: Order; item: OrderItem } {
    const value = createOrderInputSchema.parse(input);
    const { product, offer } = this.startCheckout(value.offerId);
    const customer = this.findOrCreateCustomer(value.customer);
    const timestamp = now();
    const order: Order = {
      id: id("order"),
      customerId: customer.id,
      status: "pending",
      totalCents: offer.priceCents,
      currency: offer.currency,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    const item: OrderItem = {
      id: id("order_item"),
      orderId: order.id,
      offerId: offer.id,
      productId: product.id,
      titleSnapshot: `${product.title} — ${offer.name}`,
      priceCents: offer.priceCents,
      currency: offer.currency
    };

    ordersRepository.snapshot().orders.push(order);
    ordersRepository.snapshot().orderItems.push(item);

    return { order, item };
  }

  getOrder(orderId: string): Order {
    const order = ordersRepository.snapshot().orders.find((item) => item.id === orderId);

    if (!order) {
      throw new CheckoutDomainError("order_not_found");
    }

    return order;
  }

  getOrderContext(orderId: string) {
    const order = this.getOrder(orderId);
    const item = ordersRepository.snapshot().orderItems.find((candidate) => candidate.orderId === orderId);
    const customer = ordersRepository.snapshot().customers.find((candidate) => candidate.id === order.customerId);

    if (!item || !customer) {
      throw new CheckoutDomainError("order_not_found");
    }

    return { order, item, customer };
  }

  getOrderStatus(orderId: string) {
    const order = this.getOrder(orderId);
    const payment = ordersRepository.snapshot().payments.find((item) => item.orderId === orderId);

    return {
      orderId: order.id,
      orderStatus: order.status,
      paymentId: payment?.id,
      paymentStatus: payment?.status
    };
  }

  private findOrCreateCustomer(input: CheckoutCustomer): CustomerRecord {
    const records = ordersRepository.snapshot();
    const existing = records.customers.find((customer) => customer.email === input.email);
    const timestamp = now();

    if (existing) {
      Object.assign(existing, input, { updatedAt: timestamp });
      return existing;
    }

    const customer: CustomerRecord = {
      id: id("customer"),
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    records.customers.push(customer);
    return customer;
  }
}

export const ordersService = new OrdersService();
