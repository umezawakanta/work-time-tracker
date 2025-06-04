// 商品関連の型定義
export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  images: ProductImage[];
  category: ProductCategory;
  tags: string[];
  sku: string;
  stock: number;
  isActive: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  attributes: ProductAttribute[];
  ratings: ProductRating[];
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
  order: number;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select';
}

export interface ProductRating {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// カート関連の型定義
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedAttributes?: Record<string, string>;
  addedAt: Date;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  updatedAt: Date;
}

// 注文関連の型定義
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  trackingNumber?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedAttributes?: Record<string, string>;
  total: number;
}

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentMethod {
  type:
    | 'credit_card'
    | 'bank_transfer'
    | 'paypal'
    | 'apple_pay'
    | 'google_pay'
    | 'cash_on_delivery';
  lastFour?: string;
  expiryDate?: string;
  cardholderName?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type ShippingStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'failed';

// 配送関連の型定義
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  isActive: boolean;
}

// クーポン関連の型定義
export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startsAt?: Date;
  expiresAt?: Date;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

// 検索・フィルタリング関連の型定義
export interface ProductFilter {
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  inStock?: boolean;
  rating?: number;
  attributes?: Record<string, string[]>;
}

export interface ProductSearchParams {
  query?: string;
  category?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  filters?: ProductFilter;
}

export interface ProductSearchResult {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  facets: {
    categories: Array<{ id: string; name: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };
}

// 在庫管理関連の型定義
export interface InventoryItem {
  id: string;
  productId: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  location?: string;
  lastUpdated: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string;
  createdAt: Date;
  createdBy: string;
}

// ウィッシュリスト関連の型定義
export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: Date;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  updatedAt: Date;
}

// レビュー関連の型定義
export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  reportCount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// 店舗設定関連の型定義
export interface StoreSettings {
  id: string;
  name: string;
  description: string;
  logo?: string;
  favicon?: string;
  currency: string;
  taxRate: number;
  freeShippingThreshold?: number;
  contactEmail: string;
  supportPhone?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  policies: {
    shipping?: string;
    returns?: string;
    privacy?: string;
    terms?: string;
  };
  features: {
    reviewsEnabled: boolean;
    wishlistEnabled: boolean;
    guestCheckoutEnabled: boolean;
    inventoryTracking: boolean;
  };
}
