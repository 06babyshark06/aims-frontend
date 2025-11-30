// types/api.ts

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
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