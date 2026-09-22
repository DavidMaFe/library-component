import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { Product, ProductSort } from '../domain/catalog';
import { provideLcEcommerceLabels } from '../labels/ecommerce-labels';
import { sampleProducts } from '../testing/sample-data';
import { LcProductList } from './product-list';

@Component({
  imports: [LcProductList],
  template: `
    <lc-product-list
      [products]="products()"
      [pageSize]="pageSize()"
      [sort]="sort()"
      locale="en-US"
      (add)="added.push($event)"
      (viewOptions)="viewed.push($event)"
    />
  `,
})
class HostComponent {
  products = signal<Product[]>(sampleProducts);
  pageSize = signal(0);
  sort = signal<ProductSort>('featured');
  added: Product[] = [];
  viewed: Product[] = [];
}

describe('LcProductList', () => {
  const setup = async (
    configure: (host: HostComponent) => void = () => undefined,
  ) => {
    const fixture = TestBed.createComponent(HostComponent);
    configure(fixture.componentInstance);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const api = {
      fixture,
      host: fixture.componentInstance,
      root,
      names: () =>
        Array.from(root.querySelectorAll('lc-product-card .name')).map((n) =>
          n.textContent?.trim(),
        ),
      results: () => root.querySelector('.results')?.textContent?.trim(),
      chip: (label: string) =>
        Array.from(root.querySelectorAll<HTMLButtonElement>('.chip')).find(
          (b) => b.textContent?.trim() === label,
        ),
      field: (label: string) =>
        Array.from(root.querySelectorAll('lc-form-field'))
          .find((f) => f.querySelector('label')?.textContent?.includes(label))
          ?.querySelector('input, select') as HTMLInputElement &
          HTMLSelectElement,
      toggle: (label: string) =>
        Array.from(root.querySelectorAll<HTMLLabelElement>('label.toggle'))
          .find((l) => l.textContent?.includes(label))
          ?.querySelector('input') as HTMLInputElement,
      update: () => fixture.whenStable(),
      type: async (input: HTMLInputElement, value: string) => {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await fixture.whenStable();
      },
    };
    return api;
  };

  describe('listing', () => {
    it('should render a card per product, featured first by default', async () => {
      const { names } = await setup();

      expect(names()).toEqual([
        'Linen shirt',
        'Ceramic mug',
        'Table lamp',
        'Dotted notebook',
        'Soy candle',
      ]);
    });

    it('should announce the number of products', async () => {
      const { results, root } = await setup();

      expect(results()).toBe('5 products');
      expect(root.querySelector('.results')?.getAttribute('role')).toBe(
        'status',
      );
    });

    it('should show the empty state', async () => {
      const { host, root, update } = await setup();

      host.products.set([]);
      await update();

      expect(root.querySelector('.empty')?.textContent).toContain(
        'No products match',
      );
    });

    it('should forward add and viewOptions from the cards', async () => {
      const { host, root } = await setup();
      const buttons = Array.from(
        root.querySelectorAll<HTMLButtonElement>('lc-product-card button'),
      );

      buttons[0].click(); // shirt: has variants
      buttons[1].click(); // mug: simple

      expect(host.viewed.map((p) => p.id)).toEqual(['shirt']);
      expect(host.added.map((p) => p.id)).toEqual(['mug']);
    });
  });

  describe('filters', () => {
    it('should search by text', async () => {
      const { field, type, names, results } = await setup();

      await type(field('Search'), 'mug');

      expect(names()).toEqual(['Ceramic mug']);
      expect(results()).toBe('1 product');
    });

    it('should filter by category chips and combine them', async () => {
      const { chip, names, update } = await setup();

      chip('Home')?.click();
      await update();
      expect(chip('Home')?.getAttribute('aria-pressed')).toBe('true');
      expect(names()).toEqual(['Ceramic mug', 'Table lamp', 'Soy candle']);

      chip('Stationery')?.click();
      await update();
      expect(names()).toContain('Dotted notebook');

      chip('Home')?.click();
      await update();
      expect(names()).toEqual(['Dotted notebook']);
    });

    it('should build the category chips from the products', async () => {
      const { root } = await setup();

      expect(
        Array.from(root.querySelectorAll('.chip')).map((c) =>
          c.textContent?.trim(),
        ),
      ).toEqual(['Clothing', 'Home', 'Stationery']);
    });

    it('should filter by price in the currency major unit', async () => {
      const { field, type, names } = await setup();

      await type(field('Min price'), '15');
      await type(field('Max price'), '30');

      expect(names()).toEqual(['Dotted notebook', 'Soy candle']);
    });

    it('should keep only products in stock', async () => {
      const { toggle, names, update } = await setup();

      toggle('In stock only').click();
      await update();

      expect(names()).not.toContain('Table lamp');
      expect(names()).toHaveLength(4);
    });

    it('should keep only products on sale', async () => {
      const { toggle, names, update } = await setup();

      toggle('On sale only').click();
      await update();

      expect(names()).toEqual(['Linen shirt', 'Dotted notebook']);
    });

    it('should show a message and let the shopper clear the filters', async () => {
      const { field, type, root, names, update } = await setup();

      await type(field('Search'), 'zzz');
      expect(root.querySelector('.empty')).not.toBeNull();

      root.querySelector<HTMLButtonElement>('.clear')?.click();
      await update();

      expect(names()).toHaveLength(5);
      expect(root.querySelector('.clear')).toBeNull();
    });

    it('should only offer "clear" when a filter is active', async () => {
      const { root, chip, update } = await setup();
      expect(root.querySelector('.clear')).toBeNull();

      chip('Home')?.click();
      await update();

      expect(root.querySelector('.clear')).not.toBeNull();
    });
  });

  describe('sorting', () => {
    it('should follow the sort input as the starting order', async () => {
      const { names } = await setup((host) => host.sort.set('price-asc'));

      expect(names()[0]).toBe('Ceramic mug');
    });

    it('should re-sort when the shopper chooses another order', async () => {
      const { field, names, fixture } = await setup();
      const select = field('Sort by') as unknown as HTMLSelectElement;

      select.value = 'price-desc';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await fixture.whenStable();

      expect(names()[0]).toBe('Table lamp');
    });

    it('should list every sort option with readable names', async () => {
      const { field } = await setup();
      const select = field('Sort by') as unknown as HTMLSelectElement;

      expect(
        Array.from(select.options).map((o) => o.textContent?.trim()),
      ).toEqual([
        'Featured',
        'Price: low to high',
        'Price: high to low',
        'Name',
        'Best rated',
        'Biggest discount',
      ]);
    });
  });

  describe('pagination', () => {
    const paged = (host: HostComponent) => host.pageSize.set(2);

    it('should not paginate without a page size', async () => {
      const { root } = await setup();

      expect(root.querySelector('lc-pagination')).toBeNull();
    });

    it('should show one page at a time', async () => {
      const { names, root } = await setup(paged);

      expect(names()).toEqual(['Linen shirt', 'Ceramic mug']);
      expect(root.querySelector('lc-pagination')).not.toBeNull();
    });

    it('should move between pages', async () => {
      const { names, root, update } = await setup(paged);

      root
        .querySelector<HTMLButtonElement>('button[aria-label="Page 2"]')
        ?.click();
      await update();

      expect(names()).toEqual(['Table lamp', 'Dotted notebook']);
    });

    it('should return to the first page when a filter changes', async () => {
      const { names, root, chip, update } = await setup(paged);
      root
        .querySelector<HTMLButtonElement>('button[aria-label="Page 3"]')
        ?.click();
      await update();

      chip('Home')?.click();
      await update();

      expect(names()).toEqual(['Ceramic mug', 'Table lamp']);
    });

    it('should hide the pagination when everything fits one page', async () => {
      const { root, chip, update } = await setup(paged);

      chip('Stationery')?.click();
      await update();

      expect(root.querySelector('lc-pagination')).toBeNull();
    });
  });

  it('should use translated labels', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideLcEcommerceLabels({
          listSearch: 'Buscar productos',
          listResults: (n) => `${n} productos`,
        }),
      ],
    });
    const { root, results } = await setup();

    expect(root.querySelector('lc-form-field label')?.textContent).toContain(
      'Buscar productos',
    );
    expect(results()).toBe('5 productos');
  });

  it('should have no accessibility violations', async () => {
    const { fixture, chip, update } = await setup((host) =>
      host.pageSize.set(2),
    );
    chip('Home')?.click();
    await update();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
