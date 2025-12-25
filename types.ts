
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
  address: {
    street: string;
    number: string;
    neighborhood: string;
    reference: string;
  };
  flyerUrl?: string;
}

export interface ProductOffer {
  id: string;
  baseProductId: string;
  name: string;
  category: string;
  storeId: string;
  storeName: string;
  storeColor: string;
  price: number;
  originalPrice: number;
  unit: string;
  imageUrl: string;
  isPromo: boolean;
  updatedAt?: string;
}

export interface CartItem extends ProductOffer {
  quantity: number;
}

export enum AppView {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  CART = 'CART',
  STORES = 'STORES',
  STORE_DETAIL = 'STORE_DETAIL',
  NOTIFICATIONS = 'NOTIFICATIONS'
}

export interface CartOptimization {
  storeId: string;
  storeName: string;
  totalPrice: number;
  missingItems: number;
  items: CartItem[];
}

export interface AppNotification {
  id: string;
  type: 'PROMO' | 'PRICE_DROP' | 'BETTER_DEAL';
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  relatedProductId?: string;
  relatedSearchTerm?: string;
  discountPercentage?: number;
}