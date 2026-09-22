import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { ProductSort } from '../domain/catalog';
import { CheckoutIssue } from '../domain/checkout';

/** Every user-facing text of the ecommerce components. Replace any of them to translate or reword. */
export interface LcEcommerceLabels {
  // Product card and detail
  readonly addToCart: string;
  readonly chooseOptions: string;
  readonly outOfStock: string;
  readonly lowStock: (count: number | undefined) => string;
  readonly onSale: (percent: number) => string;
  readonly priceFrom: (price: string) => string;
  readonly originalPrice: string;
  readonly rating: (average: number, count: number) => string;
  readonly selectOption: (option: string) => string;
  readonly optionSoldOut: (value: string) => string;
  readonly selectOptionsFirst: (options: readonly string[]) => string;
  readonly imageOf: (
    position: number,
    total: number,
    description: string,
  ) => string;
  readonly quantity: string;

  // Quantity stepper
  readonly quantityOf: (name: string) => string;
  readonly quantityIncrease: string;
  readonly quantityDecrease: string;

  // Product list
  readonly listSearch: string;
  readonly listSort: string;
  readonly listSortOptions: Readonly<Record<ProductSort, string>>;
  readonly listCategories: string;
  readonly listMinPrice: string;
  readonly listMaxPrice: string;
  readonly listInStockOnly: string;
  readonly listOnSaleOnly: string;
  readonly listResults: (count: number) => string;
  readonly listNoResults: string;
  readonly listClearFilters: string;
  readonly listPagination: string;

  // Order summary
  readonly summaryTitle: string;
  readonly summarySubtotal: string;
  readonly summaryDiscount: (code: string | undefined) => string;
  readonly summaryShipping: string;
  readonly summaryShippingFree: string;
  readonly summaryShippingPending: string;
  readonly summaryTaxIncluded: string;
  readonly summaryTax: string;
  readonly summaryTotal: string;

  // Cart
  readonly cartTitle: (itemCount: number) => string;
  readonly cartEmpty: string;
  readonly cartRemove: (name: string) => string;
  readonly cartCouponLabel: string;
  readonly cartCouponApply: string;
  readonly cartCouponApplied: (code: string) => string;
  readonly cartCouponRemove: string;
  readonly cartCheckout: string;
  readonly cartLineTotal: string;
  readonly cartUnitPrice: string;

  // Checkout
  readonly checkoutContact: string;
  readonly checkoutEmail: string;
  readonly checkoutPhone: string;
  readonly checkoutAddress: string;
  readonly checkoutName: string;
  readonly checkoutLine1: string;
  readonly checkoutLine2: string;
  readonly checkoutPostalCode: string;
  readonly checkoutCity: string;
  readonly checkoutRegion: string;
  readonly checkoutCountry: string;
  readonly checkoutShippingMethod: string;
  readonly checkoutNotes: string;
  readonly checkoutPlaceOrder: string;
  readonly checkoutIssue: (issue: CheckoutIssue) => string;
  readonly checkoutPostalCodeInvalid: string;
}

export const DEFAULT_LC_ECOMMERCE_LABELS: LcEcommerceLabels = {
  addToCart: 'Add to cart',
  chooseOptions: 'Choose options',
  outOfStock: 'Out of stock',
  lowStock: (count) =>
    count === undefined ? 'Low stock' : `Only ${count} left`,
  onSale: (percent) => `-${percent}%`,
  priceFrom: (price) => `From ${price}`,
  originalPrice: 'Original price',
  rating: (average, count) =>
    `Rated ${average} out of 5, ${count} ${count === 1 ? 'review' : 'reviews'}`,
  selectOption: (option) => `Select ${option}`,
  optionSoldOut: (value) => `${value} (sold out)`,
  selectOptionsFirst: (options) => `Select ${options.join(' and ')} first.`,
  imageOf: (position, total, description) =>
    `Show image ${position} of ${total}: ${description}`,
  quantity: 'Quantity',

  quantityOf: (name) => `Quantity of ${name}`,
  quantityIncrease: 'Increase quantity',
  quantityDecrease: 'Decrease quantity',

  listSearch: 'Search products',
  listSort: 'Sort by',
  listSortOptions: {
    featured: 'Featured',
    'price-asc': 'Price: low to high',
    'price-desc': 'Price: high to low',
    'name-asc': 'Name',
    rating: 'Best rated',
    discount: 'Biggest discount',
  },
  listCategories: 'Category',
  listMinPrice: 'Min price',
  listMaxPrice: 'Max price',
  listInStockOnly: 'In stock only',
  listOnSaleOnly: 'On sale only',
  listResults: (count) => (count === 1 ? '1 product' : `${count} products`),
  listNoResults: 'No products match your filters.',
  listClearFilters: 'Clear filters',
  listPagination: 'Product pages',

  summaryTitle: 'Order summary',
  summarySubtotal: 'Subtotal',
  summaryDiscount: (code) => (code ? `Discount (${code})` : 'Discount'),
  summaryShipping: 'Shipping',
  summaryShippingFree: 'Free',
  summaryShippingPending: 'Calculated at checkout',
  summaryTaxIncluded: 'Includes tax',
  summaryTax: 'Tax',
  summaryTotal: 'Total',

  cartTitle: (count) =>
    count === 1 ? 'Your cart (1 item)' : `Your cart (${count} items)`,
  cartEmpty: 'Your cart is empty.',
  cartRemove: (name) => `Remove ${name}`,
  cartCouponLabel: 'Discount code',
  cartCouponApply: 'Apply',
  cartCouponApplied: (code) => `Code ${code} applied`,
  cartCouponRemove: 'Remove code',
  cartCheckout: 'Checkout',
  cartLineTotal: 'Line total',
  cartUnitPrice: 'Unit price',

  checkoutContact: 'Contact',
  checkoutEmail: 'Email',
  checkoutPhone: 'Phone (optional)',
  checkoutAddress: 'Shipping address',
  checkoutName: 'Full name',
  checkoutLine1: 'Address',
  checkoutLine2: 'Apartment, suite... (optional)',
  checkoutPostalCode: 'Postal code',
  checkoutCity: 'City',
  checkoutRegion: 'State / region (optional)',
  checkoutCountry: 'Country',
  checkoutShippingMethod: 'Shipping method',
  checkoutNotes: 'Order notes (optional)',
  checkoutPlaceOrder: 'Place order',
  checkoutIssue: (issue) => {
    switch (issue) {
      case 'cart-empty':
        return 'Your cart is empty.';
      case 'email-invalid':
        return 'Enter a valid email address.';
      case 'name-required':
        return 'Enter the recipient name.';
      case 'address-required':
        return 'Enter the street address.';
      case 'postal-code-invalid':
        return 'Enter a valid postal code for the selected country.';
      case 'city-required':
        return 'Enter the city.';
      case 'country-required':
        return 'Choose a country.';
      case 'shipping-method-invalid':
        return 'Choose a shipping method.';
    }
  },
  checkoutPostalCodeInvalid:
    'Enter a valid postal code for the selected country.',
};

export const LC_ECOMMERCE_LABELS = new InjectionToken<LcEcommerceLabels>(
  'LC_ECOMMERCE_LABELS',
  {
    providedIn: 'root',
    factory: () => DEFAULT_LC_ECOMMERCE_LABELS,
  },
);

/** Overrides labels on top of the English defaults. The sort options merge key by key. */
export function provideLcEcommerceLabels(
  overrides: Partial<Omit<LcEcommerceLabels, 'listSortOptions'>> & {
    listSortOptions?: Partial<LcEcommerceLabels['listSortOptions']>;
  },
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: LC_ECOMMERCE_LABELS,
      useValue: {
        ...DEFAULT_LC_ECOMMERCE_LABELS,
        ...overrides,
        listSortOptions: {
          ...DEFAULT_LC_ECOMMERCE_LABELS.listSortOptions,
          ...overrides.listSortOptions,
        },
      },
    },
  ]);
}
