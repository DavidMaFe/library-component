import { Cart, CartLine, CartTotals, Coupon } from './cart';
import { Money } from './money';

export interface Address {
  /** Recipient. */
  readonly name: string;
  readonly line1: string;
  readonly line2?: string;
  readonly postalCode: string;
  readonly city: string;
  readonly region?: string;
  /** ISO 3166-1 alpha-2 code. */
  readonly country: string;
}

export interface ShippingMethod {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly price: Money;
}

export interface CheckoutDetails {
  readonly email: string;
  readonly phone?: string;
  readonly address: Address;
  readonly shippingMethodId: string;
  readonly notes?: string;
}

/** What `lc-checkout-form` emits. Payment is handled outside this library. */
export interface Order {
  readonly details: CheckoutDetails;
  readonly shippingMethod: ShippingMethod;
  readonly lines: readonly CartLine[];
  readonly coupon?: Coupon;
  readonly totals: CartTotals;
}

export type CheckoutIssue =
  | 'cart-empty'
  | 'email-invalid'
  | 'name-required'
  | 'address-required'
  | 'postal-code-invalid'
  | 'city-required'
  | 'country-required'
  | 'shipping-method-invalid';

const POSTAL_CODES: Readonly<Record<string, RegExp>> = {
  ES: /^\d{5}$/,
  FR: /^\d{5}$/,
  DE: /^\d{5}$/,
  IT: /^\d{5}$/,
  PT: /^\d{4}-\d{3}$/,
  US: /^\d{5}(-\d{4})?$/,
  GB: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
};

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** Checks the format for countries with a known pattern; any 2+ character code passes for the rest. */
export function isValidPostalCode(
  country: string,
  postalCode: string,
): boolean {
  const value = postalCode.trim();
  const pattern = POSTAL_CODES[country.toUpperCase()];
  return pattern ? pattern.test(value) : value.length >= 2;
}

/** Returns every rule the checkout data breaks, in a stable order. */
export function validateCheckout(
  details: CheckoutDetails,
  context: { methods: readonly ShippingMethod[]; cart?: Cart },
): readonly CheckoutIssue[] {
  const issues: CheckoutIssue[] = [];
  const { address } = details;

  if (context.cart && context.cart.lines.length === 0)
    issues.push('cart-empty');
  if (!isValidEmail(details.email)) issues.push('email-invalid');
  if (!address.name.trim()) issues.push('name-required');
  if (!address.line1.trim()) issues.push('address-required');
  if (!address.country.trim()) {
    issues.push('country-required');
  } else if (!isValidPostalCode(address.country, address.postalCode)) {
    issues.push('postal-code-invalid');
  }
  if (!address.city.trim()) issues.push('city-required');
  if (
    !context.methods.some((method) => method.id === details.shippingMethodId)
  ) {
    issues.push('shipping-method-invalid');
  }
  return issues;
}
