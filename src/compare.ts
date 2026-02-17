import { Vendor, SingleStoreResult, SplitResult, ComparisonResult } from "./types";

function normalize(name: string): string {
  return name.toLowerCase().trim();
}

function findInCatalog(vendor: Vendor, productName: string): { price: number } | null {
  const normalized = normalize(productName);
  const item = vendor.catalog.find(
    (p) => normalize(p.productName) === normalized && p.inStock
  );
  return item ? { price: item.price } : null;
}

export function findBestSingleStore(
  shoppingList: string[],
  vendors: Vendor[]
): SingleStoreResult {
  let best: SingleStoreResult | null = null;

  for (const vendor of vendors) {
    const items: { product: string; price: number }[] = [];
    const missing: string[] = [];

    for (const product of shoppingList) {
      const found = findInCatalog(vendor, product);
      if (found) {
        items.push({ product, price: found.price });
      } else {
        missing.push(product);
      }
    }

    const total = items.reduce((sum, i) => sum + i.price, 0);
    const result: SingleStoreResult = { vendor: vendor.name, total, items, missing };

    if (
      !best ||
      missing.length < best.missing.length ||
      (missing.length === best.missing.length && total < best.total)
    ) {
      best = result;
    }
  }

  return best!;
}

export function findBestSplit(
  shoppingList: string[],
  vendors: Vendor[]
): SplitResult {
  const items: { product: string; vendor: string; price: number }[] = [];
  const missing: string[] = [];

  for (const product of shoppingList) {
    let cheapest: { vendor: string; price: number } | null = null;

    for (const vendor of vendors) {
      const found = findInCatalog(vendor, product);
      if (found && (!cheapest || found.price < cheapest.price)) {
        cheapest = { vendor: vendor.name, price: found.price };
      }
    }

    if (cheapest) {
      items.push({ product, vendor: cheapest.vendor, price: cheapest.price });
    } else {
      missing.push(product);
    }
  }

  const total = items.reduce((sum, i) => sum + i.price, 0);
  return { total, items, missing };
}

export function compare(shoppingList: string[], vendors: Vendor[]): ComparisonResult {
  return {
    bestSingleStore: findBestSingleStore(shoppingList, vendors),
    bestSplit: findBestSplit(shoppingList, vendors),
  };
}
