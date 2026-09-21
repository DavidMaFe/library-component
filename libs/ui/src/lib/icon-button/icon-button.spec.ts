import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcIconButton, LcIconButtonShape } from './icon-button';

@Component({
  imports: [LcIconButton],
  template: `
    <button
      lc-icon-button
      [label]="label()"
      [shape]="shape()"
      [loading]="loading()"
      [disabled]="disabled()"
      (click)="clicks = clicks + 1"
    >
      <svg aria-hidden="true" width="16" height="16">
        <path d="M0 0h16v16H0z" />
      </svg>
    </button>
  `,
})
class HostComponent {
  label = signal('Add to cart');
  shape = signal<LcIconButtonShape>('square');
  loading = signal(false);
  disabled = signal(false);
  clicks = 0;
}

describe('LcIconButton', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    return { fixture, host: fixture.componentInstance, button };
  };

  it('should use the label as its accessible name', async () => {
    const { fixture, host, button } = await setup();
    expect(button.getAttribute('aria-label')).toBe('Add to cart');

    host.label.set('Remove');
    await fixture.whenStable();

    expect(button.getAttribute('aria-label')).toBe('Remove');
  });

  it('should project the icon', async () => {
    const { button } = await setup();

    expect(button.querySelector('svg')).not.toBeNull();
  });

  it('should reflect the shape', async () => {
    const { fixture, host, button } = await setup();
    expect(button.getAttribute('data-shape')).toBe('square');

    host.shape.set('round');
    await fixture.whenStable();

    expect(button.getAttribute('data-shape')).toBe('round');
  });

  it('should replace the icon with a spinner while loading', async () => {
    const { fixture, host, button } = await setup();

    host.loading.set(true);
    await fixture.whenStable();

    expect(button.querySelector('svg[viewBox]')).not.toBeNull();
    expect(button.querySelector('lc-spinner')).not.toBeNull();
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('should block clicks when disabled or loading', async () => {
    const { fixture, host, button } = await setup();
    host.loading.set(true);
    await fixture.whenStable();
    button.click();
    host.loading.set(false);
    host.disabled.set(true);
    await fixture.whenStable();
    button.click();

    expect(host.clicks).toBe(0);
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
