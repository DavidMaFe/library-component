import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LcFormField, LcRadio, LcRadioGroup } from '@lc/forms';
import { LcBadge, LcButton } from '@lc/ui';
import {
  availability,
  DEFAULT_LOW_STOCK_THRESHOLD,
  discountPercent,
  findVariant,
  hasVariants,
  isOptionAvailable,
  Product,
  ProductVariant,
  priceOf,
  priceRange,
  stockOf,
  variantOptions,
  VariantSelection,
} from '../domain/catalog';
import { formatMoney } from '../domain/money';
import { LC_ECOMMERCE_LABELS } from '../labels/ecommerce-labels';
import { LcQuantityStepper } from '../quantity-stepper/quantity-stepper';

/** What `lc-product-detail` emits when the shopper adds the product. */
export interface AddToCartEvent {
  readonly product: Product;
  readonly variant?: ProductVariant;
  readonly quantity: number;
}

/**
 * Product page content: image gallery, price, rating, description, variant
 * selection (options that leave nothing in stock are disabled), quantity and
 * an add-to-cart button that stays disabled until a purchasable variant is
 * chosen.
 *
 * ```html
 * <lc-product-detail [product]="product" (addToCart)="cart.add($event)" />
 * ```
 *
 * Customize with `--lc-product-detail-gap` and `--lc-product-image-ratio`.
 */
@Component({
  selector: 'lc-product-detail',
  imports: [
    FormsModule,
    LcFormField,
    LcRadioGroup,
    LcRadio,
    LcQuantityStepper,
    LcButton,
    LcBadge,
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcProductDetail {
  readonly product = input.required<Product>();
  readonly locale = input(inject(LOCALE_ID));
  readonly lowStockThreshold = input(DEFAULT_LOW_STOCK_THRESHOLD, {
    transform: numberAttribute,
  });
  /** The most units that can be added at once, even with more stock. */
  readonly maxPerOrder = input(10, { transform: numberAttribute });
  /** Level of the product name in the page outline (1-6). */
  readonly headingLevel = input(1, { transform: numberAttribute });

  readonly addToCart = output<AddToCartEvent>();

  protected readonly labels = inject(LC_ECOMMERCE_LABELS);

  protected readonly selection = signal<VariantSelection>({});
  protected readonly quantity = signal(1);
  protected readonly activeImage = signal(0);

  protected readonly options = computed(() => variantOptions(this.product()));
  protected readonly variant = computed(() =>
    findVariant(this.product(), this.selection()),
  );
  protected readonly needsVariant = computed(() => hasVariants(this.product()));
  protected readonly missingOptions = computed(() =>
    this.options()
      .filter((option) => !this.selection()[option.key])
      .map((option) => option.key),
  );

  protected readonly stock = computed(() =>
    stockOf(this.product(), this.variant()),
  );
  protected readonly status = computed(() =>
    availability(this.stock(), this.lowStockThreshold()),
  );
  protected readonly purchasable = computed(
    () =>
      (!this.needsVariant() || !!this.variant()) &&
      this.status() !== 'out-of-stock',
  );
  protected readonly maxQuantity = computed(() =>
    Math.min(this.stock() ?? this.maxPerOrder(), this.maxPerOrder()),
  );
  protected readonly effectiveQuantity = computed(() =>
    Math.max(1, Math.min(this.quantity(), this.maxQuantity())),
  );

  protected readonly percent = computed(() => discountPercent(this.product()));
  protected readonly price = computed(() => {
    const product = this.product();
    const variant = this.variant();
    if (variant || !this.needsVariant())
      return formatMoney(priceOf(product, variant), this.locale());
    const { min, max } = priceRange(product);
    const from = formatMoney(min, this.locale());
    return min.amount === max.amount ? from : this.labels.priceFrom(from);
  });
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
  protected readonly image = computed(
    () => this.product().images[this.activeImage()] ?? this.product().images[0],
  );

  protected choose(key: string, value: string | null): void {
    if (value === null) return;
    this.selection.update((current) => ({ ...current, [key]: value }));
    this.quantity.set(
      Math.min(this.quantity(), Math.max(1, this.maxQuantity())),
    );
  }

  protected available(key: string, value: string): boolean {
    return isOptionAvailable(this.product(), this.selection(), key, value);
  }

  protected add(): void {
    if (!this.purchasable()) return;
    this.addToCart.emit({
      product: this.product(),
      variant: this.variant(),
      quantity: this.effectiveQuantity(),
    });
  }
}
