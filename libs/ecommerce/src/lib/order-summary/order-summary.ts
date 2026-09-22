import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
  numberAttribute,
} from '@angular/core';
import { CartTotals } from '../domain/cart';
import { formatMoney } from '../domain/money';
import { LC_ECOMMERCE_LABELS } from '../labels/ecommerce-labels';
import { uniqueId } from '../shared/unique-id';

/**
 * Breakdown of what the shopper pays: subtotal, discount, shipping, tax and
 * total. It only displays `CartTotals` (see `cartTotals`), so the arithmetic
 * lives in the tested domain code.
 *
 * ```html
 * <lc-order-summary [totals]="totals" couponCode="SAVE10" />
 * ```
 *
 * Customize with `--lc-summary-bg`, `-border-color` and `-padding`.
 */
@Component({
  selector: 'lc-order-summary',
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcOrderSummary {
  readonly totals = input.required<CartTotals>();
  readonly locale = input(inject(LOCALE_ID));
  readonly couponCode = input<string | undefined>(undefined);
  /** No shipping method is chosen yet: shows a hint instead of an amount. */
  readonly shippingPending = input(false, { transform: booleanAttribute });
  /** Whether tax is contained in the total (default) or added on top. Changes the tax label. */
  readonly pricesIncludeTax = input(true, { transform: booleanAttribute });
  /** Level of the title in the page outline (1-6). */
  readonly headingLevel = input(2, { transform: numberAttribute });
  /** Hides the tax row when it is zero. */
  readonly hideZeroTax = input(true, { transform: booleanAttribute });

  protected readonly labels = inject(LC_ECOMMERCE_LABELS);
  protected readonly titleId = uniqueId('lc-summary-title');

  protected readonly showDiscount = computed(
    () => this.totals().discount.amount > 0,
  );
  protected readonly showTax = computed(
    () => !this.hideZeroTax() || this.totals().tax.amount > 0,
  );

  protected format(amount: { amount: number; currency: string }): string {
    return formatMoney(amount, this.locale());
  }
}
