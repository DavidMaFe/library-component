import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { provideLcEcommerceLabels } from '../labels/ecommerce-labels';
import { LcQuantityStepper, LcQuantityStepperSize } from './quantity-stepper';

@Component({
  imports: [LcQuantityStepper],
  template: `
    <lc-quantity-stepper
      label="Quantity of Mug"
      [(value)]="value"
      [min]="min()"
      [max]="max()"
      [disabled]="disabled()"
      [size]="size()"
    />
  `,
})
class HostComponent {
  value = signal(2);
  min = signal(1);
  max = signal<number | undefined>(5);
  disabled = signal(false);
  size = signal<LcQuantityStepperSize>('md');
}

describe('LcQuantityStepper', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      input: () => root.querySelector('input') as HTMLInputElement,
      minus: () => root.querySelectorAll('button')[0] as HTMLButtonElement,
      plus: () => root.querySelectorAll('button')[1] as HTMLButtonElement,
      update: () => fixture.whenStable(),
    };
  };

  const type = (input: HTMLInputElement, value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  it('should show the value in a labelled group', async () => {
    const { root, input } = await setup();

    expect(input().value).toBe('2');
    expect(
      root.querySelector('[role="group"]')?.getAttribute('aria-label'),
    ).toBe('Quantity of Mug');
    expect(input().getAttribute('aria-label')).toBe('Quantity of Mug');
  });

  it('should step up and down', async () => {
    const { host, plus, minus, update } = await setup();

    plus().click();
    await update();
    expect(host.value()).toBe(3);

    minus().click();
    minus().click();
    await update();
    expect(host.value()).toBe(1);
  });

  it('should disable the buttons at the limits', async () => {
    const { host, plus, minus, update } = await setup();

    host.value.set(1);
    await update();
    expect(minus().disabled).toBe(true);
    expect(plus().disabled).toBe(false);

    host.value.set(5);
    await update();
    expect(plus().disabled).toBe(true);
    expect(minus().disabled).toBe(false);
  });

  it('should have no upper limit when max is unset', async () => {
    const { host, plus, update } = await setup();

    host.max.set(undefined);
    host.value.set(500);
    await update();

    expect(plus().disabled).toBe(false);
  });

  it('should clamp a typed value to the limits and show it', async () => {
    const { host, input, update } = await setup();

    type(input(), '99');
    await update();
    expect(host.value()).toBe(5);
    expect(input().value).toBe('5');

    type(input(), '-3');
    await update();
    expect(host.value()).toBe(1);
    expect(input().value).toBe('1');
  });

  it('should floor fractions and ignore text', async () => {
    const { host, input, update } = await setup();

    type(input(), '3.9');
    await update();
    expect(host.value()).toBe(3);

    type(input(), 'abc');
    await update();
    expect(host.value()).toBe(3);
    expect(input().value).toBe('3');
  });

  it('should disable everything when disabled', async () => {
    const { host, input, plus, minus, update } = await setup();

    host.disabled.set(true);
    await update();

    expect([input().disabled, plus().disabled, minus().disabled]).toEqual([
      true,
      true,
      true,
    ]);
  });

  it('should name the buttons with translatable labels', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideLcEcommerceLabels({
          quantityIncrease: 'Más',
          quantityDecrease: 'Menos',
        }),
      ],
    });
    const { plus, minus } = await setup();

    expect(plus().getAttribute('aria-label')).toBe('Más');
    expect(minus().getAttribute('aria-label')).toBe('Menos');
  });

  it('should default to the medium size and reflect the large one', async () => {
    const { host, root, update } = await setup();
    const stepper = root.querySelector('lc-quantity-stepper') as HTMLElement;

    expect(stepper.getAttribute('data-size')).toBe('md');

    host.size.set('lg');
    await update();

    expect(stepper.getAttribute('data-size')).toBe('lg');
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
