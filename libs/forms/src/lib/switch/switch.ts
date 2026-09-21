import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { uniqueId } from '../shared/unique-id';
import { LcValueAccessor } from '../shared/value-accessor';

/**
 * On/off toggle with a projected label. Its value is a boolean.
 *
 * ```html
 * <lc-switch formControlName="delivery">Home delivery</lc-switch>
 * ```
 *
 * Customize with `--lc-switch-width`, `-height`, `-bg-checked`, `-bg`
 * and `-thumb-color`.
 */
@Component({
  selector: 'lc-switch',
  templateUrl: './switch.html',
  styleUrl: './switch.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LcSwitch),
      multi: true,
    },
  ],
  host: {
    '[attr.data-disabled]': 'isDisabled() || null',
  },
})
export class LcSwitch extends LcValueAccessor<boolean> {
  protected readonly inputId = this.field?.controlId() ?? uniqueId('lc-switch');

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
