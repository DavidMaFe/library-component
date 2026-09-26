import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { Product } from '../domain/catalog';
import {
  candle,
  ceramicMug,
  linenShirt,
  tableLamp,
} from '../testing/sample-data';
import { AddToCartEvent, LcProductDetail } from './product-detail';

@Component({
  imports: [LcProductDetail],
  template: `<lc-product-detail
    [product]="product()"
    [maxPerOrder]="maxPerOrder()"
    locale="en-US"
    (addToCart)="added.push($event)"
  />`,
})
class HostComponent {
  product = signal<Product>(linenShirt);
  maxPerOrder = signal(10);
  added: AddToCartEvent[] = [];
}

describe('LcProductDetail', () => {
  const setup = async (product: Product = linenShirt) => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.product.set(product);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const api = {
      fixture,
      host: fixture.componentInstance,
      root,
      text: (selector: string) =>
        root.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim(),
      radio: (value: string) =>
        Array.from(root.querySelectorAll<HTMLElement>('lc-radio'))
          .find((r) =>
            r.textContent?.replace(/\s+/g, ' ').trim().startsWith(value),
          )
          ?.querySelector('input') as HTMLInputElement,
      addButton: () =>
        root.querySelector('.buy button:not(.button)') as HTMLButtonElement,
      quantity: () =>
        root.querySelector('.buy input[type="number"]') as HTMLInputElement,
      choose: async (value: string) => {
        api.radio(value).click();
        await fixture.whenStable();
      },
      update: () => fixture.whenStable(),
    };
    return api;
  };

  describe('content', () => {
    it('should show the name, description and rating', async () => {
      const { text, root } = await setup();

      expect(text('.name')).toBe('Linen shirt');
      expect(root.querySelector('.name')?.getAttribute('aria-level')).toBe('1');
      expect(text('.description')).toContain('breathable shirt');
      expect(text('.rating')).toBe('Rated 4.5 out of 5, 28 reviews');
    });

    it('should show the price range until a variant is chosen, with the sale information', async () => {
      const { text } = await setup();

      expect(text('.current')).toBe('From €45.00');
      expect(text('.original')).toContain('€60.00');
      expect(text('.price lc-badge')).toBe('-25%');
    });

    it('should offer the options as chips and a large purchase zone', async () => {
      const { root } = await setup();

      const groups = Array.from(root.querySelectorAll('lc-radio-group'));
      expect(groups.length).toBeGreaterThan(0);
      expect(
        groups.every((g) => g.getAttribute('data-appearance') === 'chip'),
      ).toBe(true);
      expect(
        root
          .querySelector('.buy lc-quantity-stepper')
          ?.getAttribute('data-size'),
      ).toBe('lg');
      expect(root.querySelector('.buy .add')?.getAttribute('data-size')).toBe(
        'lg',
      );
    });

    it('should show a simple product price', async () => {
      const { text } = await setup(ceramicMug);

      expect(text('.current')).toBe('€12.00');
    });
  });

  describe('gallery', () => {
    it('should show the first image and a thumbnail per image', async () => {
      const { root } = await setup();

      expect(root.querySelector('.main')?.getAttribute('alt')).toBe(
        'Linen shirt, front',
      );
      expect(root.querySelectorAll('.thumb')).toHaveLength(3);
    });

    it('should switch the main image from a thumbnail and mark it as current', async () => {
      const { root, update } = await setup();
      const thumbs = Array.from(
        root.querySelectorAll<HTMLButtonElement>('.thumb'),
      );

      thumbs[2].click();
      await update();

      expect(root.querySelector('.main')?.getAttribute('alt')).toBe(
        'Linen shirt, collar detail',
      );
      expect(thumbs[2].getAttribute('aria-current')).toBe('true');
      expect(thumbs[0].hasAttribute('aria-current')).toBe(false);
    });

    it('should name each thumbnail with its position and description', async () => {
      const { root } = await setup();

      expect(root.querySelector('.thumb')?.getAttribute('aria-label')).toBe(
        'Show image 1 of 3: Linen shirt, front',
      );
    });

    it('should not show thumbnails for a single image', async () => {
      const { root } = await setup(ceramicMug);

      expect(root.querySelector('.thumbs')).toBeNull();
    });
  });

  describe('variants', () => {
    it('should render a group of options per attribute', async () => {
      const { root } = await setup();

      const groups = Array.from(root.querySelectorAll('lc-form-field')).map(
        (f) => f.querySelector('.label')?.textContent?.trim(),
      );
      expect(groups).toEqual(['size', 'color']);
      expect(root.querySelectorAll('lc-radio')).toHaveLength(5);
    });

    it('should not offer options for a simple product', async () => {
      const { root } = await setup(ceramicMug);

      expect(root.querySelectorAll('lc-radio')).toHaveLength(0);
    });

    it('should keep add to cart disabled until every option is chosen', async () => {
      const { addButton, text, choose } = await setup();
      expect(addButton().disabled).toBe(true);
      expect(text('.stock')).toBe('Select size and color first.');

      await choose('M');
      expect(addButton().disabled).toBe(true);
      expect(text('.stock')).toBe('Select color first.');

      await choose('Navy');
      expect(addButton().disabled).toBe(false);
    });

    it('should show the variant price once chosen', async () => {
      const { text, choose } = await setup();

      await choose('M');
      await choose('White');

      expect(text('.current')).toBe('€49.00');
    });

    it('should disable options that leave nothing in stock and say so', async () => {
      const { radio, choose } = await setup();

      await choose('S');

      expect(radio('Navy').disabled).toBe(true);
      expect(radio('Navy (sold out)')).toBeDefined();
      expect(radio('White').disabled).toBe(false);
    });

    it('should warn about low stock for the chosen variant', async () => {
      const { text, choose } = await setup();

      await choose('S');
      await choose('White');

      expect(text('.stock')).toBe('Only 3 left');
    });
  });

  describe('adding to the cart', () => {
    it('should emit the product, variant and quantity', async () => {
      const { host, addButton, choose, update } = await setup();
      await choose('M');
      await choose('Navy');

      addButton().click();
      await update();

      expect(host.added).toHaveLength(1);
      expect(host.added[0].variant?.id).toBe('m-navy');
      expect(host.added[0].quantity).toBe(1);
      expect(host.added[0].product).toBe(linenShirt);
    });

    it('should emit the chosen quantity', async () => {
      const { host, addButton, quantity, choose, update } = await setup();
      await choose('M');
      await choose('Navy');
      quantity().value = '3';
      quantity().dispatchEvent(new Event('change', { bubbles: true }));
      await update();

      addButton().click();

      expect(host.added[0].quantity).toBe(3);
    });

    it('should cap the quantity at the variant stock', async () => {
      const { host, addButton, quantity, choose, update } = await setup();
      await choose('S');
      await choose('White');
      quantity().value = '9';
      quantity().dispatchEvent(new Event('change', { bubbles: true }));
      await update();

      addButton().click();

      expect(quantity().value).toBe('3');
      expect(host.added[0].quantity).toBe(3);
    });

    it('should cap the quantity per order', async () => {
      const { host, addButton, quantity, update } = await setup(candle);
      host.maxPerOrder.set(4);
      await update();
      quantity().value = '20';
      quantity().dispatchEvent(new Event('change', { bubbles: true }));
      await update();

      addButton().click();

      expect(host.added[0].quantity).toBe(4);
    });

    it('should add a simple product without choosing anything', async () => {
      const { host, addButton } = await setup(ceramicMug);

      expect(addButton().disabled).toBe(false);
      addButton().click();

      expect(host.added).toEqual([
        { product: ceramicMug, variant: undefined, quantity: 1 },
      ]);
    });

    it('should not allow adding an out-of-stock product', async () => {
      const { host, addButton, text } = await setup(tableLamp);

      expect(addButton().disabled).toBe(true);
      expect(addButton().textContent).toContain('Out of stock');
      expect(text('.stock')).toContain('Out of stock');
      addButton().click();

      expect(host.added).toEqual([]);
    });
  });

  it('should have no accessibility violations', async () => {
    const { fixture, choose } = await setup();
    await choose('S');
    await choose('White');

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
