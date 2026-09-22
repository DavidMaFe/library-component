import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { applyCoupon } from '../domain/cart';
import { Order } from '../domain/checkout';
import { money } from '../domain/money';
import { sampleCart, shippingMethods } from '../testing/sample-data';
import { LcCheckoutForm } from './checkout-form';

interface CheckoutArgs {
  freeShipping: boolean;
  submitting: boolean;
}

// `component` is deliberately not set (see the tooltip story in @lc/ui).
const meta: Meta<CheckoutArgs> = {
  title: 'Ecommerce/Checkout form',
  decorators: [moduleMetadata({ imports: [LcCheckoutForm] })],
  parameters: { layout: 'padded' },
  args: { freeShipping: false, submitting: false },
  render: (args) => ({
    props: {
      submitting: args.submitting,
      cart: args.freeShipping
        ? applyCoupon(sampleCart, { code: 'SHIPFREE', kind: 'free-shipping' })
        : sampleCart,
      methods: shippingMethods,
      options: { taxRate: 21, freeShippingThreshold: money(20000) },
      order: null as Order | null,
      placed(order: Order) {
        (this as { order: Order | null }).order = order;
      },
    },
    template: `
      <lc-checkout-form [cart]="cart" [shippingMethods]="methods" [totalsOptions]="options" [submitting]="submitting" (placeOrder)="placed($event)">
        <div lcCheckoutPayment style="padding:1rem;border:1px dashed var(--lc-color-border-strong);border-radius:var(--lc-radius-md);color:var(--lc-color-text-muted)">
          Your payment provider's widget goes here. This library never handles card data.
        </div>
      </lc-checkout-form>
      @if (order) {
        <pre style="margin-top:1rem;padding:1rem;background:var(--lc-color-bg-subtle);border-radius:var(--lc-radius-md);overflow:auto">{{ order.details | json }}</pre>
      }`,
  }),
};
export default meta;

type Story = StoryObj<CheckoutArgs>;

/** Validates on submit and emits the order; payment is up to your provider. */
export const Default: Story = {};
export const FreeShippingCoupon: Story = { args: { freeShipping: true } };
export const Submitting: Story = { args: { submitting: true } };
