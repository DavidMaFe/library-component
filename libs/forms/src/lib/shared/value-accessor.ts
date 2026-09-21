import {
  booleanAttribute,
  computed,
  Directive,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { LcFormField } from '../form-field/form-field';

/**
 * Base for controls that implement `ControlValueAccessor` with signals.
 * Subclasses read `value()` and call `commit()` when the user changes it.
 */
@Directive()
export abstract class LcValueAccessor<T> implements ControlValueAccessor {
  protected readonly field = inject(LcFormField, { optional: true });

  readonly disabled = input(false, { transform: booleanAttribute });

  readonly #value = signal<T>(this.initialValue());
  readonly #disabledByForm = signal(false);
  #onChange: (value: T) => void = () => undefined;
  #onTouched: () => void = () => undefined;

  readonly value = this.#value.asReadonly();
  readonly isDisabled = computed(
    () => this.disabled() || this.#disabledByForm(),
  );
  protected readonly invalid = computed(() => this.field?.invalid() ?? false);
  protected readonly describedBy = computed(
    () => this.field?.describedBy() ?? null,
  );

  protected abstract initialValue(): T;

  writeValue(value: T | null): void {
    this.#value.set(value ?? this.initialValue());
  }

  registerOnChange(fn: (value: T) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.#disabledByForm.set(isDisabled);
  }

  /** Stores a value chosen by the user and notifies the form. */
  protected commit(value: T): void {
    this.#value.set(value);
    this.#onChange(value);
  }

  protected touch(): void {
    this.#onTouched();
  }
}
