import {
  add,
  compare,
  formatMoney,
  fromMajor,
  isZero,
  minOf,
  minorUnitDigits,
  money,
  multiply,
  percentOf,
  subtract,
  sum,
  toMajor,
  zero,
} from './money';

const eur = (amount: number) => money(amount, 'EUR');

describe('money', () => {
  it('should hold integer minor units and upper-case the currency', () => {
    expect(money(1250, 'eur')).toEqual({ amount: 1250, currency: 'EUR' });
  });

  it('should reject non-integer amounts', () => {
    expect(() => money(12.5)).toThrow(RangeError);
    expect(() => money(Number.NaN)).toThrow(RangeError);
    expect(() => money(Infinity)).toThrow(RangeError);
  });

  it('should default to euros', () => {
    expect(money(100).currency).toBe('EUR');
    expect(zero().amount).toBe(0);
  });
});

describe('arithmetic', () => {
  it('should add and subtract exactly', () => {
    expect(add(eur(10), eur(20))).toEqual(eur(30));
    expect(subtract(eur(10), eur(25))).toEqual(eur(-15));
  });

  it('should not accumulate floating-point errors', () => {
    // 0.1 + 0.2 !== 0.3 with decimals; with cents it is exact.
    expect(add(eur(10), eur(20)).amount).toBe(30);
    expect(sum([eur(10), eur(20), eur(30)]).amount).toBe(60);
  });

  it('should refuse to mix currencies', () => {
    expect(() => add(eur(1), money(1, 'USD'))).toThrow('Currency mismatch');
    expect(() => subtract(eur(1), money(1, 'USD'))).toThrow(
      'Currency mismatch',
    );
    expect(() => compare(eur(1), money(1, 'USD'))).toThrow('Currency mismatch');
  });

  it('should multiply by whole factors only', () => {
    expect(multiply(eur(1999), 3)).toEqual(eur(5997));
    expect(() => multiply(eur(100), 1.5)).toThrow(RangeError);
  });

  it('should sum a list, or zero for an empty one', () => {
    expect(sum([])).toEqual(zero());
    expect(sum([], 'USD')).toEqual(zero('USD'));
  });

  it('should compare and pick the smaller', () => {
    expect(compare(eur(5), eur(9))).toBeLessThan(0);
    expect(minOf(eur(5), eur(9))).toEqual(eur(5));
    expect(isZero(zero())).toBe(true);
    expect(isZero(eur(1))).toBe(false);
  });
});

describe('percentOf', () => {
  it('should compute percentages', () => {
    expect(percentOf(eur(20000), 10)).toEqual(eur(2000));
    expect(percentOf(eur(1999), 15)).toEqual(eur(300));
  });

  it('should round half up', () => {
    expect(percentOf(eur(5), 10)).toEqual(eur(1));
    expect(percentOf(eur(1005), 50)).toEqual(eur(503));
  });

  it('should round half away from zero for negatives', () => {
    expect(percentOf(eur(-5), 10)).toEqual(eur(-1));
  });

  it('should handle fractional percentages without float noise', () => {
    expect(percentOf(eur(1000), 7.5)).toEqual(eur(75));
    expect(percentOf(eur(20), 12.5)).toEqual(eur(3));
  });

  it('should handle 0 and 100 percent', () => {
    expect(percentOf(eur(999), 0)).toEqual(eur(0));
    expect(percentOf(eur(999), 100)).toEqual(eur(999));
  });
});

describe('currency digits', () => {
  it('should know the minor unit of each currency', () => {
    expect(minorUnitDigits('EUR')).toBe(2);
    expect(minorUnitDigits('JPY')).toBe(0);
    expect(minorUnitDigits('KWD')).toBe(3);
  });

  it('should convert to and from major units', () => {
    expect(toMajor(eur(1250))).toBe(12.5);
    expect(toMajor(money(500, 'JPY'))).toBe(500);
    expect(fromMajor(12.5)).toEqual(eur(1250));
    expect(fromMajor(19.99)).toEqual(eur(1999));
    expect(fromMajor(1.005, 'JPY')).toEqual(money(1, 'JPY'));
  });

  it('should import decimals safely', () => {
    expect(fromMajor(0.29)).toEqual(eur(29));
    expect(fromMajor(1.1)).toEqual(eur(110));
  });
});

describe('formatMoney', () => {
  it('should format using the currency minor unit', () => {
    expect(formatMoney(eur(1250), 'en-US')).toBe('€12.50');
    expect(formatMoney(money(1250, 'USD'), 'en-US')).toBe('$12.50');
    expect(formatMoney(money(500, 'JPY'), 'en-US')).toBe('¥500');
  });

  it('should follow the locale', () => {
    expect(formatMoney(eur(123456), 'de-DE')).toMatch(/1\.234,56\s€/);
  });

  it('should format negatives', () => {
    expect(formatMoney(eur(-500), 'en-US')).toBe('-€5.00');
  });
});
