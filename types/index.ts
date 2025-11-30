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

export interface CreateProductDTO {
  title: string;
  barcode: string;
  category: string;
  productType: 'BOOK' | 'CD' | 'DVD' | 'NEWSPAPER';
  originalValue: number;
  currentPrice: number;
  quantity: number;
  weight: number;
  height: number;
  width: number;
  length: number;
  description: string;
  isNew?: boolean;
  primaryColor?: string;
  returnCondition?: string;
  
  // Fields cho Book
  authors?: string;
  coverType?: string;
  publisher?: string;
  publicationDate?: string;
  numberOfPages?: number;
  language?: string;
  genre?: string;

  // Fields cho CD
  artists?: string;
  recordLabel?: string;
  releaseDate?: string;
  tracks?: { 
      title: string; 
      length: number; 
      trackNumber: number;
  }[];

  // Fields cho DVD
  discType?: string;
  director?: string;
  runtime?: number;
  studio?: string;
  subtitles?: string;

  // Fields cho Newspaper
  editorInChief?: string;
  issueNumber?: string;
  publicationFrequency?: string;
  issn?: string;
  sections?: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  empty: boolean;
}

export interface ApiResponse<T> {
  errorCode: string;
  message: string;
  data: T;
}

export interface Track {
  id?: number;
  title: string;
  length: number;
  trackNumber: number;
}

export interface Product {
  id: number;
  title: string;
  barcode: string;
  category: string;
  productType?: string;
  description: string;
  originalValue: number;
  currentPrice: number;
  quantity: number;
  status: string;
  isNew: boolean;
  primaryColor?: string;
  returnCondition?: string;
  image?: string;
  
  weight: number;
  height: number;
  width: number;
  length: number;

  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;

  // --- RIÊNG (Sách / Báo) ---
  authors?: string;
  publisher?: string;
  coverType?: string;
  publicationDate?: string;
  numberOfPages?: number;
  language?: string;
  
  // --- RIÊNG (Báo) ---
  editorInChief?: string;
  issueNumber?: string;
  publicationFrequency?: string;
  issn?: string;
  sections?: string;

  // --- RIÊNG (CD / DVD) ---
  genre?: string;
  releaseDate?: string;
  
  // --- RIÊNG (CD) ---
  artists?: string;
  recordLabel?: string;
  tracks?: Track[];

  // --- RIÊNG (DVD) ---
  director?: string;
  discType?: string;
  studio?: string;
  subtitles?: string;
  runtime?: number;
}