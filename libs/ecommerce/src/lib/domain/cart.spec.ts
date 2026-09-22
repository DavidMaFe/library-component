import {
  addLine,
  applyCoupon,
  Cart,
  CartLine,
  cartTotals,
  emptyCart,
  itemCount,
  lineKey,
  lineTotal,
  removeLine,
  setQuantity,
} from './cart';
import { money } from './money';

const eur = (amount: number) => money(amount);

const shirt: CartLine = {
  productId: 'shirt',
  variantId: 'm-red',
  name: 'Shirt',
  unitPrice: eur(4500),
  quantity: 1,
  maxQuantity: 5,
};
const mug: CartLine = {
  productId: 'mug',
  name: 'Mug',
  unitPrice: eur(1200),
  quantity: 2,
};

const cartWith = (...lines: CartLine[]): Cart =>
  lines.reduce(addLine, emptyCart());

describe('lineKey', () => {
  it('should include the variant when there is one', () => {
    expect(lineKey(shirt)).toBe('shirt:m-red');
    expect(lineKey(mug)).toBe('mug');
  });
});

describe('addLine', () => {
  it('should add a new line', () => {
    const cart = addLine(emptyCart(), mug);

    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0].quantity).toBe(2);
  });

  it('should merge lines of the same product and variant', () => {
    const cart = addLine(cartWith(mug), { ...mug, quantity: 3 });

    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0].quantity).toBe(5);
  });

  it('should keep different variants apart', () => {
    const cart = cartWith(shirt, { ...shirt, variantId: 'm-blue' });

    expect(cart.lines).toHaveLength(2);
  });

  it('should cap the quantity at the stock limit', () => {
    const cart = addLine(cartWith(shirt), { ...shirt, quantity: 10 });

    expect(cart.lines[0].quantity).toBe(5);
  });

  it('should remember the stock limit for later additions', () => {
    const cart = addLine(cartWith(shirt), {
      ...shirt,
      quantity: 1,
      maxQuantity: undefined,
    });

    expect(cart.lines[0].maxQuantity).toBe(5);
  });

  it('should add at least one unit', () => {
    expect(
      addLine(emptyCart(), { ...mug, quantity: 0 }).lines[0].quantity,
    ).toBe(1);
  });

  it('should ignore lines with no stock', () => {
    const cart = emptyCart();

    expect(addLine(cart, { ...mug, maxQuantity: 0 })).toBe(cart);
  });

  it('should refuse a line in another currency', () => {
    expect(() =>
      addLine(emptyCart('EUR'), { ...mug, unitPrice: money(100, 'USD') }),
    ).toThrow('Currency mismatch');
  });

  it('should not mutate the original cart', () => {
    const cart = cartWith(mug);

    addLine(cart, shirt);

    expect(cart.lines).toHaveLength(1);
  });
});

describe('setQuantity', () => {
  it('should change the quantity', () => {
    expect(setQuantity(cartWith(mug), 'mug', 4).lines[0].quantity).toBe(4);
  });

  it('should remove the line at zero or less', () => {
    expect(setQuantity(cartWith(mug), 'mug', 0).lines).toEqual([]);
    expect(setQuantity(cartWith(mug), 'mug', -3).lines).toEqual([]);
  });

  it('should cap at the stock limit and floor fractions', () => {
    expect(
      setQuantity(cartWith(shirt), 'shirt:m-red', 99).lines[0].quantity,
    ).toBe(5);
    expect(setQuantity(cartWith(mug), 'mug', 2.9).lines[0].quantity).toBe(2);
  });

  it('should ignore unknown lines', () => {
    const cart = cartWith(mug);

    expect(setQuantity(cart, 'nope', 3)).toBe(cart);
  });
});

describe('removeLine, applyCoupon, itemCount, lineTotal', () => {
  it('should remove a line', () => {
    expect(removeLine(cartWith(mug, shirt), 'mug').lines.map(lineKey)).toEqual([
      'shirt:m-red',
    ]);
  });

  it('should apply and clear a coupon', () => {
    const coupon = { code: 'SAVE10', kind: 'percentage', percent: 10 } as const;
    const withCoupon = applyCoupon(cartWith(mug), coupon);

    expect(withCoupon.coupon).toEqual(coupon);
    expect(applyCoupon(withCoupon, undefined).coupon).toBeUndefined();
  });

  it('should count units, not lines', () => {
    expect(itemCount(cartWith(mug, shirt))).toBe(3);
    expect(itemCount(emptyCart())).toBe(0);
  });

  it('should total a line', () => {
    expect(lineTotal(mug)).toEqual(eur(2400));
  });
});

describe('cartTotals', () => {
  const cart = cartWith(shirt, mug); // 4500 + 2 * 1200 = 6900

  it('should total an empty cart at zero', () => {
    const totals = cartTotals(emptyCart(), { shipping: eur(500), taxRate: 21 });

    expect(totals.total).toEqual(eur(0));
    expect(totals.shipping).toEqual(eur(0));
    expect(totals.itemCount).toBe(0);
  });

  it('should sum the lines into a subtotal', () => {
    const totals = cartTotals(cart);

    expect(totals.subtotal).toEqual(eur(6900));
    expect(totals.total).toEqual(eur(6900));
    expect(totals.itemCount).toBe(3);
  });

  it('should add shipping', () => {
    const totals = cartTotals(cart, { shipping: eur(495) });

    expect(totals.shipping).toEqual(eur(495));
    expect(totals.total).toEqual(eur(7395));
    expect(totals.shippingFree).toBe(false);
  });

  describe('coupons', () => {
    it('should apply a percentage discount to the subtotal', () => {
      const totals = cartTotals(
        applyCoupon(cart, { code: 'A', kind: 'percentage', percent: 10 }),
      );

      expect(totals.discount).toEqual(eur(690));
      expect(totals.total).toEqual(eur(6210));
    });

    it('should clamp percentages between 0 and 100', () => {
      expect(
        cartTotals(
          applyCoupon(cart, { code: 'A', kind: 'percentage', percent: 150 }),
        ).total,
      ).toEqual(eur(0));
      expect(
        cartTotals(
          applyCoupon(cart, { code: 'A', kind: 'percentage', percent: -5 }),
        ).discount,
      ).toEqual(eur(0));
    });

    it('should apply a fixed discount, capped at the subtotal', () => {
      expect(
        cartTotals(
          applyCoupon(cart, { code: 'A', kind: 'fixed', amount: eur(1000) }),
        ).total,
      ).toEqual(eur(5900));
      expect(
        cartTotals(
          applyCoupon(cart, { code: 'A', kind: 'fixed', amount: eur(99999) }),
        ).total,
      ).toEqual(eur(0));
    });

    it('should waive shipping with a free-shipping coupon', () => {
      const totals = cartTotals(
        applyCoupon(cart, { code: 'SHIP', kind: 'free-shipping' }),
        { shipping: eur(495) },
      );

      expect(totals.shipping).toEqual(eur(0));
      expect(totals.shippingFree).toBe(true);
      expect(totals.total).toEqual(eur(6900));
    });
  });

  describe('free shipping threshold', () => {
    it('should waive shipping once goods reach the threshold', () => {
      const totals = cartTotals(cart, {
        shipping: eur(495),
        freeShippingThreshold: eur(6900),
      });

      expect(totals.shippingFree).toBe(true);
      expect(totals.total).toEqual(eur(6900));
    });

    it('should charge shipping below the threshold', () => {
      expect(
        cartTotals(cart, {
          shipping: eur(495),
          freeShippingThreshold: eur(7000),
        }).shipping,
      ).toEqual(eur(495));
    });

    it('should compare against goods after discount', () => {
      const discounted = applyCoupon(cart, {
        code: 'A',
        kind: 'percentage',
        percent: 10,
      }); // 6210

      expect(
        cartTotals(discounted, {
          shipping: eur(495),
          freeShippingThreshold: eur(6900),
        }).shipping,
      ).toEqual(eur(495));
    });

    it('should not call zero-cost shipping "free"', () => {
      expect(
        cartTotals(cart, { shipping: eur(0), freeShippingThreshold: eur(1) })
          .shippingFree,
      ).toBe(false);
    });
  });

  describe('tax', () => {
    it('should extract the tax contained in the prices by default', () => {
      const totals = cartTotals(
        cartWith({ ...mug, quantity: 1, unitPrice: eur(12100) }),
        { taxRate: 21 },
      );

      expect(totals.tax).toEqual(eur(2100));
      expect(totals.total).toEqual(eur(12100));
    });

    it('should add tax on top when prices exclude it', () => {
      const totals = cartTotals(
        cartWith({ ...mug, quantity: 1, unitPrice: eur(10000) }),
        {
          taxRate: 21,
          pricesIncludeTax: false,
        },
      );

      expect(totals.tax).toEqual(eur(2100));
      expect(totals.total).toEqual(eur(12100));
    });

    it('should charge tax on shipping and after the discount', () => {
      const discounted = applyCoupon(
        cartWith({ ...mug, quantity: 1, unitPrice: eur(10000) }),
        {
          code: 'A',
          kind: 'fixed',
          amount: eur(2000),
        },
      );
      const totals = cartTotals(discounted, {
        taxRate: 10,
        pricesIncludeTax: false,
        shipping: eur(1000),
      });

      // base = 10000 - 2000 + 1000 = 9000; tax = 900
      expect(totals.tax).toEqual(eur(900));
      expect(totals.total).toEqual(eur(9900));
    });

    it('should charge no tax without a rate', () => {
      expect(cartTotals(cart).tax).toEqual(eur(0));
    });
  });

  it('should always produce totals that add up', () => {
    const c = applyCoupon(cart, { code: 'A', kind: 'percentage', percent: 15 });
    const t = cartTotals(c, {
      shipping: eur(495),
      taxRate: 21,
      pricesIncludeTax: false,
    });

    expect(t.total.amount).toBe(
      t.subtotal.amount - t.discount.amount + t.shipping.amount + t.tax.amount,
    );
  });
});
