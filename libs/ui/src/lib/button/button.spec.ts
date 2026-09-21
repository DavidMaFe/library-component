import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcSize } from '../shared/ui.types';
import { LcButtonVariant } from './button-base';
import { LcButton } from './button';

@Component({
  imports: [LcButton],
  template: `
    <button
      lc-button
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
      [loading]="loading()"
      [block]="block()"
      (click)="clicks = clicks + 1"
    >
      Save
    </button>
    <a
      lc-button
      href="/menu"
      [disabled]="disabled()"
      (click)="clicks = clicks + 1"
      >Menu</a
    >
  `,
})
class HostComponent {
  variant = signal<LcButtonVariant>('primary');
  size = signal<LcSize>('md');
  disabled = signal(false);
  loading = signal(false);
  block = signal(false);
  clicks = 0;
}

describe('LcButton', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      button: root.querySelector('button') as HTMLButtonElement,
      link: root.querySelector('a') as HTMLAnchorElement,
    };
  };

  describe('appearance', () => {
    it('should default to a primary medium button', async () => {
      const { button } = await setup();

      expect(button.getAttribute('data-variant')).toBe('primary');
      expect(button.getAttribute('data-size')).toBe('md');
      expect(button.hasAttribute('data-block')).toBe(false);
    });

    it('should reflect variant, size and block', async () => {
      const { fixture, host, button } = await setup();

      host.variant.set('danger');
      host.size.set('lg');
      host.block.set(true);
      await fixture.whenStable();

      expect(button.getAttribute('data-variant')).toBe('danger');
      expect(button.getAttribute('data-size')).toBe('lg');
      expect(button.hasAttribute('data-block')).toBe(true);
    });

    it('should project its content', async () => {
      const { button } = await setup();

      expect(button.textContent?.trim()).toBe('Save');
    });
  });

  describe('disabled', () => {
    it('should set the native disabled attribute on buttons', async () => {
      const { fixture, host, button } = await setup();

      host.disabled.set(true);
      await fixture.whenStable();

      expect(button.disabled).toBe(true);
      expect(button.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not fire clicks when disabled', async () => {
      const { fixture, host, button } = await setup();
      host.disabled.set(true);
      await fixture.whenStable();

      button.click();

      expect(host.clicks).toBe(0);
    });

    it('should block clicks on disabled links using aria-disabled', async () => {
      const { fixture, host, link } = await setup();
      host.disabled.set(true);
      await fixture.whenStable();

      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      link.dispatchEvent(event);

      expect(link.getAttribute('aria-disabled')).toBe('true');
      expect(link.hasAttribute('disabled')).toBe(false);
      expect(event.defaultPrevented).toBe(true);
      expect(host.clicks).toBe(0);
    });

    it('should fire clicks when enabled', async () => {
      const { host, button } = await setup();

      button.click();

      expect(host.clicks).toBe(1);
    });
  });

  describe('loading', () => {
    it('should show a decorative spinner and mark the button busy', async () => {
      const { fixture, host, button } = await setup();

      host.loading.set(true);
      await fixture.whenStable();

      expect(button.getAttribute('aria-busy')).toBe('true');
      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(
        button.querySelector('lc-spinner')?.getAttribute('aria-hidden'),
      ).toBe('true');
    });

    it('should stay focusable and block clicks while loading', async () => {
      const { fixture, host, button } = await setup();
      host.loading.set(true);
      await fixture.whenStable();

      button.click();

      expect(button.disabled).toBe(false);
      expect(host.clicks).toBe(0);
    });

    it('should remove the spinner when loading ends', async () => {
      const { fixture, host, button } = await setup();
      host.loading.set(true);
      await fixture.whenStable();

      host.loading.set(false);
      await fixture.whenStable();

      expect(button.querySelector('lc-spinner')).toBeNull();
      expect(button.hasAttribute('aria-busy')).toBe(false);
    });
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
