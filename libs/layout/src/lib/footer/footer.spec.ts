import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcFooter } from './footer';

@Component({
  imports: [LcFooter],
  template: `
    <lc-footer>
      <p>Via Roma 1</p>
      <small lcFooterLegal>© 2026 Trattoria</small>
    </lc-footer>
  `,
})
class HostComponent {}

describe('LcFooter', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  };

  it('should render a footer landmark', async () => {
    const { root } = await setup();

    expect(root.querySelector('footer')).not.toBeNull();
  });

  it('should project the main content and the legal strip separately', async () => {
    const { root } = await setup();

    expect(root.querySelector('.content')?.textContent).toContain('Via Roma 1');
    expect(root.querySelector('.legal')?.textContent).toContain(
      '© 2026 Trattoria',
    );
    expect(root.querySelector('.content')?.textContent).not.toContain('©');
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
