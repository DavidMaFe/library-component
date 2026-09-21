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
