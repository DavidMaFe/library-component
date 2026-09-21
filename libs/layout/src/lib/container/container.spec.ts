import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcContainer, LcContainerSize } from './container';

@Component({
  imports: [LcContainer],
  template: `<lc-container [size]="size()"><p>Content</p></lc-container>`,
})
class HostComponent {
  size = signal<LcContainerSize>('lg');
}

describe('LcContainer', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    return {
      fixture,
      host: fixture.componentInstance,
      container: fixture.nativeElement.querySelector(
        'lc-container',
      ) as HTMLElement,
    };
  };

  it('should default to the large size', async () => {
    const { container } = await setup();

    expect(container.getAttribute('data-size')).toBe('lg');
  });

  it('should project its content', async () => {
    const { container } = await setup();

    expect(container.textContent).toContain('Content');
  });

  it('should reflect the size', async () => {
    const { fixture, host, container } = await setup();

    host.size.set('xl');
    await fixture.whenStable();

    expect(container.getAttribute('data-size')).toBe('xl');
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
