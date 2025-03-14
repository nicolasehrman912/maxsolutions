export interface Family {
  id: string;
  description: string;
  icon_url: string;
  url?: string;
  meta?: string;
  title: string;
  discount?: boolean;
}

export interface Image {
  image_url: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  general_description: string;
  element_description_1: string;
  element_description_2: string;
  element_description_3: string;
  stock: number;
  size: string;
  color: string;
}

export interface GenericProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  families: Family[];
  images: Image[];
  products: ProductVariant[];
  stock: number;
}

export interface FamiliesResponse {
  families: Family[];
}

export interface GenericProductsResponse {
  total_pages: number;
  count: number;
  generic_products: GenericProduct[];
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  order?: {
    price?: 'asc' | 'desc';
  };
  families?: string[];
  stock?: number;
  name?: string;
  ids?: number[];
}

// CDO Promocionales API Types
export interface CDOCategory {
  id: number;
  name: string;
}

export interface CDOPacking {
  width: string;
  height: string;
  depth: string;
  volume: string;
  quantity: number;
  weight: string;
}

export interface CDOIcon {
  id: number;
  label: string;
  short_name: string;
  picture: string;
}

export interface CDOColor {
  id: number;
  name: string;
  hex_code: string;
  picture: string;
}

export interface CDOPicture {
  small: string;
  medium: string;
  original: string;
}

export interface CDOVariant {
  id: number;
  novedad: boolean;
  stock_available: number;
  stock_existent: number;
  list_price: string;
  net_price: string;
  picture: CDOPicture;
  detail_picture: CDOPicture;
  color: CDOColor;
}

export interface CDOProduct {
  id: number;
  code: string;
  name: string;
  description: string;
  categories: CDOCategory[];
  packing: CDOPacking;
  icons: CDOIcon[];
  variants: CDOVariant[];
  source: 'cdo'; // To differentiate from Zecat products
}

export interface CDOProductsResponse {
  total_pages?: number;
  current_page?: number;
  products: CDOProduct[];
}

export interface CDOProductFilters {
  page_size?: number;
  page_number?: number;
  category_id?: number;
  search?: string;
} 