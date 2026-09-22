import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { Product } from '../domain/catalog';
import { provideLcEcommerceLabels } from '../labels/ecommerce-labels';
import {
  candle,
  ceramicMug,
  linenShirt,
  notebook,
  tableLamp,
} from '../testing/sample-data';
import { LcProductCard } from './product-card';

@Component({
  imports: [LcProductCard],
  template: `
    <lc-product-card
      [product]="product()"
      [href]="href()"
      [headingLevel]="level()"
      locale="en-US"
      (add)="added.push($event)"
      (viewOptions)="viewed.push($event)"
    />
  `,
})
class HostComponent {
  product = signal<Product>(ceramicMug);
  href = signal<string | undefined>(undefined);
  level = signal(3);
  added: Product[] = [];
  viewed: Product[] = [];
}

describe('LcProductCard', () => {
  const setup = async (product: Product = ceramicMug) => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.product.set(product);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      card: root.querySelector('lc-product-card') as HTMLElement,
      button: () => root.querySelector('button') as HTMLButtonElement,
      text: (selector: string) =>
        root.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim(),
      update: () => fixture.whenStable(),
    };
  };

  describe('content', () => {
    it('should show the name, image and price', async () => {
      const { root, text } = await setup();

      expect(text('.name')).toBe('Ceramic mug');
      expect(root.querySelector('img')?.getAttribute('alt')).toBe(
        'A blue-glazed ceramic mug',
      );
      expect(text('.current')).toBe('€12.00');
    });

    it('should be an article named by the product', async () => {
      const { card, root } = await setup();

      expect(card.getAttribute('role')).toBe('article');
      expect(card.getAttribute('aria-labelledby')).toBe(
        root.querySelector('.name')?.id,
      );
    });

    it('should honor the heading level', async () => {
      const { host, root, update } = await setup();

      host.level.set(2);
      await update();

      expect(root.querySelector('.name')?.getAttribute('aria-level')).toBe('2');
    });

    it('should link the name when an href is given', async () => {
      const { host, root, update } = await setup();
      expect(root.querySelector('.name a')).toBeNull();

      host.href.set('/p/mug');
      await update();

      expect(root.querySelector('.name a')?.getAttribute('href')).toBe(
        '/p/mug',
      );
    });

    it('should describe the rating for screen readers and hide the stars', async () => {
      const { root } = await setup();

      const rating = root.querySelector('.rating') as HTMLElement;
      expect(rating.getAttribute('role')).toBe('img');
      expect(rating.getAttribute('aria-label')).toBe(
        'Rated 4.8 out of 5, 112 reviews',
      );
      expect(rating.querySelectorAll('.star.filled')).toHaveLength(5);
    });

    it('should omit the rating when there is none', async () => {
      const { root } = await setup(candle);

      expect(root.querySelector('.rating')).toBeNull();
    });
  });

  describe('sale', () => {
    it('should show the original price and the discount badge', async () => {
      const { root, text } = await setup(notebook);

      expect(text('.original')).toContain('€18.00');
      expect(text('.original')).toContain('Original price');
      expect(text('.badges')).toContain('-17%');
      expect(root.querySelector('.current')?.classList.contains('sale')).toBe(
        true,
      );
    });

    it('should not show sale information for a full-price product', async () => {
      const { root } = await setup();

      expect(root.querySelector('.original')).toBeNull();
      expect(root.querySelector('.badges lc-badge')).toBeNull();
    });
  });

  describe('stock', () => {
    it('should warn about low stock with the number of units', async () => {
      const { text } = await setup(notebook);

      expect(text('.badges')).toContain('Only 4 left');
    });

    it('should mark out-of-stock products and disable the action', async () => {
      const { text, button } = await setup(tableLamp);

      expect(text('.badges')).toContain('Out of stock');
      expect(button().disabled).toBe(true);
      expect(button().textContent).toContain('Out of stock');
    });
  });

  describe('actions', () => {
    it('should emit add for a simple product', async () => {
      const { host, button } = await setup();

      expect(button().textContent).toContain('Add to cart');
      button().click();

      expect(host.added).toEqual([ceramicMug]);
      expect(host.viewed).toEqual([]);
    });

    it('should ask to choose options for a product with variants', async () => {
      const { host, button } = await setup(linenShirt);

      expect(button().textContent).toContain('Choose options');
      button().click();

      expect(host.viewed).toEqual([linenShirt]);
      expect(host.added).toEqual([]);
    });

    it('should not emit when out of stock', async () => {
      const { host, button } = await setup(tableLamp);

      button().click();

      expect(host.added).toEqual([]);
    });
  });

  describe('price range', () => {
    it('should show "From" when variants have different prices', async () => {
      const { text } = await setup(linenShirt);

      expect(text('.current')).toBe('From €45.00');
    });
  });

  it('should use translated labels', async () => {
    TestBed.configureTestingModule({
      providers: [provideLcEcommerceLabels({ addToCart: 'Añadir al carrito' })],
    });
    const { button } = await setup();

    expect(button().textContent).toContain('Añadir al carrito');
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup(notebook);

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
