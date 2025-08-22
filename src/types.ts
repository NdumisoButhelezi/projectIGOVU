export interface Product {
  id: string; // changed from number to string
  name: string;
  price: number;
  images?: string[];
  category: string;
  description?: string;
  gender?: string;
  size?: string[]; // or sizes?: string[]
  color?: string;
  collection?: string;
  material?: string;
  features?: string[];
  care?: string[];
  whatsapp?: string;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  weight_kg?: number;
  stock?: number;
  [key: string]: any;
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
  gender?: string[];
  category?: string | string[];
  color?: string[];
  priceRange?: [number, number];
  collection?: string[];
  size?: string;
  sortBy?: string;
}

export type Page = 'home' | 'about' | 'contact' | 'gallery' | 'men' | 'women' | 'items';