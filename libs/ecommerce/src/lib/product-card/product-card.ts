import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
  numberAttribute,
  output,
} from '@angular/core';
import { LcBadge, LcButton, LcCard } from '@lc/ui';
import {
  availability,
  DEFAULT_LOW_STOCK_THRESHOLD,
  discountPercent,
  hasVariants,
  Product,
  priceRange,
  stockOf,
} from '../domain/catalog';
import { formatMoney } from '../domain/money';
import { LC_ECOMMERCE_LABELS } from '../labels/ecommerce-labels';
import { uniqueId } from '../shared/unique-id';

/**
 * A product in a listing: image, name, price (with the discount when on
 * sale), rating, stock status and one action.
 *
 * - Simple product: "Add to cart" emits `add`.
 * - Product with variants: "Choose options" emits `viewOptions`.
 * - Out of stock: the action is disabled and says so.
 *
 * ```html
 * <lc-product-card [product]="product" href="/p/linen-shirt" (add)="cart.add($event)" />
 * ```
 *
 * Customize with `--lc-product-price-color`, `--lc-product-sale-color` and
 * `--lc-product-image-ratio`.
 */
@Component({
  selector: 'lc-product-card',
  imports: [LcCard, LcBadge, LcButton],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'article',
    '[attr.aria-labelledby]': 'nameId',
  },
})
export class LcProductCard {
  readonly product = input.required<Product>();
  readonly locale = input(inject(LOCALE_ID));
  readonly lowStockThreshold = input(DEFAULT_LOW_STOCK_THRESHOLD, {
    transform: numberAttribute,
  });
  /** Makes the name a link to the product page. */
  readonly href = input<string | undefined>(undefined);
  /** Level of the name in the page outline (1-6). */
  readonly headingLevel = input(3, { transform: numberAttribute });

  /** Emitted for a simple product when the shopper adds it. */
  readonly add = output<Product>();
  /** Emitted for a product with variants when the shopper wants to choose them. */
  readonly viewOptions = output<Product>();

  protected readonly labels = inject(LC_ECOMMERCE_LABELS);
  protected readonly nameId = uniqueId('lc-product-name');

  protected readonly stock = computed(() => stockOf(this.product()));
  protected readonly status = computed(() =>
    availability(this.stock(), this.lowStockThreshold()),
  );
  protected readonly percent = computed(() => discountPercent(this.product()));
  protected readonly withVariants = computed(() => hasVariants(this.product()));

  protected readonly range = computed(() => priceRange(this.product()));
  protected readonly hasPriceRange = computed(
    () => this.range().min.amount !== this.range().max.amount,
  );
  protected readonly price = computed(() =>
    formatMoney(this.range().min, this.locale()),
  );
  protected readonly compareAt = computed(() => {
    const original = this.product().compareAtPrice;
    return original && this.percent() > 0
      ? formatMoney(original, this.locale())
      : null;
  });
  protected readonly ratingLabel = computed(() => {
    const rating = this.product().rating;
    return rating ? this.labels.rating(rating.average, rating.count) : null;
  });
  protected readonly stars = computed(() => {
    const average = this.product().rating?.average ?? 0;
    return Array.from(
      { length: 5 },
      (_, index) => index + 1 <= Math.round(average),
    );
  });

  protected onAction(): void {
    if (this.withVariants()) this.viewOptions.emit(this.product());
    else this.add.emit(this.product());
  }
}
