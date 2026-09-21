import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { uniqueId } from '../shared/unique-id';
import { LcValueAccessor } from '../shared/value-accessor';

/**
 * Checkbox with a projected label. Works with `formControl`, `formControlName`
 * and `ngModel`; its value is a boolean.
 *
 * ```html
 * <lc-checkbox formControlName="terms">I accept the terms</lc-checkbox>
 * ```
 *
 * Customize with `--lc-checkbox-size`, `-bg-checked`, `-border-color`,
 * `-radius` and `-check-color`.
 */
@Component({
  selector: 'lc-checkbox',
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LcCheckbox),
      multi: true,
    },
  ],
  host: {
    '[attr.data-disabled]': 'isDisabled() || null',
  },
})
export class LcCheckbox extends LcValueAccessor<boolean> {
  /** Shows the mixed state. Any user change clears it. */
  readonly indeterminate = input(false, { transform: booleanAttribute });

  protected readonly inputId =
    this.field?.controlId() ?? uniqueId('lc-checkbox');

  protected initialValue(): boolean {
    return false;
  }

  protected onToggle(event: Event): void {
    this.commit((event.target as HTMLInputElement).checked);
  }

  protected onBlur(): void {
    this.touch();
  }
}
