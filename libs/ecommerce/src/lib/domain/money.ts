/**
 * An amount of money in the currency's minor unit (cents for EUR and USD),
 * always an integer, so sums, discounts and taxes never accumulate
 * floating-point errors.
 */
export interface Money {
  /** Integer number of minor units: `1250` is 12,50 € (0 decimals for JPY, 3 for KWD). */
  readonly amount: number;
  /** ISO 4217 code, upper case. */
  readonly currency: string;
}

/** Creates money. Throws when `amount` is not an integer. */
export function money(amount: number, currency = 'EUR'): Money {
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError(
      `Money amounts are integers in minor units, got ${amount}.`,
    );
  }
  return { amount, currency: currency.toUpperCase() };
}

export function zero(currency = 'EUR'): Money {
  return money(0, currency);
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} and ${b.currency}.`);
  }
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount + b.amount, a.currency);
}

export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount - b.amount, a.currency);
}

/** Multiplies by a whole factor, e.g. a quantity. */
export function multiply(value: Money, factor: number): Money {
  if (!Number.isInteger(factor))
    throw new RangeError(`Factor must be an integer, got ${factor}.`);
  return money(value.amount * factor, value.currency);
}

export function sum(values: readonly Money[], currency = 'EUR'): Money {
  return values.reduce(add, zero(currency));
}

/** Rounds half away from zero, ignoring floating-point noise (`1.005 * 100` style errors). */
function roundHalfUp(value: number): number {
  const clean = Number(value.toPrecision(12));
  return Math.sign(clean) * Math.round(Math.abs(clean));
}

/** `percent` of an amount, rounded to the minor unit (half up). */
export function percentOf(value: Money, percent: number): Money {
  return money(roundHalfUp((value.amount * percent) / 100), value.currency);
}

/** Negative when `a < b`, zero when equal, positive when `a > b`. */
export function compare(a: Money, b: Money): number {
  assertSameCurrency(a, b);
  return a.amount - b.amount;
}

export function minOf(a: Money, b: Money): Money {
  return compare(a, b) <= 0 ? a : b;
}

export function isZero(value: Money): boolean {
  return value.amount === 0;
}

/** Number of decimals of the currency's minor unit (2 for EUR, 0 for JPY, 3 for KWD). */
export function minorUnitDigits(currency: string): number {
  return (
    new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
    }).resolvedOptions().maximumFractionDigits ?? 2
  );
}

/** `1250` EUR -> `12.5`. For display and payment APIs that expect a decimal, not for calculations. */
export function toMajor(value: Money): number {
  return value.amount / 10 ** minorUnitDigits(value.currency);
}

/** `12.5` -> `1250` EUR. Use it to import prices written as decimals. */
export function fromMajor(major: number, currency = 'EUR'): Money {
  return money(roundHalfUp(major * 10 ** minorUnitDigits(currency)), currency);
}

export function formatMoney(value: Money, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
  }).format(toMajor(value));
}
