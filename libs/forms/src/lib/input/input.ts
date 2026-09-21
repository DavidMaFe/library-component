import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostAttributeToken,
  inject,
  input,
  booleanAttribute,
} from '@angular/core';
import { LcFormField } from '../form-field/form-field';
import { LcFormSize } from '../shared/forms.types';

/**
 * Styles a native `<input>`, `<textarea>` or `<select>`. It keeps native
 * behavior, so `formControl`, `ngModel`, `type`, `placeholder`... work as usual.
 *
 * ```html
 * <input lc-input formControlName="name" />
 * <textarea lc-input rows="4"></textarea>
 * <select lc-input><option>Pizza</option></select>
 * ```
 *
 * Inside `lc-form-field` it takes its `id`, `aria-describedby` (merged with
 * yours) and `aria-invalid` from the field.
 *
 * Customize with `--lc-input-bg`, `-color`, `-border-color`,
 * `-border-color-focus`, `-radius`, `-height`, `-padding-x` and `-font-size`.
 */
@Component({
  // Attribute selectors on native elements keep native form semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'input[lc-input], textarea[lc-input], select[lc-input]',
  template: '',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-invalid]': 'isInvalid() || null',
    '[attr.aria-invalid]': 'isInvalid() || null',
    '[attr.aria-describedby]': 'describedBy()',
  },
})
export class LcInput {
  readonly size = input<LcFormSize>('md');
  /** Forces the invalid style. Inside a form field it is set automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  readonly #field = inject(LcFormField, { optional: true });
  readonly #explicitDescribedBy = inject(
    new HostAttributeToken('aria-describedby'),
    {
      optional: true,
    },
  );

  readonly isInvalid = computed(
    () => this.invalid() || (this.#field?.invalid() ?? false),
  );
  protected readonly describedBy = computed(
    () =>
      [this.#explicitDescribedBy, this.#field?.describedBy()]
        .filter(Boolean)
        .join(' ') || null,
  );

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    if (!this.#field) return;

    if (element.id) this.#field.setControlId(element.id);
    else element.id = this.#field.controlId();
  }
}
