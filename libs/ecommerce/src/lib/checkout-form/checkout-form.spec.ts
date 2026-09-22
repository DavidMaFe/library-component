import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { applyCoupon, Cart, emptyCart } from '../domain/cart';
import { Order } from '../domain/checkout';
import { money } from '../domain/money';
import { provideLcEcommerceLabels } from '../labels/ecommerce-labels';
import { sampleCart, shippingMethods } from '../testing/sample-data';
import { LcCheckoutForm } from './checkout-form';

@Component({
  imports: [LcCheckoutForm],
  template: `
    <lc-checkout-form
      [cart]="cart()"
      [shippingMethods]="methods()"
      [totalsOptions]="options()"
      [submitting]="submitting()"
      locale="en-US"
      (placeOrder)="orders.push($event)"
    >
      <div lcCheckoutPayment id="payment-slot">Payment widget goes here</div>
    </lc-checkout-form>
  `,
})
class HostComponent {
  cart = signal<Cart>(sampleCart);
  methods = signal(shippingMethods);
  options = signal({ taxRate: 21 });
  submitting = signal(false);
  orders: Order[] = [];
}

const type = (
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) => {
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('LcCheckoutForm', () => {
  const setup = async (
    configure: (host: HostComponent) => void = () => undefined,
  ) => {
    const fixture = TestBed.createComponent(HostComponent);
    configure(fixture.componentInstance);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const field = (name: string) =>
      root.querySelector(`[formcontrolname="${name}"]`) as HTMLInputElement &
        HTMLSelectElement;
    const api = {
      fixture,
      host: fixture.componentInstance,
      root,
      field,
      submit: () =>
        root.querySelector('button[type="submit"]') as HTMLButtonElement,
      radios: () =>
        Array.from(root.querySelectorAll<HTMLInputElement>('lc-radio input')),
      summary: () =>
        root
          .querySelector('lc-order-summary')
          ?.textContent?.replace(/\s+/g, ' ')
          .trim(),
      update: () => fixture.whenStable(),
      fillValid: async () => {
        type(field('email'), 'ana@example.com');
        type(field('name'), '  Ana Ruiz ');
        type(field('line1'), 'Calle Mayor 1');
        type(field('postalCode'), '28013');
        type(field('city'), 'Madrid');
        await fixture.whenStable();
      },
    };
    return api;
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('defaults', () => {
    it('should preselect the first country and shipping method', async () => {
      const { field, radios } = await setup();

      expect(field('country').value).toBe('ES');
      expect(radios()[0].checked).toBe(true);
    });

    it('should list the countries', async () => {
      const { field } = await setup();

      expect(field('country').options.length).toBeGreaterThanOrEqual(5);
      expect(field('country').options[0].textContent).toBe('Spain');
    });

    it('should show the shipping methods with their prices', async () => {
      const { root } = await setup();

      const rows = Array.from(root.querySelectorAll('lc-radio')).map((r) =>
        r.textContent?.replace(/\s+/g, ' ').trim(),
      );
      expect(rows[0]).toContain('Standard');
      expect(rows[0]).toContain('€4.95');
      expect(rows[0]).toContain('3-5 business days');
      expect(rows[1]).toContain('€12.95');
      expect(rows[2]).toContain('Store pickup');
      expect(rows[2]).toContain('Free');
    });

    it('should keep the selection valid when the methods change', async () => {
      const { host, radios, update } = await setup();

      host.methods.set([shippingMethods[1]]);
      await update();

      expect(radios()).toHaveLength(1);
      expect(radios()[0].checked).toBe(true);
    });

    it('should project the payment slot', async () => {
      const { root } = await setup();

      expect(root.querySelector('.payment #payment-slot')?.textContent).toBe(
        'Payment widget goes here',
      );
    });
  });

  describe('summary', () => {
    it('should include the chosen shipping method in the total', async () => {
      const { summary } = await setup();

      // 6900 goods + 495 standard shipping
      expect(summary()).toContain('€73.95');
    });

    it('should update when another method is chosen', async () => {
      const { radios, summary, update } = await setup();

      radios()[1].click();
      await update();

      expect(summary()).toContain('€81.95'); // 6900 + 1295
    });

    it('should show free shipping when a coupon waives it', async () => {
      const { host, summary, root, update } = await setup();

      host.cart.set(
        applyCoupon(sampleCart, { code: 'SHIP', kind: 'free-shipping' }),
      );
      await update();

      expect(summary()).toContain('Free');
      expect(root.querySelector('lc-radio .method-price')?.textContent).toBe(
        'Free',
      );
    });
  });

  describe('validation', () => {
    it('should not emit and should show errors when the form is incomplete', async () => {
      const { host, submit, update, root } = await setup();

      submit().click();
      await update();

      expect(host.orders).toEqual([]);
      expect(
        Array.from(root.querySelectorAll('.error p')).map((p) => p.textContent),
      ).toContain('This field is required.');
    });

    it('should focus the first invalid field', async () => {
      const { submit, update, field } = await setup();

      submit().click();
      await update();
      await Promise.resolve();

      expect(document.activeElement).toBe(field('email'));
    });

    it('should reject a postal code that does not fit the country', async () => {
      const { host, fillValid, field, submit, update, root } = await setup();
      await fillValid();
      type(field('postalCode'), '123');
      await update();

      submit().click();
      await update();

      expect(host.orders).toEqual([]);
      expect(root.textContent).toContain(
        'Enter a valid postal code for the selected country.',
      );
    });

    it('should re-check the postal code when the country changes', async () => {
      const { fillValid, field, update, host, submit } = await setup();
      await fillValid();
      type(field('postalCode'), '1000-001');
      field('country').value = 'PT';
      field('country').dispatchEvent(new Event('change', { bubbles: true }));
      await update();

      submit().click();
      await update();

      expect(host.orders).toHaveLength(1);
      expect(host.orders[0].details.address.country).toBe('PT');
    });

    it('should reject an empty cart', async () => {
      const { host, fillValid, submit, update, root } = await setup();
      await fillValid();
      host.cart.set(emptyCart());
      await update();

      submit().click();
      await update();

      expect(host.orders).toEqual([]);
      expect(root.querySelector('.issues')?.textContent).toContain(
        'Your cart is empty.',
      );
    });
  });

  describe('placing the order', () => {
    it('should emit the order with details, lines and totals', async () => {
      const { host, fillValid, submit, update } = await setup();
      await fillValid();

      submit().click();
      await update();

      expect(host.orders).toHaveLength(1);
      const order = host.orders[0];
      expect(order.details).toEqual({
        email: 'ana@example.com',
        address: {
          name: 'Ana Ruiz',
          line1: 'Calle Mayor 1',
          postalCode: '28013',
          city: 'Madrid',
          country: 'ES',
        },
        shippingMethodId: 'standard',
      });
      expect(order.shippingMethod.id).toBe('standard');
      expect(order.lines).toEqual(sampleCart.lines);
      expect(order.totals.total).toEqual(money(7395));
      expect(order.coupon).toBeUndefined();
    });

    it('should include optional fields and the coupon when given', async () => {
      const { host, fillValid, field, submit, update } = await setup((h) =>
        h.cart.set(
          applyCoupon(sampleCart, {
            code: 'WELCOME10',
            kind: 'percentage',
            percent: 10,
          }),
        ),
      );
      await fillValid();
      type(field('phone'), '+34 600 000 000');
      type(field('line2'), '3B');
      type(field('region'), 'Madrid');
      type(field('notes'), 'Ring twice');
      await update();

      submit().click();
      await update();

      const order = host.orders[0];
      expect(order.details.phone).toBe('+34 600 000 000');
      expect(order.details.address.line2).toBe('3B');
      expect(order.details.address.region).toBe('Madrid');
      expect(order.details.notes).toBe('Ring twice');
      expect(order.coupon?.code).toBe('WELCOME10');
      expect(order.totals.discount).toEqual(money(690));
    });

    it('should emit the chosen shipping method', async () => {
      const { host, fillValid, radios, submit, update } = await setup();
      await fillValid();
      radios()[1].click();
      await update();

      submit().click();
      await update();

      expect(host.orders[0].shippingMethod.id).toBe('express');
      expect(host.orders[0].details.shippingMethodId).toBe('express');
    });

    it('should show the submit button as busy while submitting', async () => {
      const { host, submit, update } = await setup();

      host.submitting.set(true);
      await update();

      expect(submit().getAttribute('aria-busy')).toBe('true');
    });
  });

  it('should group fields in fieldsets with legends', async () => {
    const { root } = await setup();

    expect(
      Array.from(root.querySelectorAll('fieldset legend')).map((l) =>
        l.textContent?.trim(),
      ),
    ).toEqual(['Contact', 'Shipping address', 'Shipping method']);
  });

  it('should use translated labels', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideLcEcommerceLabels({
          checkoutPlaceOrder: 'Realizar pedido',
          checkoutContact: 'Contacto',
        }),
      ],
    });
    const { submit, root } = await setup();

    expect(submit().textContent).toContain('Realizar pedido');
    expect(root.querySelector('legend')?.textContent).toContain('Contacto');
  });

  it('should have no accessibility violations', async () => {
    const { fixture, submit, update } = await setup();
    submit().click();
    await update();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
