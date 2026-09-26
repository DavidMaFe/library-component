import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { uniqueId } from '../shared/unique-id';
import { LcValueAccessor } from '../shared/value-accessor';

export type LcRadioOrientation = 'vertical' | 'horizontal';
/** `chip` shows each option as a selectable tile (sizes, time slots...). */
export type LcRadioAppearance = 'default' | 'chip';

/**
 * Groups `lc-radio` options and holds the selected value, which can be any
 * type. Inside `lc-form-field` the field label names the group.
 *
 * ```html
 * <lc-radio-group formControlName="size">
 *   <lc-radio value="s">Small</lc-radio>
 *   <lc-radio value="l">Large</lc-radio>
 * </lc-radio-group>
 * ```
 *
 * With `appearance="chip"` the options become tiles in a wrapping row, for
 * sizes, time slots or shipping methods. Keyboard and screen-reader behavior
 * stay those of a native radio group.
 */
@Component({
  selector: 'lc-radio-group',
  template: '<ng-content />',
  styleUrl: './radio-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LcRadioGroup),
      multi: true,
    },
  ],
  host: {
    role: 'radiogroup',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-appearance]': 'appearance()',
    '[attr.aria-labelledby]': 'field?.isGroup() ? field?.labelId : null',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'invalid() || null',
    '[attr.aria-required]': 'field?.isRequired() || null',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '(focusout)': 'touch()',
  },
})
export class LcRadioGroup extends LcValueAccessor<unknown> {
  /** Shared `name` of the native radios. */
  readonly name = input(uniqueId('lc-radio-group'));
  readonly orientation = input<LcRadioOrientation>('vertical');
  readonly appearance = input<LcRadioAppearance>('default');

  constructor() {
    super();
    this.field?.markAsGroup();
  }

  protected initialValue(): unknown {
    return null;
  }

  select(value: unknown): void {
    this.commit(value);
  }

  markTouched(): void {
    this.touch();
  }
}
