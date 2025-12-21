export interface ProductBase {
  id: string;
  name: string;
  category: string;
  unit: string;
  basePrice: number;
  imageUrl?: string;
}

export interface Store {
  id: string;
  name: string;
  color: string;
  logo: string;
  distance: string;
}

export interface ProductOffer {
  id: string;
  baseProductId: string;
  name: string;
  category: string;
  storeId: string;
  storeName: string;
  storeColor: string;
  price: number; // Preço atual (promocional ou normal)
  originalPrice: number; // Preço sem desconto
  unit: string;
  imageUrl: string;
  isPromo: boolean;
}

export interface CartItem extends ProductOffer {
  quantity: number;
}

export enum AppView {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  CART = 'CART',
}

export interface CartOptimization {
  storeId: string;
  storeName: string;
  totalPrice: number;
  missingItems: number;
  items: CartItem[];
}