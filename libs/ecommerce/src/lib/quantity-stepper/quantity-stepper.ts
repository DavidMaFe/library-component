import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { LC_ECOMMERCE_LABELS } from '../labels/ecommerce-labels';

/**
 * Number input with plus and minus buttons. Typed values are kept between
 * `min` and `max`; the buttons disable at the limits.
 *
 * ```html
 * <lc-quantity-stepper label="Quantity of Linen shirt" [(value)]="quantity" [max]="stock" />
 * ```
 *
 * Customize with `--lc-stepper-height` and `--lc-stepper-radius`.
 */
@Component({
  selector: 'lc-quantity-stepper',
  templateUrl: './quantity-stepper.html',
  styleUrl: './quantity-stepper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcQuantityStepper {
  /** Accessible name of the group and of the number field. */
  readonly label = input.required<string>();
  readonly value = model(1);
  readonly min = input(1, { transform: numberAttribute });
  /** Upper limit, e.g. the stock. No limit when unset. */
  readonly max = input<number | undefined, unknown>(undefined, {
    transform: (value) => (value == null ? undefined : numberAttribute(value)),
  });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly labels = inject(LC_ECOMMERCE_LABELS);
  protected readonly atMin = computed(() => this.value() <= this.min());
  protected readonly atMax = computed(
    () => this.max() !== undefined && this.value() >= (this.max() as number),
  );

  protected step(direction: 1 | -1): void {
    this.#set(this.value() + direction);
  }

  protected onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    // An empty or non-numeric field goes back to the current value instead of jumping to the minimum.
    const raw = input.value.trim();
    const parsed = raw === '' ? Number.NaN : Math.floor(Number(raw));
    this.#set(Number.isFinite(parsed) ? parsed : this.value());
    // Shows the clamped value even when the model did not change.
    input.value = String(this.value());
  }

  #set(next: number): void {
    const max = this.max();
    const clamped = Math.max(
      this.min(),
      max === undefined ? next : Math.min(max, next),
    );
    this.value.set(clamped);
  }
}
