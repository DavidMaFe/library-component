import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { LcRadioGroup } from './radio-group';

/**
 * A single option of an `lc-radio-group`, with a projected label.
 *
 * Customize with `--lc-radio-size`, `-bg-checked` and `-border-color`.
 */
@Component({
  selector: 'lc-radio',
  templateUrl: './radio.html',
  styleUrl: './radio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-disabled]': 'isDisabled() || null',
  },
})
export class LcRadio {
  protected readonly group = inject(LcRadioGroup);

  /** Value written to the group when this option is selected. */
  readonly value = input.required<unknown>();
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isDisabled = computed(
    () => this.disabled() || this.group.isDisabled(),
  );
  protected readonly checked = computed(
    () => this.group.value() === this.value(),
  );

  protected onSelect(): void {
    this.group.select(this.value());
  }
}
