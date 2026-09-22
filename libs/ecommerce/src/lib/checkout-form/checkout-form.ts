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
  LOCALE_ID,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { LcFormField, LcInput, LcRadio, LcRadioGroup } from '@lc/forms';
import { LcButton } from '@lc/ui';
import { Cart, cartTotals, TotalsOptions } from '../domain/cart';
import {
  CheckoutDetails,
  CheckoutIssue,
  isValidPostalCode,
  Order,
  ShippingMethod,
  validateCheckout,
} from '../domain/checkout';
import { formatMoney } from '../domain/money';
import { LC_ECOMMERCE_LABELS } from '../labels/ecommerce-labels';
import { LcOrderSummary } from '../order-summary/order-summary';

export interface CheckoutCountry {
  /** ISO 3166-1 alpha-2 code. */
  readonly code: string;
  readonly label: string;
}

export const DEFAULT_CHECKOUT_COUNTRIES: readonly CheckoutCountry[] = [
  { code: 'ES', label: 'Spain' },
  { code: 'PT', label: 'Portugal' },
  { code: 'FR', label: 'France' },
  { code: 'DE', label: 'Germany' },
  { code: 'IT', label: 'Italy' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'US', label: 'United States' },
];

/**
 * Checkout: contact, shipping address, shipping method and order summary.
 * It validates the data and emits the `Order`. It handles **no payment
 * data**: put your payment provider's widget in the `lcCheckoutPayment` slot
 * and complete the payment yourself after `placeOrder`.
 *
 * ```html
 * <lc-checkout-form [cart]="cart" [shippingMethods]="methods" (placeOrder)="pay($event)">
 *   <div lcCheckoutPayment>...provider widget...</div>
 * </lc-checkout-form>
 * ```
 *
 * Customize with `--lc-checkout-gap`.
 */
@Component({
  selector: 'lc-checkout-form',
  imports: [
    ReactiveFormsModule,
    LcFormField,
    LcInput,
    LcRadioGroup,
    LcRadio,
    LcButton,
    LcOrderSummary,
  ],
  templateUrl: './checkout-form.html',
  styleUrl: './checkout-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcCheckoutForm {
  readonly cart = input.required<Cart>();
  readonly shippingMethods = input.required<readonly ShippingMethod[]>();
  readonly countries = input<readonly CheckoutCountry[]>(
    DEFAULT_CHECKOUT_COUNTRIES,
  );
  /** Free-shipping threshold and tax used for the totals. The shipping cost comes from the chosen method. */
  readonly totalsOptions = input<Omit<TotalsOptions, 'shipping'>>({});
  readonly locale = input(inject(LOCALE_ID));
  /** Disables the submit button while the parent processes the order. */
  readonly submitting = input(false, { transform: booleanAttribute });

  readonly placeOrder = output<Order>();

  protected readonly labels = inject(LC_ECOMMERCE_LABELS);
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl('', { nonNullable: true }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    line1: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    line2: new FormControl('', { nonNullable: true }),
    postalCode: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        (control: AbstractControl) => this.#postalCode(control),
      ],
    }),
    city: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    region: new FormControl('', { nonNullable: true }),
    country: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    shippingMethodId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    notes: new FormControl('', { nonNullable: true }),
  });

  protected readonly issues = signal<readonly CheckoutIssue[]>([]);
  readonly #methodId = toSignal(
    this.form.controls.shippingMethodId.valueChanges,
    {
      initialValue: this.form.controls.shippingMethodId.value,
    },
  );

  protected readonly selectedMethod = computed(() =>
    this.shippingMethods().find((method) => method.id === this.#methodId()),
  );
  protected readonly totals = computed(() =>
    cartTotals(this.cart(), {
      ...this.totalsOptions(),
      shipping: this.selectedMethod()?.price ?? null,
    }),
  );
  protected readonly issueMessages = computed(() =>
    this.issues().map((issue) => this.labels.checkoutIssue(issue)),
  );
  protected readonly postalCodeErrors = computed(() => ({
    postalCode: this.labels.checkoutPostalCodeInvalid,
  }));

  constructor() {
    // Keep a valid country and shipping method as the inputs change.
    effect(() => {
      const countries = this.countries();
      untracked(() => {
        const control = this.form.controls.country;
        if (!countries.some((country) => country.code === control.value)) {
          control.setValue(countries[0]?.code ?? '');
        }
      });
    });
    effect(() => {
      const methods = this.shippingMethods();
      untracked(() => {
        const control = this.form.controls.shippingMethodId;
        if (!methods.some((method) => method.id === control.value)) {
          control.setValue(methods[0]?.id ?? '');
        }
      });
    });
    this.form.controls.country.valueChanges.subscribe(() =>
      this.form.controls.postalCode.updateValueAndValidity(),
    );
  }

  /** "Free" when the cart's discounts or threshold waive the method, otherwise its price. */
  protected methodPrice(method: ShippingMethod): string {
    const waived = cartTotals(this.cart(), {
      ...this.totalsOptions(),
      shipping: method.price,
    }).shippingFree;
    return waived || method.price.amount === 0
      ? this.labels.summaryShippingFree
      : formatMoney(method.price, this.locale());
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      queueMicrotask(() =>
        this.#host
          .querySelector<HTMLElement>(
            'input.ng-invalid, select.ng-invalid, textarea.ng-invalid',
          )
          ?.focus(),
      );
      return;
    }

    const value = this.form.getRawValue();
    const details: CheckoutDetails = {
      email: value.email.trim(),
      ...(value.phone.trim() ? { phone: value.phone.trim() } : {}),
      address: {
        name: value.name.trim(),
        line1: value.line1.trim(),
        ...(value.line2.trim() ? { line2: value.line2.trim() } : {}),
        postalCode: value.postalCode.trim(),
        city: value.city.trim(),
        ...(value.region.trim() ? { region: value.region.trim() } : {}),
        country: value.country,
      },
      shippingMethodId: value.shippingMethodId,
      ...(value.notes.trim() ? { notes: value.notes.trim() } : {}),
    };

    const issues = validateCheckout(details, {
      methods: this.shippingMethods(),
      cart: this.cart(),
    });
    this.issues.set(issues);
    const method = this.selectedMethod();
    if (issues.length > 0 || !method) return;

    this.placeOrder.emit({
      details,
      shippingMethod: method,
      lines: this.cart().lines,
      ...(this.cart().coupon ? { coupon: this.cart().coupon } : {}),
      totals: this.totals(),
    });
  }

  #postalCode(control: AbstractControl): ValidationErrors | null {
    const country = this.form?.controls.country.value ?? '';
    if (!control.value || !country) return null;
    return isValidPostalCode(country, control.value)
      ? null
      : { postalCode: true };
  }
}
