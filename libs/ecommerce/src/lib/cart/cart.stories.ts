import { Component, input, linkedSignal, signal } from '@angular/core';
import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import {
  applyCoupon,
  Cart,
  emptyCart,
  removeLine,
  setQuantity,
} from '../domain/cart';
import { money } from '../domain/money';
import { sampleCart } from '../testing/sample-data';
import { CartQuantityChange, LcCart } from './cart';

/** A controlled cart: the component only reports what happened; the app updates the cart with the domain functions. */
@Component({
  selector: 'lc-cart-demo',
  imports: [LcCart],
  template: `
    <lc-cart
      [cart]="cart()"
      [totalsOptions]="{
        shipping: shipping,
        freeShippingThreshold: threshold,
        taxRate: 21,
      }"
      [couponMessage]="message()"
      (quantityChange)="change($event)"
      (remove)="cart.set(remove($event))"
      (applyCoupon)="apply($event)"
      (removeCoupon)="cart.set(clear())"
      (checkout)="checkedOut.set(true)"
    >
      <a lcCartEmpty href="#shop">Continue shopping</a>
    </lc-cart>
    @if (checkedOut()) {
      <p style="margin-top:1rem">Checkout requested.</p>
    }
  `,
})
class CartDemo {
  /** Cart the demo starts from. */
  readonly start = input<Cart>(sampleCart);
  protected readonly cart = linkedSignal<Cart>(() => this.start());
  protected readonly message = signal<string | undefined>(undefined);
  protected readonly checkedOut = signal(false);
  protected readonly shipping = money(495);
  protected readonly threshold = money(10000);

  protected change({ key, quantity }: CartQuantityChange): void {
    this.cart.set(setQuantity(this.cart(), key, quantity));
  }

  protected remove(key: string): Cart {
    return removeLine(this.cart(), key);
  }

  protected clear(): Cart {
    return applyCoupon(this.cart(), undefined);
  }

  protected apply(code: string): void {
    if (code.toUpperCase() === 'WELCOME10') {
      this.cart.set(
        applyCoupon(this.cart(), {
          code: 'WELCOME10',
          kind: 'percentage',
          percent: 10,
        }),
      );
      this.message.set(undefined);
    } else {
      this.message.set(`"${code}" is not a valid code. Try WELCOME10.`);
    }
  }
}

const meta: Meta<CartDemo> = {
  title: 'Ecommerce/Cart',
  component: CartDemo,
  decorators: [moduleMetadata({ imports: [CartDemo] })],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<CartDemo>;

/** Change quantities, remove lines and try the code WELCOME10. Free shipping starts at 100 €. */
export const Interactive: Story = {};

export const Empty: Story = {
  render: () => ({
    // Not named `cart`: Storybook copies props onto the component instance.
    props: { initialCart: emptyCart() },
    template: `<lc-cart-demo [start]="initialCart" />`,
  }),
  play: undefined,
};
