import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcSidebar } from './sidebar';
import { LcSidebarItem } from './sidebar-item';

@Component({
  imports: [LcSidebar, LcSidebarItem],
  template: `
    <lc-sidebar
      label="Admin"
      [(collapsed)]="collapsed"
      [collapsible]="collapsible()"
    >
      <strong lcSidebarHeader>Acme</strong>
      <a lc-sidebar-item href="/orders" active>
        <svg lcSidebarIcon viewBox="0 0 16 16"><path d="M0 0h16v16H0z" /></svg>
        Orders
      </a>
      <button lc-sidebar-item type="button">Settings</button>
      <span lcSidebarFooter>v1.0</span>
    </lc-sidebar>
  `,
})
class HostComponent {
  collapsed = signal(false);
  collapsible = signal(true);
}

@Component({
  imports: [LcSidebarItem],
  template: `<a lc-sidebar-item href="/x">Alone</a>`,
})
class StandaloneItemHost {}

describe('LcSidebar', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      sidebar: root.querySelector('lc-sidebar') as HTMLElement,
      toggle: () => root.querySelector('.toggle') as HTMLButtonElement | null,
      items: () =>
        Array.from(root.querySelectorAll<HTMLElement>('[lc-sidebar-item]')),
    };
  };

  describe('structure', () => {
    it('should render a labelled navigation landmark', async () => {
      const { root } = await setup();

      expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe(
        'Admin',
      );
    });

    it('should project the header, items and footer', async () => {
      const { root, items } = await setup();

      expect(root.querySelector('.header')?.textContent).toContain('Acme');
      expect(items()).toHaveLength(2);
      expect(root.querySelector('.footer')?.textContent).toContain('v1.0');
    });

    it('should mark the active item as the current page', async () => {
      const { items } = await setup();

      expect(items()[0].getAttribute('aria-current')).toBe('page');
      expect(items()[1].hasAttribute('aria-current')).toBe(false);
    });
  });

  describe('collapsing', () => {
    it('should start expanded', async () => {
      const { sidebar, toggle } = await setup();

      expect(sidebar.hasAttribute('data-collapsed')).toBe(false);
      expect(toggle()?.getAttribute('aria-expanded')).toBe('true');
      expect(toggle()?.getAttribute('aria-label')).toBe('Collapse sidebar');
    });

    it('should collapse and expand with the button', async () => {
      const { fixture, host, sidebar, toggle } = await setup();

      toggle()?.click();
      await fixture.whenStable();
      expect(host.collapsed()).toBe(true);
      expect(sidebar.hasAttribute('data-collapsed')).toBe(true);
      expect(toggle()?.getAttribute('aria-expanded')).toBe('false');
      expect(toggle()?.getAttribute('aria-label')).toBe('Expand sidebar');

      toggle()?.click();
      await fixture.whenStable();
      expect(host.collapsed()).toBe(false);
    });

    it('should follow the bound state', async () => {
      const { fixture, host, sidebar } = await setup();

      host.collapsed.set(true);
      await fixture.whenStable();

      expect(sidebar.hasAttribute('data-collapsed')).toBe(true);
    });

    it('should tell items when the sidebar is collapsed and keep their text for screen readers', async () => {
      const { fixture, host, items } = await setup();

      host.collapsed.set(true);
      await fixture.whenStable();

      expect(items().every((item) => item.hasAttribute('data-collapsed'))).toBe(
        true,
      );
      expect(items()[0].textContent).toContain('Orders');
    });

    it('should hide the toggle when not collapsible', async () => {
      const { fixture, host, toggle } = await setup();

      host.collapsible.set(false);
      await fixture.whenStable();

      expect(toggle()).toBeNull();
    });
  });

  it('should render an item outside a sidebar', async () => {
    const fixture = TestBed.createComponent(StandaloneItemHost);
    await fixture.whenStable();

    expect(
      fixture.nativeElement.querySelector('a')?.hasAttribute('data-collapsed'),
    ).toBe(false);
  });

  it('should have no accessibility violations', async () => {
    const { fixture, host } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();

    host.collapsed.set(true);
    await fixture.whenStable();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
