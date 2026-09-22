import { compare, Money } from './money';

export type Availability = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface ProductImage {
  readonly src: string;
  readonly alt: string;
}

export interface ProductVariant {
  readonly id: string;
  /** Option values that define this variant, e.g. `{ size: 'M', color: 'Red' }`. */
  readonly attributes: Readonly<Record<string, string>>;
  readonly stock: number;
  /** Overrides the product price. */
  readonly price?: Money;
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly images: readonly ProductImage[];
  readonly price: Money;
  /** The price before a discount. A value above `price` puts the product on sale. */
  readonly compareAtPrice?: Money;
  readonly category?: string;
  readonly rating?: { readonly average: number; readonly count: number };
  readonly variants?: readonly ProductVariant[];
  /** Units in stock when there are no variants. Leave it out when stock is not tracked. */
  readonly stock?: number;
  readonly featured?: boolean;
}

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export function hasVariants(product: Product): boolean {
  return (product.variants?.length ?? 0) > 0;
}

/** Units available: the variant's, the sum of all variants, or `undefined` when not tracked. */
export function stockOf(
  product: Product,
  variant?: ProductVariant,
): number | undefined {
  if (variant) return variant.stock;
  if (hasVariants(product))
    return (product.variants ?? []).reduce((total, v) => total + v.stock, 0);
  return product.stock;
}

export function availability(
  stock: number | undefined,
  lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD,
): Availability {
  if (stock === undefined) return 'in-stock';
  if (stock <= 0) return 'out-of-stock';
  return stock <= lowStockThreshold ? 'low-stock' : 'in-stock';
}

/** Percentage taken off the compare-at price, rounded; `0` when not on sale. */
export function discountPercent(
  product: Pick<Product, 'price' | 'compareAtPrice'>,
): number {
  const original = product.compareAtPrice;
  if (!original || compare(original, product.price) <= 0) return 0;
  return Math.round((1 - product.price.amount / original.amount) * 100);
}

export function isOnSale(
  product: Pick<Product, 'price' | 'compareAtPrice'>,
): boolean {
  return discountPercent(product) > 0;
}

export function priceOf(product: Product, variant?: ProductVariant): Money {
  return variant?.price ?? product.price;
}

/** Lowest and highest price across the variants (both equal for a simple product). */
export function priceRange(product: Product): { min: Money; max: Money } {
  const prices = hasVariants(product)
    ? (product.variants ?? []).map((variant) => priceOf(product, variant))
    : [product.price];
  return {
    min: prices.reduce((low, price) => (compare(price, low) < 0 ? price : low)),
    max: prices.reduce((high, price) =>
      compare(price, high) > 0 ? price : high,
    ),
  };
}

export interface VariantOption {
  readonly key: string;
  readonly values: readonly string[];
}

/** The options a shopper must choose (size, color...), in order of first appearance. */
export function variantOptions(product: Product): readonly VariantOption[] {
  const options = new Map<string, string[]>();
  for (const variant of product.variants ?? []) {
    for (const [key, value] of Object.entries(variant.attributes)) {
      const values = options.get(key) ?? [];
      if (!values.includes(value)) values.push(value);
      options.set(key, values);
    }
  }
  return [...options].map(([key, values]) => ({ key, values }));
}

export type VariantSelection = Readonly<Record<string, string>>;

function matches(
  variant: ProductVariant,
  selection: VariantSelection,
): boolean {
  return Object.entries(selection).every(
    ([key, value]) => variant.attributes[key] === value,
  );
}

/** The variant matching a complete selection, or `undefined` while options are missing. */
export function findVariant(
  product: Product,
  selection: VariantSelection,
): ProductVariant | undefined {
  const keys = variantOptions(product).map((option) => option.key);
  if (keys.some((key) => !selection[key])) return undefined;
  return product.variants?.find((variant) => matches(variant, selection));
}

/** Whether choosing `value` for `key`, on top of the rest of the selection, leaves a variant in stock. */
export function isOptionAvailable(
  product: Product,
  selection: VariantSelection,
  key: string,
  value: string,
): boolean {
  const others = Object.fromEntries(
    Object.entries(selection).filter(([k]) => k !== key),
  );
  return (product.variants ?? []).some(
    (variant) =>
      variant.stock > 0 &&
      variant.attributes[key] === value &&
      matches(variant, others),
  );
}

export interface ProductFilter {
  /** Every word must appear in the name, description or category (ignoring case and accents). */
  readonly search?: string;
  readonly categories?: readonly string[];
  /** Minor units of the products' currency. */
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly inStockOnly?: boolean;
  readonly onSaleOnly?: boolean;
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function filterProducts(
  products: readonly Product[],
  filter: ProductFilter,
): readonly Product[] {
  const words = normalize(filter.search ?? '')
    .split(/\s+/)
    .filter(Boolean);

  return products.filter((product) => {
    if (words.length > 0) {
      const haystack = normalize(
        [product.name, product.description, product.category]
          .filter(Boolean)
          .join(' '),
      );
      if (!words.every((word) => haystack.includes(word))) return false;
    }
    if (
      filter.categories?.length &&
      !filter.categories.includes(product.category ?? '')
    ) {
      return false;
    }
    const { min } = priceRange(product);
    if (filter.minPrice !== undefined && min.amount < filter.minPrice)
      return false;
    if (filter.maxPrice !== undefined && min.amount > filter.maxPrice)
      return false;
    if (filter.inStockOnly && availability(stockOf(product)) === 'out-of-stock')
      return false;
    if (filter.onSaleOnly && !isOnSale(product)) return false;
    return true;
  });
}

export type ProductSort =
  'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'rating' | 'discount';

/** Returns a sorted copy. The sort is stable, so ties keep the input order. */
export function sortProducts(
  products: readonly Product[],
  sort: ProductSort,
): readonly Product[] {
  const lowest = (product: Product) => priceRange(product).min.amount;
  const keyed = products.map((product, index) => ({ product, index }));

  const order: Record<ProductSort, (a: Product, b: Product) => number> = {
    featured: (a, b) => Number(!!b.featured) - Number(!!a.featured),
    'price-asc': (a, b) => lowest(a) - lowest(b),
    'price-desc': (a, b) => lowest(b) - lowest(a),
    'name-asc': (a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    rating: (a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0),
    discount: (a, b) => discountPercent(b) - discountPercent(a),
  };

  return keyed
    .sort((a, b) => order[sort](a.product, b.product) || a.index - b.index)
    .map(({ product }) => product);
}

/** Lowest and highest starting price of the products, or `null` for an empty list. */
export function priceBounds(
  products: readonly Product[],
): { min: number; max: number } | null {
  if (products.length === 0) return null;
  const prices = products.map((product) => priceRange(product).min.amount);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function categoriesIn(products: readonly Product[]): readonly string[] {
  const categories = new Set(
    products.flatMap((product) => (product.category ? [product.category] : [])),
  );
  return [...categories].sort((a, b) => a.localeCompare(b));
}
