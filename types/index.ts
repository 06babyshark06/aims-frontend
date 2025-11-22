export interface Product {
  id: number;
  barcode: string;
  title: string;
  category: string;
  currentPrice: number;
  originalValue: number;
  quantity: number;
  status: string;
  productType: string;
  description?: string;
}

export interface CartItem {
  productId: number;
  productTitle: string;
  productType: string;
  quantity: number;
  price: number;
  subtotal: number;
  availableStock: number;
  available?: boolean;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
  totalWithVAT: number;
  totalWeight: number;
}

export interface DeliveryInfo {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
}

export interface OrderCalculation {
  items: CartItem[];
  subtotal: number;
  vatAmount: number;
  shippingFee: number;
  totalAmount: number;
  totalWithVAT: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}