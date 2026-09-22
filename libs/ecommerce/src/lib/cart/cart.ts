import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  LOCALE_ID,
  numberAttribute,
  output,
  viewChild,
} from '@angular/core';
import { LcFormField, LcInput } from '@lc/forms';
import { LcButton } from '@lc/ui';
import {
  Cart,
  CartLine,
  cartTotals,
  lineKey,
  lineTotal,
  TotalsOptions,
} from '../domain/cart';
import { formatMoney } from '../domain/money';
import { LC_ECOMMERCE_LABELS } from '../labels/ecommerce-labels';
import { LcOrderSummary } from '../order-summary/order-summary';
import { LcQuantityStepper } from '../quantity-stepper/quantity-stepper';
import { uniqueId } from '../shared/unique-id';

export interface CartQuantityChange {
  /** The line, as given by `lineKey`. */
  readonly key: string;
  readonly quantity: number;
}

/**
 * The shopping cart: lines with quantity steppers and remove buttons, a
 * discount code field and the order summary.
 *
 * It is controlled: it never changes the cart. React to its outputs with the
 * cart functions (`setQuantity`, `removeLine`, `applyCoupon`) and pass the new
 * cart back.
 *
 * ```html
 * <lc-cart
 *   [cart]="cart()"
 *   (quantityChange)="cart.set(setQuantity(cart(), $event.key, $event.quantity))"
 *   (remove)="cart.set(removeLine(cart(), $event))"
 * />
 * ```
 *
 * Customize with `--lc-cart-gap` and `--lc-cart-image-size`.
 */
@Component({
  selector: 'lc-cart',
  imports: [LcQuantityStepper, LcOrderSummary, LcButton, LcFormField, LcInput],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcCart {
  readonly cart = input.required<Cart>();
  /** Shipping, free-shipping threshold and tax used for the summary. */
  readonly totalsOptions = input<TotalsOptions>({});
  readonly locale = input(inject(LOCALE_ID));
  /** Level of the title in the page outline (1-6). */
  readonly headingLevel = input(2, { transform: numberAttribute });
  /** Feedback from your server about the code just sent, e.g. "Code not valid". */
  readonly couponMessage = input<string | undefined>(undefined);
  readonly couponMessageKind = input<'error' | 'success'>('error');
  /** Shows the checkout button. */
  readonly checkoutEnabled = input(true);

  readonly quantityChange = output<CartQuantityChange>();
  readonly remove = output<string>();
  readonly applyCoupon = output<string>();
  readonly removeCoupon = output<void>();
  readonly checkout = output<void>();

  protected readonly labels = inject(LC_ECOMMERCE_LABELS);
  protected readonly titleId = uniqueId('lc-cart-title');
  private readonly codeInput = viewChild('code', {
    read: ElementRef<HTMLInputElement>,
  });

  protected readonly totals = computed(() =>
    cartTotals(this.cart(), this.totalsOptions()),
  );
  protected readonly shippingPending = computed(
    () =>
      this.totalsOptions().shipping === undefined ||
      this.totalsOptions().shipping === null,
  );
  protected readonly isEmpty = computed(() => this.cart().lines.length === 0);

  protected key(line: CartLine): string {
    return lineKey(line);
  }

  protected format(line: CartLine, kind: 'unit' | 'total'): string {
    return formatMoney(
      kind === 'unit' ? line.unitPrice : lineTotal(line),
      this.locale(),
    );
  }

  protected submitCoupon(event: Event): void {
    event.preventDefault();
    const input = this.codeInput()?.nativeElement;
    const code = input?.value.trim() ?? '';
    if (!code) return;
    this.applyCoupon.emit(code);
  }
}
