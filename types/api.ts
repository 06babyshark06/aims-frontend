// types/api.ts

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface Product {
  id: number;
  barcode: string;
  title: string;
  category: string;
  description: string;
  currentPrice: number;
  originalValue: number;
  quantity: number; // Stock
  status: string;
  productType: 'book' | 'cd' | 'dvd' | 'lp';
  // Thông số vật lý
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page
}

export interface CartItem {
  id: number;
  productId: number;
  productTitle: string;
  productType: string;
  quantity: number;
  price: number;
  subtotal: number;
}