import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { applyCoupon, Cart, emptyCart, TotalsOptions } from '../domain/cart';
import { money } from '../domain/money';
import { provideLcEcommerceLabels } from '../labels/ecommerce-labels';
import { cartWithCoupon, sampleCart } from '../testing/sample-data';
import { CartQuantityChange, LcCart } from './cart';

@Component({
  imports: [LcCart],
  template: `
    <lc-cart
      [cart]="cart()"
      [totalsOptions]="options()"
      [couponMessage]="message()"
      [couponMessageKind]="kind()"
      [checkoutEnabled]="checkoutEnabled()"
      locale="en-US"
      (quantityChange)="changes.push($event)"
      (remove)="removed.push($event)"
      (applyCoupon)="codes.push($event)"
      (removeCoupon)="couponRemoved = couponRemoved + 1"
      (checkout)="checkedOut = checkedOut + 1"
    >
      <a lcCartEmpty href="/shop" class="continue">Continue shopping</a>
    </lc-cart>
  `,
})
class HostComponent {
  cart = signal<Cart>(sampleCart);
  options = signal<TotalsOptions>({ shipping: money(495), taxRate: 21 });
  message = signal<string | undefined>(undefined);
  kind = signal<'error' | 'success'>('error');
  checkoutEnabled = signal(true);
  changes: CartQuantityChange[] = [];
  removed: string[] = [];
  codes: string[] = [];
  couponRemoved = 0;
  checkedOut = 0;
}

describe('LcCart', () => {
  const setup = async (
    configure: (host: HostComponent) => void = () => undefined,
  ) => {
    const fixture = TestBed.createComponent(HostComponent);
    configure(fixture.componentInstance);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      lines: () => Array.from(root.querySelectorAll<HTMLElement>('.line')),
      text: (selector: string) =>
        root.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim(),
      codeInput: () => root.querySelector('.coupon input') as HTMLInputElement,
      update: () => fixture.whenStable(),
    };
  };

  describe('lines', () => {
    it('should title the cart with the number of items', async () => {
      const { text } = await setup();

      expect(text('.title')).toBe('Your cart (3 items)');
    });

    it('should render each line with name, variant, prices and image', async () => {
      const { lines } = await setup();

      const [shirt, mug] = lines();
      expect(shirt.querySelector('.name')?.textContent).toBe('Linen shirt');
      expect(shirt.querySelector('.variant')?.textContent).toBe('M / Navy');
      expect(shirt.querySelector('.unit')?.textContent).toContain('€45.00');
      expect(shirt.querySelector('img')?.getAttribute('alt')).toBe(
        'Linen shirt',
      );
      expect(mug.querySelector('.variant')).toBeNull();
      expect(mug.querySelector('.total')?.textContent).toContain('€24.00');
    });

    it('should emit the line key and quantity when the quantity changes', async () => {
      const { host, lines, update } = await setup();
      const input = lines()[1].querySelector('input') as HTMLInputElement;

      input.value = '5';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await update();

      expect(host.changes).toEqual([{ key: 'mug', quantity: 5 }]);
    });

    it('should cap the quantity at the line stock limit', async () => {
      const { host, lines, update } = await setup();
      const input = lines()[0].querySelector('input') as HTMLInputElement;

      input.value = '50';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await update();

      expect(host.changes).toEqual([{ key: 'shirt:m-navy', quantity: 8 }]);
    });

    it('should emit the key to remove a line', async () => {
      const { host, lines } = await setup();

      lines()[0].querySelector<HTMLButtonElement>('.remove')?.click();

      expect(host.removed).toEqual(['shirt:m-navy']);
    });

    it('should name the remove button after the product', async () => {
      const { lines } = await setup();

      expect(
        lines()[1].querySelector('.remove')?.getAttribute('aria-label'),
      ).toBe('Remove Ceramic mug');
    });

    it('should use a list', async () => {
      const { root } = await setup();

      expect(root.querySelectorAll('ul.lines > li')).toHaveLength(2);
    });
  });

  describe('empty cart', () => {
    it('should show the empty message and the projected content', async () => {
      const { root, text } = await setup((host) => host.cart.set(emptyCart()));

      expect(text('.empty')).toContain('Your cart is empty.');
      expect(root.querySelector('.continue')?.textContent).toBe(
        'Continue shopping',
      );
      expect(root.querySelector('.lines')).toBeNull();
      expect(root.querySelector('lc-order-summary')).toBeNull();
    });
  });

  describe('summary', () => {
    it('should show the totals with shipping and tax', async () => {
      const { text } = await setup();

      expect(text('.total lc-order-summary, lc-order-summary')).toContain(
        '€73.95',
      );
    });

    it('should say shipping is calculated later when there is no shipping cost yet', async () => {
      const { text } = await setup((host) => host.options.set({ taxRate: 21 }));

      expect(text('lc-order-summary')).toContain('Calculated at checkout');
    });

    it('should use the heading level below the cart title', async () => {
      const { root } = await setup();

      const levels = Array.from(root.querySelectorAll('[role="heading"]')).map(
        (h) => h.getAttribute('aria-level'),
      );
      expect(levels).toEqual(['2', '3']);
    });
  });

  describe('coupon', () => {
    it('should emit the trimmed code', async () => {
      const { host, codeInput, root } = await setup();
      codeInput().value = '  SAVE10  ';

      root
        .querySelector('.coupon')
        ?.dispatchEvent(new Event('submit', { cancelable: true }));

      expect(host.codes).toEqual(['SAVE10']);
    });

    it('should not emit an empty code', async () => {
      const { host, codeInput, root } = await setup();
      codeInput().value = '   ';

      root
        .querySelector('.coupon')
        ?.dispatchEvent(new Event('submit', { cancelable: true }));

      expect(host.codes).toEqual([]);
    });

    it('should show the applied code and let the shopper remove it', async () => {
      const { host, root, text } = await setup((h) =>
        h.cart.set(cartWithCoupon),
      );

      expect(text('.applied')).toContain('Code WELCOME10 applied');
      expect(root.querySelector('.coupon')).toBeNull();
      expect(text('lc-order-summary')).toContain('Discount (WELCOME10)');
      root.querySelector<HTMLButtonElement>('.applied .link')?.click();

      expect(host.couponRemoved).toBe(1);
    });

    it('should show an error from the server and mark the field invalid', async () => {
      const { root, codeInput, update, host } = await setup();

      host.message.set('This code has expired.');
      await update();

      expect(root.querySelector('.coupon-error')?.textContent).toBe(
        'This code has expired.',
      );
      expect(root.querySelector('.coupon-error')?.getAttribute('role')).toBe(
        'alert',
      );
      expect(codeInput().getAttribute('aria-invalid')).toBe('true');
    });

    it('should show a success message as a hint', async () => {
      const { root, update, host } = await setup();

      host.kind.set('success');
      host.message.set('Nice, you save 10%.');
      await update();

      expect(root.querySelector('.hint')?.textContent).toContain(
        'Nice, you save 10%.',
      );
      expect(root.querySelector('.coupon-error')).toBeNull();
    });

    it('should ignore an applied coupon that is a fixed amount without breaking totals', async () => {
      const { text } = await setup((host) =>
        host.cart.set(
          applyCoupon(sampleCart, {
            code: 'FIVE',
            kind: 'fixed',
            amount: money(500),
          }),
        ),
      );

      expect(text('lc-order-summary')).toContain('Discount (FIVE)');
    });
  });

  describe('checkout', () => {
    it('should emit checkout', async () => {
      const { host, root } = await setup();

      root.querySelector<HTMLButtonElement>('aside > button')?.click();

      expect(host.checkedOut).toBe(1);
    });

    it('should hide the checkout button when disabled', async () => {
      const { root } = await setup((host) => host.checkoutEnabled.set(false));

      expect(root.querySelector('aside > button')).toBeNull();
    });
  });

  it('should use translated labels', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideLcEcommerceLabels({
          cartTitle: (n) => `Tu carrito (${n})`,
          cartCheckout: 'Tramitar pedido',
        }),
      ],
    });
    const { text, root } = await setup();

    expect(text('.title')).toBe('Tu carrito (3)');
    expect(root.querySelector('aside > button')?.textContent).toContain(
      'Tramitar pedido',
    );
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup((host) => host.message.set('Invalid code'));

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });

  it('should have no accessibility violations when empty', async () => {
    const { fixture } = await setup((host) => host.cart.set(emptyCart()));

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
