// WooCommerce Store API v1 types

export interface WCImage {
  id: number;
  src: string;
  thumbnail: string;
  srcset: string;
  sizes: string;
  name: string;
  alt: string;
}

export interface WCPrice {
  price: string;           // formatted, e.g. "$49.00"
  regular_price: string;
  sale_price: string;
  price_range: null | { min_amount: string; max_amount: string };
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface WCProductCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
  image: WCImage | null;
  link: string;
}

export interface WCProductAttribute {
  id: number;
  name: string;
  taxonomy: string;
  has_variations: boolean;
  terms: { id: number; name: string; slug: string; default: boolean }[];
}

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  parent: number;
  type: string;          // "simple" | "variable" | "grouped"
  variation: string;
  permalink: string;
  sku: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: WCPrice;
  price_html: string;
  average_rating: string;   // "4.5"
  review_count: number;
  images: WCImage[];
  categories: Pick<WCProductCategory, 'id' | 'name' | 'slug'>[];
  tags: { id: number; name: string; slug: string }[];
  attributes: WCProductAttribute[];
  variations: number[];
  has_options: boolean;
  is_purchasable: boolean;
  is_in_stock: boolean;
  is_on_backorder: boolean;
  low_stock_remaining: number | null;
  sold_individually: boolean;
  quantity_limit: number;
  add_to_cart: {
    text: string;
    description: string;
    url: string;
    minimum: number;
    maximum: number;
    multiple_of: number;
  };
}

export interface WCProductsParams {
  per_page?: number;
  page?: number;
  category?: string;   // comma-separated slugs or IDs
  tag?: string;
  on_sale?: boolean;
  order?: 'asc' | 'desc';
  orderby?: 'price' | 'popularity' | 'rating' | 'date' | 'id' | 'include' | 'title' | 'slug';
  search?: string;
  min_price?: string;
  max_price?: string;
}
