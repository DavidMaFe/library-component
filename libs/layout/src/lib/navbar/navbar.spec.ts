import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcNavbar } from './navbar';

@Component({
  imports: [LcNavbar],
  template: `
    <lc-navbar [label]="label()" [sticky]="sticky()" toggleLabel="Menu">
      <a lcNavbarBrand href="/">Trattoria</a>
      <a id="menu-link" href="/menu">Menu</a>
      <a href="/book">Book</a>
      <button lcNavbarActions type="button">Order</button>
    </lc-navbar>
  `,
})
class HostComponent {
  label = signal('Main');
  sticky = signal(false);
}

describe('LcNavbar', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      navbar: root.querySelector('lc-navbar') as HTMLElement,
      toggle: root.querySelector('.toggle') as HTMLButtonElement,
      menu: root.querySelector('nav') as HTMLElement,
    };
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('structure', () => {
    it('should render a labelled navigation with the links', async () => {
      const { menu } = await setup();

      expect(menu.getAttribute('aria-label')).toBe('Main');
      expect(
        Array.from(menu.querySelectorAll('a')).map((a) => a.textContent),
      ).toEqual(['Menu', 'Book']);
    });

    it('should project the brand and actions into their areas', async () => {
      const { root } = await setup();

      expect(root.querySelector('.brand')?.textContent).toContain('Trattoria');
      expect(root.querySelector('.actions')?.textContent).toContain('Order');
      expect(root.querySelector('.menu')?.textContent).not.toContain(
        'Trattoria',
      );
    });

    it('should allow a translated label', async () => {
      const { fixture, host, menu } = await setup();

      host.label.set('Principal');
      await fixture.whenStable();

      expect(menu.getAttribute('aria-label')).toBe('Principal');
    });

    it('should reflect sticky', async () => {
      const { fixture, host, navbar } = await setup();
      expect(navbar.hasAttribute('data-sticky')).toBe(false);

      host.sticky.set(true);
      await fixture.whenStable();

      expect(navbar.hasAttribute('data-sticky')).toBe(true);
    });
  });

  describe('menu button', () => {
    it('should be collapsed initially and labelled', async () => {
      const { toggle, menu, navbar } = await setup();

      expect(toggle.getAttribute('aria-label')).toBe('Menu');
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(toggle.getAttribute('aria-controls')).toBe(menu.id);
      expect(navbar.hasAttribute('data-open')).toBe(false);
    });

    it('should open and close the menu', async () => {
      const { fixture, toggle, navbar } = await setup();

      toggle.click();
      await fixture.whenStable();
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(navbar.hasAttribute('data-open')).toBe(true);

      toggle.click();
      await fixture.whenStable();
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(navbar.hasAttribute('data-open')).toBe(false);
    });

    it('should close after choosing a link', async () => {
      const { fixture, root, toggle } = await setup();
      toggle.click();
      await fixture.whenStable();

      (root.querySelector('#menu-link') as HTMLElement).click();
      await fixture.whenStable();

      expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('should not close when clicking the brand', async () => {
      const { fixture, root, toggle } = await setup();
      toggle.click();
      await fixture.whenStable();

      (root.querySelector('.brand a') as HTMLElement).click();
      await fixture.whenStable();

      expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });

    it('should close with Escape and return focus to the button', async () => {
      const { fixture, toggle } = await setup();
      toggle.click();
      await fixture.whenStable();

      toggle.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      await fixture.whenStable();

      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(toggle);
    });

    it('should ignore Escape while closed', async () => {
      const { fixture, toggle } = await setup();
      toggle.blur();

      toggle.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      await fixture.whenStable();

      expect(document.activeElement).not.toBe(toggle);
    });
  });

  it('should have no accessibility violations', async () => {
    const { fixture, toggle } = await setup();
    toggle.click();
    await fixture.whenStable();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
