import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcSize } from '../shared/ui.types';
import { LcSpinner } from './spinner';

@Component({
  imports: [LcSpinner],
  template: `<lc-spinner
    [size]="size()"
    [label]="label()"
    [decorative]="decorative()"
  />`,
})
class HostComponent {
  size = signal<LcSize>('md');
  label = signal('Loading');
  decorative = signal(false);
}

describe('LcSpinner', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const spinner = fixture.nativeElement.querySelector(
      'lc-spinner',
    ) as HTMLElement;
    return { fixture, spinner };
  };

  it('should announce itself as a status with the default label', async () => {
    const { spinner } = await setup();

    expect(spinner.getAttribute('role')).toBe('status');
    expect(spinner.textContent).toContain('Loading');
    expect(spinner.hasAttribute('aria-hidden')).toBe(false);
  });

  it('should use a custom label', async () => {
    const { fixture, spinner } = await setup();

    fixture.componentInstance.label.set('Saving order');
    await fixture.whenStable();

    expect(spinner.textContent).toContain('Saving order');
  });

  it('should be hidden from assistive technology when decorative', async () => {
    const { fixture, spinner } = await setup();

    fixture.componentInstance.decorative.set(true);
    await fixture.whenStable();

    expect(spinner.hasAttribute('role')).toBe(false);
    expect(spinner.getAttribute('aria-hidden')).toBe('true');
    expect(spinner.textContent?.trim()).toBe('');
  });

  it('should expose the size as a data attribute', async () => {
    const { fixture, spinner } = await setup();

    fixture.componentInstance.size.set('lg');
    await fixture.whenStable();

    expect(spinner.getAttribute('data-size')).toBe('lg');
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
