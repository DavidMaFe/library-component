import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  booleanAttribute,
  signal,
} from '@angular/core';
import { NgControl, Validators } from '@angular/forms';
import { uniqueId } from '../shared/unique-id';
import {
  LC_ERROR_MESSAGES,
  LcErrorMessages,
  resolveErrorMessages,
} from './form-error-messages';

/**
 * Wraps a form control with its label, hint and validation messages, and
 * wires the accessibility attributes (`for`, `aria-describedby`,
 * `aria-invalid`) between them.
 *
 * ```html
 * <lc-form-field label="Email" hint="We never share it">
 *   <input lc-input type="email" formControlName="email" />
 * </lc-form-field>
 * ```
 *
 * Errors are shown once the control is invalid and touched.
 *
 * Customize with `--lc-field-gap`, `--lc-field-label-color`,
 * `--lc-field-hint-color` and `--lc-field-error-color`.
 */
@Component({
  selector: 'lc-form-field',
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcFormField {
  readonly label = input('');
  readonly hint = input('');
  /** Marks the field as required in the label. Defaults to whether the control has `Validators.required`. */
  readonly required = input<boolean | undefined, unknown>(undefined, {
    transform: (value) =>
      value === undefined ? undefined : booleanAttribute(value),
  });
  /** Per-field messages, taking precedence over the global ones. */
  readonly errors = input<LcErrorMessages>({});

  readonly #globalMessages = inject(LC_ERROR_MESSAGES);
  private readonly ngControl = contentChild(NgControl, { descendants: true });
  readonly #controlChanges = signal(0);

  readonly #controlId = signal(uniqueId('lc-control'));
  readonly #isGroup = signal(false);

  readonly controlId = this.#controlId.asReadonly();
  readonly labelId = uniqueId('lc-label');
  readonly hintId = uniqueId('lc-hint');
  readonly errorId = uniqueId('lc-error');
  /** True when the control is a group (radio group) labelled with `aria-labelledby`. */
  readonly isGroup = this.#isGroup.asReadonly();

  readonly invalid = computed(() => {
    this.#controlChanges();
    const control = this.ngControl()?.control;
    return !!control && control.invalid && control.touched;
  });

  readonly messages = computed(() => {
    this.#controlChanges();
    if (!this.invalid()) return [];
    return resolveErrorMessages(
      this.ngControl()?.control?.errors ?? null,
      this.errors(),
      this.#globalMessages,
    );
  });

  readonly isRequired = computed(() => {
    this.#controlChanges();
    const explicit = this.required();
    if (explicit !== undefined) return explicit;
    return (
      this.ngControl()?.control?.hasValidator(Validators.required) ?? false
    );
  });

  /** Ids for the control's `aria-describedby`. */
  readonly describedBy = computed(
    () =>
      [this.hint() ? this.hintId : null, this.invalid() ? this.errorId : null]
        .filter(Boolean)
        .join(' ') || null,
  );

  constructor() {
    effect((onCleanup) => {
      const control = this.ngControl()?.control;
      if (!control) return;
      const subscription = control.events.subscribe(() =>
        this.#controlChanges.update((count) => count + 1),
      );
      onCleanup(() => subscription.unsubscribe());
    });
  }

  /** Called by a control that provides its own `id`. */
  setControlId(id: string): void {
    this.#controlId.set(id);
  }

  /** Called by group controls, whose label cannot use `for`. */
  markAsGroup(): void {
    this.#isGroup.set(true);
  }
}
