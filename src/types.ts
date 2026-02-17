export interface Product {
  name: string;
  category?: string;
}

export interface VendorProduct {
  productName: string;
  price: number;
  inStock: boolean;
}

export interface Vendor {
  name: string;
  catalog: VendorProduct[];
}

export interface SingleStoreResult {
  vendor: string;
  total: number;
  items: { product: string; price: number }[];
  missing: string[];
}

export interface SplitResult {
  total: number;
  items: { product: string; vendor: string; price: number }[];
  missing: string[];
}

export interface ComparisonResult {
  bestSingleStore: SingleStoreResult;
  bestSplit: SplitResult;
}
