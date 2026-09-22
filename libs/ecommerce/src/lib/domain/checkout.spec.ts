import { emptyCart } from './cart';
import {
  CheckoutDetails,
  isValidEmail,
  isValidPostalCode,
  ShippingMethod,
  validateCheckout,
} from './checkout';
import { money } from './money';

const methods: ShippingMethod[] = [
  { id: 'standard', label: 'Standard', price: money(495) },
  { id: 'express', label: 'Express', price: money(1295) },
];

const valid: CheckoutDetails = {
  email: 'ana@example.com',
  address: {
    name: 'Ana Ruiz',
    line1: 'Calle Mayor 1',
    postalCode: '28013',
    city: 'Madrid',
    country: 'ES',
  },
  shippingMethodId: 'standard',
};

describe('isValidEmail', () => {
  it('should accept normal addresses', () => {
    expect(isValidEmail('ana@example.com')).toBe(true);
    expect(isValidEmail('  ana.ruiz+shop@mail.example.es ')).toBe(true);
  });

  it('should reject malformed addresses', () => {
    for (const bad of [
      '',
      'ana',
      'ana@',
      '@example.com',
      'ana@example',
      'a na@example.com',
      'ana@example.c',
    ]) {
      expect(isValidEmail(bad)).toBe(false);
    }
  });
});

describe('isValidPostalCode', () => {
  it('should validate known countries', () => {
    expect(isValidPostalCode('ES', '28013')).toBe(true);
    expect(isValidPostalCode('ES', '2801')).toBe(false);
    expect(isValidPostalCode('PT', '1000-001')).toBe(true);
    expect(isValidPostalCode('PT', '1000001')).toBe(false);
    expect(isValidPostalCode('US', '90210-1234')).toBe(true);
    expect(isValidPostalCode('GB', 'sw1a 1aa')).toBe(true);
    expect(isValidPostalCode('gb', 'nope')).toBe(false);
  });

  it('should accept anything reasonable for other countries', () => {
    expect(isValidPostalCode('JP', '100-0001')).toBe(true);
    expect(isValidPostalCode('JP', ' ')).toBe(false);
    expect(isValidPostalCode('JP', '1')).toBe(false);
  });
});

describe('validateCheckout', () => {
  const cart = {
    ...emptyCart(),
    lines: [{ productId: 'a', name: 'A', unitPrice: money(100), quantity: 1 }],
  };

  it('should accept valid details', () => {
    expect(validateCheckout(valid, { methods, cart })).toEqual([]);
  });

  it('should reject an empty cart', () => {
    expect(validateCheckout(valid, { methods, cart: emptyCart() })).toEqual([
      'cart-empty',
    ]);
  });

  it('should skip the cart check when no cart is given', () => {
    expect(validateCheckout(valid, { methods })).toEqual([]);
  });

  it('should report each missing or invalid field', () => {
    const issues = validateCheckout(
      {
        email: 'nope',
        address: {
          name: ' ',
          line1: '',
          postalCode: '1',
          city: '',
          country: 'ES',
        },
        shippingMethodId: 'teleport',
      },
      { methods },
    );

    expect(issues).toEqual([
      'email-invalid',
      'name-required',
      'address-required',
      'postal-code-invalid',
      'city-required',
      'shipping-method-invalid',
    ]);
  });

  it('should require a country and not judge the postal code without one', () => {
    const issues = validateCheckout(
      { ...valid, address: { ...valid.address, country: '', postalCode: 'x' } },
      { methods },
    );

    expect(issues).toEqual(['country-required']);
  });

  it('should reject a shipping method that is not offered', () => {
    expect(
      validateCheckout(
        { ...valid, shippingMethodId: 'express' },
        { methods: [methods[0]] },
      ),
    ).toEqual(['shipping-method-invalid']);
  });
});
