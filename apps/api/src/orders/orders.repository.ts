import type {
  CheckoutCustomer,
  Order,
  OrderItem,
  Payment,
  PaymentProviderName
} from "@kiwifyclone/schemas";

export interface CustomerRecord extends CheckoutCustomer {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderCustomerRecord {
  id: string;
  customerId: string;
  provider: PaymentProviderName;
  externalCustomerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderChargeRecord {
  id: string;
  paymentId: string;
  provider: PaymentProviderName;
  externalChargeId: string;
  externalStatus: string;
  pixQrCode?: string;
  pixPayload?: string;
  safeMetadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CommerceRecordSet {
  customers: CustomerRecord[];
  orders: Order[];
  orderItems: OrderItem[];
  payments: Payment[];
  providerCustomers: ProviderCustomerRecord[];
  providerCharges: ProviderChargeRecord[];
}

function emptyRecords(): CommerceRecordSet {
  return {
    customers: [],
    orders: [],
    orderItems: [],
    payments: [],
    providerCustomers: [],
    providerCharges: []
  };
}

export class OrdersRepository {
  private readonly records = emptyRecords();

  snapshot(): CommerceRecordSet {
    return this.records;
  }

  reset(): void {
    const empty = emptyRecords();

    for (const key of Object.keys(empty) as Array<keyof CommerceRecordSet>) {
      this.records[key].splice(0);
    }
  }

  safeSnapshot(): unknown {
    return JSON.parse(JSON.stringify(this.records)) as unknown;
  }
}

export const ordersRepository = new OrdersRepository();
