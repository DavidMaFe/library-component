import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import {
  LcBadge,
  LcBadgeAppearance,
  LcBadgeSize,
  LcBadgeVariant,
} from './badge';

@Component({
  imports: [LcBadge],
  template: `<lc-badge
    [variant]="variant()"
    [appearance]="appearance()"
    [size]="size()"
    >New</lc-badge
  >`,
})
class HostComponent {
  variant = signal<LcBadgeVariant>('neutral');
  appearance = signal<LcBadgeAppearance>('subtle');
  size = signal<LcBadgeSize>('md');
}

describe('LcBadge', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    return {
      fixture,
      host: fixture.componentInstance,
      badge: fixture.nativeElement.querySelector('lc-badge') as HTMLElement,
    };
  };

  it('should default to a neutral subtle medium badge', async () => {
    const { badge } = await setup();

    expect(badge.getAttribute('data-variant')).toBe('neutral');
    expect(badge.getAttribute('data-appearance')).toBe('subtle');
    expect(badge.getAttribute('data-size')).toBe('md');
  });

  it('should project its content', async () => {
    const { badge } = await setup();

    expect(badge.textContent).toBe('New');
  });

  it('should reflect variant, appearance and size', async () => {
    const { fixture, host, badge } = await setup();

    host.variant.set('success');
    host.appearance.set('solid');
    host.size.set('sm');
    await fixture.whenStable();

    expect(badge.getAttribute('data-variant')).toBe('success');
    expect(badge.getAttribute('data-appearance')).toBe('solid');
    expect(badge.getAttribute('data-size')).toBe('sm');
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
