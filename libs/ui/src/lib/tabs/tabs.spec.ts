import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcTab } from './tab';
import { LcTabs } from './tabs';

@Component({
  imports: [LcTabs, LcTab],
  template: `
    <lc-tabs label="Menu sections" [(selectedIndex)]="index">
      <lc-tab label="Starters">Bruschetta</lc-tab>
      <lc-tab label="Mains" [disabled]="mainsDisabled()">Lasagna</lc-tab>
      <lc-tab label="Desserts">Tiramisu</lc-tab>
    </lc-tabs>
  `,
})
class HostComponent {
  index = signal(0);
  mainsDisabled = signal(false);
}

const key = (target: Element, name: string) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: name,
      bubbles: true,
      cancelable: true,
    }),
  );

describe('LcTabs', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const tabs = () =>
      Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = () =>
      Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    return { fixture, host: fixture.componentInstance, root, tabs, panels };
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('structure', () => {
    it('should render a labelled tablist with one tab per panel', async () => {
      const { root, tabs } = await setup();

      expect(
        root.querySelector('[role="tablist"]')?.getAttribute('aria-label'),
      ).toBe('Menu sections');
      expect(tabs().map((tab) => tab.textContent?.trim())).toEqual([
        'Starters',
        'Mains',
        'Desserts',
      ]);
    });

    it('should link each tab with its panel', async () => {
      const { tabs, panels } = await setup();

      tabs().forEach((tab, i) => {
        expect(tab.getAttribute('aria-controls')).toBe(panels()[i].id);
        expect(panels()[i].getAttribute('aria-labelledby')).toBe(tab.id);
      });
    });

    it('should show only the selected panel', async () => {
      const { tabs, panels } = await setup();

      expect(tabs().map((t) => t.getAttribute('aria-selected'))).toEqual([
        'true',
        'false',
        'false',
      ]);
      expect(panels().map((p) => p.hidden)).toEqual([false, true, true]);
    });

    it('should keep only the selected tab in the tab order', async () => {
      const { tabs } = await setup();

      expect(tabs().map((t) => t.tabIndex)).toEqual([0, -1, -1]);
    });
  });

  describe('selection', () => {
    it('should select a tab on click', async () => {
      const { fixture, host, tabs, panels } = await setup();

      tabs()[2].click();
      await fixture.whenStable();

      expect(host.index()).toBe(2);
      expect(panels().map((p) => p.hidden)).toEqual([true, true, false]);
    });

    it('should follow the bound index', async () => {
      const { fixture, host, tabs } = await setup();

      host.index.set(2);
      await fixture.whenStable();

      expect(tabs()[2].getAttribute('aria-selected')).toBe('true');
    });

    it('should fall back to the first enabled tab for an invalid index', async () => {
      const { fixture, host, tabs } = await setup();

      host.index.set(42);
      await fixture.whenStable();

      expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    });

    it('should not select a disabled tab', async () => {
      const { fixture, host, tabs } = await setup();
      host.mainsDisabled.set(true);
      await fixture.whenStable();

      tabs()[1].click();
      await fixture.whenStable();

      expect(tabs()[1].disabled).toBe(true);
      expect(host.index()).toBe(0);
    });
  });

  describe('keyboard', () => {
    it('should select and focus the next tab with ArrowRight', async () => {
      const { fixture, host, tabs } = await setup();

      key(tabs()[0], 'ArrowRight');
      await fixture.whenStable();

      expect(host.index()).toBe(1);
      expect(document.activeElement).toBe(tabs()[1]);
    });

    it('should wrap around with the arrow keys', async () => {
      const { fixture, host, tabs } = await setup();

      key(tabs()[0], 'ArrowLeft');
      await fixture.whenStable();
      expect(host.index()).toBe(2);

      key(tabs()[2], 'ArrowRight');
      await fixture.whenStable();
      expect(host.index()).toBe(0);
    });

    it('should jump with Home and End', async () => {
      const { fixture, host, tabs } = await setup();

      key(tabs()[0], 'End');
      await fixture.whenStable();
      expect(host.index()).toBe(2);

      key(tabs()[2], 'Home');
      await fixture.whenStable();
      expect(host.index()).toBe(0);
    });

    it('should skip disabled tabs', async () => {
      const { fixture, host, tabs } = await setup();
      host.mainsDisabled.set(true);
      await fixture.whenStable();

      key(tabs()[0], 'ArrowRight');
      await fixture.whenStable();

      expect(host.index()).toBe(2);
    });

    it('should ignore other keys', async () => {
      const { fixture, host, tabs } = await setup();

      key(tabs()[0], 'a');
      await fixture.whenStable();

      expect(host.index()).toBe(0);
    });
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
