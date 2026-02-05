// types/ecommerce.ts

export enum ProductKind {
  SIMPLE = 'SIMPLE',
  CONFIGURABLE = 'CONFIGURABLE',
  BUNDLE = 'BUNDLE'
}

export enum CampaignType {
  WEEKLY = 'WEEKLY',
  DATE_RANGE = 'DATE_RANGE'
}

export interface Product {
  id: string;
  name: string;
  kind: ProductKind;
  priceOnline?: number;
  priceFixed?: number;
  promoPrice?: number;
  image?: string;
  // ... outros campos
}

export interface BundleItem {
  productId: string;
  quantity: number;
  product?: Product; // Para exibir nome/preço na lista
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  dayOfWeek?: number;
  bannerDesktop?: string;
  themeColor?: string;
  active: boolean;
}