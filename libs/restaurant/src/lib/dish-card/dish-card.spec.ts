import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { Dish } from '../domain/menu';
import { provideLcRestaurantLabels } from '../labels/restaurant-labels';
import { LcDishCard } from './dish-card';

@Component({
  imports: [LcDishCard],
  template: `<lc-dish-card
    [dish]="dish()"
    [currency]="currency()"
    locale="en-US"
    [headingLevel]="level()"
  />`,
})
class HostComponent {
  dish = signal<Dish>({
    id: 'pasta',
    name: 'Tagliatelle al ragù',
    description: 'Fresh pasta and slow-cooked beef.',
    price: 14.5,
    image: { src: 'pasta.jpg', alt: 'A plate of tagliatelle' },
    allergens: ['gluten', 'eggs'],
    dietary: ['spicy'],
  });
  currency = signal('EUR');
  level = signal(3);
}

describe('LcDishCard', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      card: root.querySelector('lc-dish-card') as HTMLElement,
    };
  };

  it('should show the name, description and formatted price', async () => {
    const { root } = await setup();

    expect(root.querySelector('.name')?.textContent).toContain(
      'Tagliatelle al ragù',
    );
    expect(root.querySelector('.description')?.textContent).toContain(
      'Fresh pasta',
    );
    expect(root.querySelector('.price')?.textContent).toBe('€14.50');
  });

  it('should use the requested currency', async () => {
    const { fixture, host, root } = await setup();

    host.currency.set('USD');
    await fixture.whenStable();

    expect(root.querySelector('.price')?.textContent).toBe('$14.50');
  });

  it('should render the image with its alternative text', async () => {
    const { root } = await setup();

    const image = root.querySelector('img') as HTMLImageElement;
    expect(image.getAttribute('alt')).toBe('A plate of tagliatelle');
    expect(image.getAttribute('loading')).toBe('lazy');
  });

  it('should omit the image when there is none', async () => {
    const { fixture, host, root } = await setup();

    host.dish.set({ ...host.dish(), image: undefined });
    await fixture.whenStable();

    expect(root.querySelector('img')).toBeNull();
  });

  it('should list dietary tags and allergens with readable names', async () => {
    const { root } = await setup();

    expect(root.querySelector('.tags')?.textContent).toContain('Spicy');
    expect(root.querySelector('.allergens')?.textContent).toContain(
      'Allergens: Gluten, Eggs',
    );
  });

  it('should hide the tags and allergens areas when there is nothing to show', async () => {
    const { fixture, host, root } = await setup();

    host.dish.set({ id: 'x', name: 'Bread', price: 3 });
    await fixture.whenStable();

    expect(root.querySelector('.tags')).toBeNull();
    expect(root.querySelector('.allergens')).toBeNull();
  });

  it('should say when a dish is sold out, in text', async () => {
    const { fixture, host, root, card } = await setup();

    host.dish.set({ ...host.dish(), available: false });
    await fixture.whenStable();

    expect(root.querySelector('.tags')?.textContent).toContain('Sold out');
    expect(card.hasAttribute('data-unavailable')).toBe(true);
  });

  it('should be an article named by the dish', async () => {
    const { root, card } = await setup();

    expect(card.getAttribute('role')).toBe('article');
    expect(card.getAttribute('aria-labelledby')).toBe(
      root.querySelector('.name')?.id,
    );
  });

  it('should honor the heading level', async () => {
    const { fixture, host, root } = await setup();

    host.level.set(2);
    await fixture.whenStable();

    expect(root.querySelector('.name')?.getAttribute('aria-level')).toBe('2');
  });

  it('should use translated labels', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideLcRestaurantLabels({
          allergensLabel: 'Alérgenos',
          allergens: { gluten: 'Gluten (trigo)' },
        }),
      ],
    });
    const { root } = await setup();

    expect(root.querySelector('.allergens')?.textContent).toContain(
      'Alérgenos: Gluten (trigo), Eggs',
    );
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
