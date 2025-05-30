export interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: string;
  description: string;
  gender: 'men' | 'women' | 'unisex';
  size: string[];
  color: string;
  collection?: string;
  material?: string;
  care?: string[];
  features?: string[];
  fit?: string;
  occasion?: string;
  season?: string;
  brand?: string;
  sku?: string;
  stock?: number;
  whatsapp?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CheckoutFormData {
  email: string;
  name: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  deliveryMethod: 'pickup' | 'delivery';
}

export interface Filters {
  gender: string[];
  category: string[];
  color: string[];
  priceRange: [number, number];
  collection: string[];
}

export type Page = 'home' | 'about' | 'contact' | 'gallery' | 'men' | 'women' | 'items';