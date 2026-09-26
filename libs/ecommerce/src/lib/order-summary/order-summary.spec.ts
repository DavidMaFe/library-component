import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { applyCoupon, cartTotals, CartTotals } from '../domain/cart';
import { money } from '../domain/money';
import { provideLcEcommerceLabels } from '../labels/ecommerce-labels';
import { cartWithCoupon, sampleCart } from '../testing/sample-data';
import { LcOrderSummary } from './order-summary';

@Component({
  imports: [LcOrderSummary],
  template: `
    <lc-order-summary
      [totals]="totals()"
      [couponCode]="code()"
      [shippingPending]="pending()"
      [pricesIncludeTax]="includeTax()"
      [headingLevel]="3"
      locale="en-US"
    />
  `,
})
class HostComponent {
  totals = signal<CartTotals>(
    cartTotals(sampleCart, { shipping: money(495), taxRate: 21 }),
  );
  code = signal<string | undefined>(undefined);
  pending = signal(false);
  includeTax = signal(true);
}

describe('LcOrderSummary', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const rows = () =>
      Object.fromEntries(
        Array.from(root.querySelectorAll('.row')).map((row) => [
          row.querySelector('dt')?.textContent?.trim(),
          row.querySelector('dd')?.textContent?.replace(/\s+/g, ' ').trim(),
        ]),
      );
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      rows,
      update: () => fixture.whenStable(),
    };
  };

  it('should list subtotal, shipping, included tax and total', async () => {
    const { rows } = await setup();

    // subtotal 4500 + 2 * 1200 = 6900; shipping 495; total 7395; tax inside = 7395 * 21 / 121 = 1283.39
    expect(rows()).toMatchObject({
      Subtotal: '€69.00',
      Shipping: '€4.95',
      'Includes tax': '€12.83',
      Total: '€73.95',
    });
  });

  it('should hide the discount row when there is no discount', async () => {
    const { rows } = await setup();

    expect(Object.keys(rows())).not.toContain('Discount');
  });

  it('should show the discount with its code', async () => {
    const { host, rows, update } = await setup();

    host.totals.set(cartTotals(cartWithCoupon, { shipping: money(495) }));
    host.code.set('WELCOME10');
    await update();

    expect(rows()['Discount (WELCOME10)']).toBe('−€6.90');
  });

  it('should say when shipping is free', async () => {
    const { fixture, host, rows, update } = await setup();

    host.totals.set(
      cartTotals(
        applyCoupon(sampleCart, { code: 'S', kind: 'free-shipping' }),
        { shipping: money(495) },
      ),
    );
    await update();

    expect(rows()['Shipping']).toBe('Free');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.free')
        ?.textContent,
    ).toBe('Free');
  });

  it('should hint that shipping is not calculated yet', async () => {
    const { host, rows, update } = await setup();

    host.pending.set(true);
    await update();

    expect(rows()['Shipping']).toBe('Calculated at checkout');
  });

  it('should label the tax as added when prices exclude it', async () => {
    const { host, rows, update } = await setup();

    host.totals.set(
      cartTotals(sampleCart, { taxRate: 21, pricesIncludeTax: false }),
    );
    host.includeTax.set(false);
    await update();

    expect(Object.keys(rows())).toContain('Tax');
    expect(rows()['Total']).toBe('€83.49');
  });

  it('should hide the tax row when there is no tax', async () => {
    const { host, rows, update } = await setup();

    host.totals.set(cartTotals(sampleCart));
    await update();

    expect(Object.keys(rows())).toEqual(['Subtotal', 'Shipping', 'Total']);
  });

  it('should be a labelled section with the requested heading level', async () => {
    const { root } = await setup();

    const heading = root.querySelector('[role="heading"]') as HTMLElement;
    expect(heading.getAttribute('aria-level')).toBe('3');
    expect(root.querySelector('section')?.getAttribute('aria-labelledby')).toBe(
      heading.id,
    );
  });

  it('should use translated labels', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideLcEcommerceLabels({
          summaryTotal: 'Total a pagar',
          summarySubtotal: 'Subtotal',
        }),
      ],
    });
    const { rows } = await setup();

    expect(Object.keys(rows())).toContain('Total a pagar');
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
