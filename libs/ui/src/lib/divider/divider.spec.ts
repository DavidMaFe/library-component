import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcDivider, LcDividerOrientation } from './divider';

@Component({
  imports: [LcDivider],
  template: `<lc-divider
    [orientation]="orientation()"
    [decorative]="decorative()"
  />`,
})
class HostComponent {
  orientation = signal<LcDividerOrientation>('horizontal');
  decorative = signal(false);
}

describe('LcDivider', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    return {
      fixture,
      host: fixture.componentInstance,
      divider: fixture.nativeElement.querySelector('lc-divider') as HTMLElement,
    };
  };

  it('should be a horizontal separator by default', async () => {
    const { divider } = await setup();

    expect(divider.getAttribute('role')).toBe('separator');
    expect(divider.getAttribute('data-orientation')).toBe('horizontal');
    expect(divider.hasAttribute('aria-orientation')).toBe(false);
  });

  it('should expose vertical orientation to assistive technology', async () => {
    const { fixture, host, divider } = await setup();

    host.orientation.set('vertical');
    await fixture.whenStable();

    expect(divider.getAttribute('aria-orientation')).toBe('vertical');
    expect(divider.getAttribute('data-orientation')).toBe('vertical');
  });

  it('should be removed from the accessibility tree when decorative', async () => {
    const { fixture, host, divider } = await setup();
    host.orientation.set('vertical');

    host.decorative.set(true);
    await fixture.whenStable();

    expect(divider.getAttribute('role')).toBe('none');
    expect(divider.hasAttribute('aria-orientation')).toBe(false);
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
