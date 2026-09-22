import { ProductImage } from './catalog';
import {
  add,
  compare,
  minOf,
  Money,
  money,
  multiply,
  percentOf,
  subtract,
  sum,
  zero,
} from './money';

export interface CartLine {
  readonly productId: string;
  readonly variantId?: string;
  readonly name: string;
  /** e.g. `M / Red`. */
  readonly variantLabel?: string;
  readonly image?: ProductImage;
  readonly unitPrice: Money;
  readonly quantity: number;
  /** Stock limit: the quantity is capped at this value. */
  readonly maxQuantity?: number;
}

export type Coupon = { readonly code: string } & (
  | { readonly kind: 'percentage'; readonly percent: number }
  | { readonly kind: 'fixed'; readonly amount: Money }
  | { readonly kind: 'free-shipping' }
);

export interface Cart {
  readonly currency: string;
  readonly lines: readonly CartLine[];
  readonly coupon?: Coupon;
}

/** Identifies a line: the same product and variant share a line. */
export function lineKey(
  line: Pick<CartLine, 'productId' | 'variantId'>,
): string {
  return line.variantId
    ? `${line.productId}:${line.variantId}`
    : line.productId;
}

export function emptyCart(currency = 'EUR'): Cart {
  return { currency: currency.toUpperCase(), lines: [] };
}

function clampQuantity(quantity: number, maxQuantity?: number): number {
  const whole = Math.floor(quantity);
  return maxQuantity === undefined
    ? whole
    : Math.min(whole, Math.max(0, Math.floor(maxQuantity)));
}

/** Adds a line, merging it with an existing one for the same product and variant. */
export function addLine(cart: Cart, line: CartLine): Cart {
  if (line.unitPrice.currency !== cart.currency) {
    throw new Error(
      `Currency mismatch: cart is in ${cart.currency}, line in ${line.unitPrice.currency}.`,
    );
  }
  const key = lineKey(line);
  const existing = cart.lines.find((candidate) => lineKey(candidate) === key);
  const maxQuantity = line.maxQuantity ?? existing?.maxQuantity;

  const quantity = clampQuantity(
    (existing?.quantity ?? 0) + Math.max(1, line.quantity),
    maxQuantity,
  );
  if (quantity <= 0) return cart;

  const merged: CartLine = {
    ...(existing ?? line),
    ...line,
    quantity,
    maxQuantity,
  };
  const lines = existing
    ? cart.lines.map((candidate) =>
        lineKey(candidate) === key ? merged : candidate,
      )
    : [...cart.lines, merged];
  return { ...cart, lines };
}

/** Sets a line's quantity. Zero or less removes it; more than the stock limit is capped. */
export function setQuantity(cart: Cart, key: string, quantity: number): Cart {
  const line = cart.lines.find((candidate) => lineKey(candidate) === key);
  if (!line) return cart;

  const next = clampQuantity(quantity, line.maxQuantity);
  if (next <= 0) return removeLine(cart, key);
  return {
    ...cart,
    lines: cart.lines.map((candidate) =>
      lineKey(candidate) === key ? { ...candidate, quantity: next } : candidate,
    ),
  };
}

export function removeLine(cart: Cart, key: string): Cart {
  return { ...cart, lines: cart.lines.filter((line) => lineKey(line) !== key) };
}

export function applyCoupon(cart: Cart, coupon: Coupon | undefined): Cart {
  return coupon
    ? { ...cart, coupon }
    : { currency: cart.currency, lines: cart.lines };
}

export function itemCount(cart: Cart): number {
  return cart.lines.reduce((total, line) => total + line.quantity, 0);
}

export function lineTotal(line: CartLine): Money {
  return multiply(line.unitPrice, line.quantity);
}

export interface TotalsOptions {
  /** Shipping cost. Leave it out (or `null`) while no method is chosen. */
  readonly shipping?: Money | null;
  /** Shipping is free once goods (after discounts) reach this amount. */
  readonly freeShippingThreshold?: Money;
  /** VAT or sales tax rate, in percent. */
  readonly taxRate?: number;
  /** Prices already contain tax (the default, common in Europe). Otherwise tax is added on top. */
  readonly pricesIncludeTax?: boolean;
}

export interface CartTotals {
  readonly itemCount: number;
  readonly subtotal: Money;
  readonly discount: Money;
  readonly shipping: Money;
  /** Shipping was charged by the method but waived (coupon or threshold). */
  readonly shippingFree: boolean;
  /** Tax contained in `total` (or added to it when prices exclude tax). */
  readonly tax: Money;
  readonly total: Money;
}

/**
 * Computes the amounts to pay.
 *
 * - The discount applies to the goods: a percentage of the subtotal, or a fixed amount capped at it.
 * - Shipping is waived by a free-shipping coupon or by reaching `freeShippingThreshold`.
 * - Tax is charged on goods after discount plus shipping.
 */
export function cartTotals(
  cart: Cart,
  options: TotalsOptions = {},
): CartTotals {
  const currency = cart.currency;
  const subtotal = sum(cart.lines.map(lineTotal), currency);

  const coupon = cart.coupon;
  let discount = zero(currency);
  if (coupon?.kind === 'percentage') {
    discount = percentOf(subtotal, Math.min(100, Math.max(0, coupon.percent)));
  } else if (coupon?.kind === 'fixed') {
    discount = minOf(
      money(Math.max(0, coupon.amount.amount), currency),
      subtotal,
    );
  }
  const goods = subtract(subtotal, discount);

  const charged = options.shipping ?? zero(currency);
  const waived =
    charged.amount > 0 &&
    cart.lines.length > 0 &&
    (coupon?.kind === 'free-shipping' ||
      (options.freeShippingThreshold !== undefined &&
        compare(goods, options.freeShippingThreshold) >= 0));
  const shipping = waived || cart.lines.length === 0 ? zero(currency) : charged;

  const base = add(goods, shipping);
  const rate = Math.max(0, options.taxRate ?? 0);
  const includeTax = options.pricesIncludeTax ?? true;
  const tax = includeTax
    ? percentOf(base, (rate * 100) / (100 + rate))
    : percentOf(base, rate);
  const total = includeTax ? base : add(base, tax);

  return {
    itemCount: itemCount(cart),
    subtotal,
    discount,
    shipping,
    shippingFree: waived,
    tax,
    total,
  };
}
