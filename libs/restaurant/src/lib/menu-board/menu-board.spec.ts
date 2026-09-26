import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { MenuSection } from '../domain/menu';
import { LcMenuBoard } from './menu-board';

const sections: MenuSection[] = [
  {
    id: 'starters',
    title: 'Starters',
    description: 'To share',
    dishes: [
      {
        id: 'salad',
        name: 'Green salad',
        price: 8,
        dietary: ['vegan', 'vegetarian'],
      },
      { id: 'burrata', name: 'Burrata', price: 11, dietary: ['vegetarian'] },
    ],
  },
  {
    id: 'mains',
    title: 'Mains',
    dishes: [
      { id: 'steak', name: 'Steak', price: 24 },
      { id: 'risotto', name: 'Risotto', price: 16, dietary: ['vegetarian'] },
    ],
  },
];

@Component({
  imports: [LcMenuBoard],
  template: `
    <lc-menu-board
      [sections]="sections()"
      [filterable]="filterable()"
      [showSectionNav]="nav()"
      locale="en-US"
    />
  `,
})
class HostComponent {
  sections = signal<MenuSection[]>(sections);
  filterable = signal(true);
  nav = signal(false);
}

describe('LcMenuBoard', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const api = {
      fixture,
      host: fixture.componentInstance,
      root,
      dishes: () =>
        Array.from(root.querySelectorAll('lc-dish-card .name')).map((n) =>
          n.textContent?.trim(),
        ),
      titles: () =>
        Array.from(root.querySelectorAll('h2')).map((h) =>
          h.textContent?.trim(),
        ),
      chip: (label: string) =>
        Array.from(
          root.querySelectorAll<HTMLButtonElement>('.filters .chip'),
        ).find((b) => b.textContent?.trim() === label),
      update: () => fixture.whenStable(),
    };
    return api;
  };

  describe('sections', () => {
    it('should render a heading and the dishes of each section', async () => {
      const { titles, dishes } = await setup();

      expect(titles()).toEqual(['Starters', 'Mains']);
      expect(dishes()).toEqual(['Green salad', 'Burrata', 'Steak', 'Risotto']);
    });

    it('should count the dishes shown in each section', async () => {
      const { root, chip, update } = await setup();
      const counts = () =>
        Array.from(root.querySelectorAll('.section-head .count')).map((c) =>
          c.textContent?.trim(),
        );

      expect(counts()).toEqual(['02 dishes', '02 dishes']);

      chip('Vegan')?.click();
      await update();

      expect(counts()).toEqual(['01 dish']);
    });

    it('should keep the heading rule decorative', async () => {
      const { root } = await setup();

      expect(
        root.querySelector('.section-head .rule')?.getAttribute('aria-hidden'),
      ).toBe('true');
    });

    it('should show the section description', async () => {
      const { root } = await setup();

      expect(root.querySelector('.description')?.textContent).toBe('To share');
    });

    it('should label every section by its heading', async () => {
      const { root } = await setup();

      for (const section of Array.from(root.querySelectorAll('section'))) {
        const heading = root.querySelector(
          `#${section.getAttribute('aria-labelledby')}`,
        );
        expect(heading?.tagName).toBe('H2');
      }
    });
  });

  describe('filters', () => {
    it('should build the filter buttons from the tags in use', async () => {
      const { root } = await setup();

      const labels = Array.from(root.querySelectorAll('.filters .chip')).map(
        (b) => b.textContent?.trim(),
      );
      expect(labels).toEqual(['Vegetarian', 'Vegan']);
    });

    it('should filter dishes when a tag is pressed', async () => {
      const { chip, dishes, update } = await setup();

      chip('Vegan')?.click();
      await update();

      expect(chip('Vegan')?.getAttribute('aria-pressed')).toBe('true');
      expect(
        chip('Vegan')?.querySelector('svg')?.getAttribute('aria-hidden'),
      ).toBe('true');
      expect(chip('Vegetarian')?.querySelector('svg')).toBeNull();
      expect(dishes()).toEqual(['Green salad']);
    });

    it('should drop sections that end up empty', async () => {
      const { chip, titles, update } = await setup();

      chip('Vegan')?.click();
      await update();

      expect(titles()).toEqual(['Starters']);
    });

    it('should combine tags and clear them', async () => {
      const { root, chip, dishes, update } = await setup();

      chip('Vegetarian')?.click();
      await update();
      expect(dishes()).toEqual(['Green salad', 'Burrata', 'Risotto']);

      chip('Vegan')?.click();
      await update();
      expect(dishes()).toEqual(['Green salad']);

      root.querySelector<HTMLButtonElement>('.clear')?.click();
      await update();
      expect(dishes()).toHaveLength(4);
      expect(root.querySelector('.clear')).toBeNull();
    });

    it('should toggle a tag off', async () => {
      const { chip, dishes, update } = await setup();

      chip('Vegan')?.click();
      await update();
      chip('Vegan')?.click();
      await update();

      expect(dishes()).toHaveLength(4);
    });

    it('should announce the number of dishes shown', async () => {
      const { root, chip, update } = await setup();
      expect(root.querySelector('[role="status"]')?.textContent?.trim()).toBe(
        '4 dishes shown',
      );

      chip('Vegan')?.click();
      await update();

      expect(root.querySelector('[role="status"]')?.textContent?.trim()).toBe(
        '1 dish shown',
      );
    });

    it('should hide filters when not filterable or when no dish has tags', async () => {
      const { host, root, update } = await setup();

      host.filterable.set(false);
      await update();
      expect(root.querySelector('.filters')).toBeNull();

      host.filterable.set(true);
      host.sections.set([
        { id: 'a', title: 'A', dishes: [{ id: 'x', name: 'X', price: 1 }] },
      ]);
      await update();
      expect(root.querySelector('.filters')).toBeNull();
    });

    it('should show a message when there are no dishes', async () => {
      const { host, root, update } = await setup();

      host.sections.set([]);
      await update();

      expect(root.querySelector('.empty')?.textContent).toContain(
        'No dishes match',
      );
    });
  });

  describe('section navigation', () => {
    it('should be off by default', async () => {
      const { root } = await setup();

      expect(root.querySelector('nav')).toBeNull();
    });

    it('should list a button per section and scroll to it', async () => {
      const { host, root, update } = await setup();
      host.nav.set(true);
      await update();
      const target = root.querySelector('section') as HTMLElement;
      target.scrollIntoView = jest.fn();

      const buttons = Array.from(
        root.querySelectorAll<HTMLButtonElement>('nav .chip'),
      );
      expect(buttons.map((b) => b.textContent?.trim())).toEqual([
        'Starters',
        'Mains',
      ]);
      buttons[0].click();

      expect(target.scrollIntoView).toHaveBeenCalled();
    });

    it('should label the navigation', async () => {
      const { host, root, update } = await setup();

      host.nav.set(true);
      await update();

      expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe(
        'Menu sections',
      );
    });
  });

  it('should have no accessibility violations', async () => {
    const { fixture, host, chip, update } = await setup();
    host.nav.set(true);
    await update();
    chip('Vegetarian')?.click();
    await update();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
