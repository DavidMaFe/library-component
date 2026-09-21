import { toSignal } from '@angular/core/rxjs-interop';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LcFormField, LcInput } from '@lc/forms';
import { LcButton } from '@lc/ui';
import { isoDate } from '../domain/opening-hours';
import {
  availableSlots,
  DEFAULT_RESERVATION_POLICY,
  ReservationIssue,
  ReservationPolicy,
  ReservationRequest,
  validateReservation,
} from '../domain/reservation';
import { LC_RESTAURANT_LABELS } from '../labels/restaurant-labels';

/**
 * Table booking form. It offers only bookable dates and times (from the
 * policy and the opening hours), validates on submit and emits the request.
 * It does not talk to any backend: send the emitted request wherever you need.
 *
 * ```html
 * <lc-reservation-form [policy]="policy" (reservation)="book($event)" />
 * ```
 *
 * Text comes from `LC_RESTAURANT_LABELS`; field errors from `LC_ERROR_MESSAGES`
 * of `@lc/forms`.
 *
 * Customize with `--lc-reservation-gap`.
 */
@Component({
  selector: 'lc-reservation-form',
  imports: [ReactiveFormsModule, LcFormField, LcInput, LcButton],
  templateUrl: './reservation-form.html',
  styleUrl: './reservation-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcReservationForm {
  readonly policy = input<ReservationPolicy>(DEFAULT_RESERVATION_POLICY);
  /** Fixes the current moment (tests, other time zones). Defaults to the clock. */
  readonly now = input<Date | undefined>(undefined);
  /** Disables the submit button while the parent sends the request. */
  readonly submitting = input(false, { transform: booleanAttribute });

  readonly reservation = output<ReservationRequest>();

  protected readonly labels = inject(LC_RESTAURANT_LABELS);
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly form = new FormGroup({
    date: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    time: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    partySize: new FormControl<number | null>(2, [Validators.required]),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
  });

  protected readonly issues = signal<readonly ReservationIssue[]>([]);
  readonly #date = toSignal(this.form.controls.date.valueChanges, {
    initialValue: this.form.controls.date.value,
  });

  protected readonly current = computed(() => this.now() ?? new Date());
  protected readonly minDate = computed(() => isoDate(this.current()));
  protected readonly maxDate = computed(() => {
    const limit = new Date(this.current());
    limit.setDate(limit.getDate() + this.policy().maxAdvanceDays);
    return isoDate(limit);
  });
  protected readonly slots = computed(() =>
    availableSlots(this.#date(), this.policy(), this.current()),
  );
  protected readonly noSlots = computed(
    () => !!this.#date() && this.slots().length === 0,
  );
  protected readonly issueMessages = computed(() =>
    this.issues().map((issue) =>
      this.labels.reservationIssue(issue, this.policy()),
    ),
  );

  constructor() {
    effect(() => {
      const { minPartySize, maxPartySize } = this.policy();
      const control = this.form.controls.partySize;
      control.setValidators([
        Validators.required,
        Validators.min(minPartySize),
        Validators.max(maxPartySize),
      ]);
      control.updateValueAndValidity();
    });

    // A chosen time that the new date no longer offers is cleared.
    effect(() => {
      const slots = this.slots();
      untracked(() => {
        const time = this.form.controls.time;
        if (time.value && !slots.includes(time.value)) time.setValue('');
      });
    });
  }

  /** Clears the form, e.g. after the reservation was accepted. */
  reset(): void {
    this.form.reset({ partySize: 2 });
    this.issues.set([]);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.#focusFirstInvalid();
      return;
    }

    const value = this.form.getRawValue();
    const request: ReservationRequest = {
      date: value.date,
      time: value.time,
      partySize: Number(value.partySize),
      name: value.name.trim(),
      email: value.email.trim(),
      ...(value.phone.trim() ? { phone: value.phone.trim() } : {}),
      ...(value.notes.trim() ? { notes: value.notes.trim() } : {}),
    };

    const issues = validateReservation(request, this.policy(), this.current());
    this.issues.set(issues);
    if (issues.length > 0) return;

    this.reservation.emit(request);
  }

  #focusFirstInvalid(): void {
    // Runs after the field components have rendered their invalid state.
    queueMicrotask(() =>
      this.#host
        .querySelector<HTMLElement>(
          'input.ng-invalid, select.ng-invalid, textarea.ng-invalid',
        )
        ?.focus(),
    );
  }
}
