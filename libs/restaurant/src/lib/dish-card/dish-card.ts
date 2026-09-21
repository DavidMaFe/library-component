import { LcBadge, LcCard } from '@lc/ui';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
  numberAttribute,
} from '@angular/core';
import { Dish, formatPrice } from '../domain/menu';
import { LC_RESTAURANT_LABELS } from '../labels/restaurant-labels';
import { uniqueId } from '../shared/unique-id';

/**
 * A dish with its photo, description, price, dietary tags and allergens.
 * Sold-out dishes say so in text, not only through styling.
 *
 * ```html
 * <lc-dish-card [dish]="dish" currency="EUR" />
 * ```
 *
 * Customize with `--lc-dish-price-color` and `--lc-dish-image-ratio`, plus
 * the `--lc-card-*` properties of the underlying card.
 */
@Component({
  selector: 'lc-dish-card',
  imports: [LcCard, LcBadge],
  templateUrl: './dish-card.html',
  styleUrl: './dish-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'article',
    '[attr.aria-labelledby]': 'nameId',
    '[attr.data-unavailable]': 'unavailable() || null',
  },
})
export class LcDishCard {
  readonly dish = input.required<Dish>();
  /** ISO 4217 currency code. */
  readonly currency = input('EUR');
  readonly locale = input(inject(LOCALE_ID));
  /** Level of the dish name in the page outline (1-6). */
  readonly headingLevel = input(3, { transform: numberAttribute });

  protected readonly labels = inject(LC_RESTAURANT_LABELS);
  protected readonly nameId = uniqueId('lc-dish-name');

  protected readonly price = computed(() =>
    formatPrice(this.dish().price, {
      currency: this.currency(),
      locale: this.locale(),
    }),
  );
  protected readonly unavailable = computed(
    () => this.dish().available === false,
  );
  protected readonly allergenText = computed(() =>
    (this.dish().allergens ?? [])
      .map((allergen) => this.labels.allergens[allergen])
      .join(', '),
  );
}
