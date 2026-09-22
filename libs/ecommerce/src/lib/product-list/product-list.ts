import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LcFormField, LcInput } from '@lc/forms';
import { LcGrid } from '@lc/layout';
import { LcPagination } from '@lc/ui';
import {
  categoriesIn,
  DEFAULT_LOW_STOCK_THRESHOLD,
  filterProducts,
  Product,
  ProductFilter,
  ProductSort,
  priceBounds,
  sortProducts,
} from '../domain/catalog';
import { fromMajor } from '../domain/money';
import { LC_ECOMMERCE_LABELS } from '../labels/ecommerce-labels';
import { LcProductCard } from '../product-card/product-card';
import { uniqueId } from '../shared/unique-id';

const SORTS: readonly ProductSort[] = [
  'featured',
  'price-asc',
  'price-desc',
  'name-asc',
  'rating',
  'discount',
];

/**
 * Product grid with search, category, price, stock and sale filters, sorting
 * and optional pagination. Filtering and sorting run on the given products,
 * using the tested rules of `filterProducts` and `sortProducts`.
 *
 * ```html
 * <lc-product-list [products]="products" [pageSize]="12" (add)="cart.add($event)" />
 * ```
 *
 * Customize with `--lc-product-list-gap`.
 */
@Component({
  selector: 'lc-product-list',
  imports: [
    FormsModule,
    LcGrid,
    LcProductCard,
    LcFormField,
    LcInput,
    LcPagination,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcProductList {
  readonly products = input.required<readonly Product[]>();
  readonly locale = input(inject(LOCALE_ID));
  /** Products per page. `0` shows them all. */
  readonly pageSize = input(0, { transform: numberAttribute });
  readonly lowStockThreshold = input(DEFAULT_LOW_STOCK_THRESHOLD, {
    transform: numberAttribute,
  });
  readonly minItemWidth = input('16rem');
  readonly sort = input<ProductSort>('featured');

  readonly add = output<Product>();
  readonly viewOptions = output<Product>();

  protected readonly labels = inject(LC_ECOMMERCE_LABELS);
  protected readonly uid = uniqueId('lc-product-list');
  protected readonly sorts = SORTS;

  protected readonly search = signal('');
  protected readonly selectedCategories = signal<readonly string[]>([]);
  protected readonly minPrice = signal<number | null>(null);
  protected readonly maxPrice = signal<number | null>(null);
  protected readonly inStockOnly = signal(false);
  protected readonly onSaleOnly = signal(false);
  protected readonly chosenSort = signal<ProductSort | null>(null);
  protected readonly page = signal(1);

  protected readonly categories = computed(() => categoriesIn(this.products()));
  protected readonly currency = computed(
    () => this.products()[0]?.price.currency ?? 'EUR',
  );
  protected readonly bounds = computed(() => priceBounds(this.products()));
  protected readonly activeSort = computed(
    () => this.chosenSort() ?? this.sort(),
  );

  protected readonly filter = computed<ProductFilter>(() => {
    const toMinor = (value: number | null) =>
      value === null || Number.isNaN(value)
        ? undefined
        : fromMajor(value, this.currency()).amount;
    return {
      search: this.search(),
      categories: this.selectedCategories(),
      minPrice: toMinor(this.minPrice()),
      maxPrice: toMinor(this.maxPrice()),
      inStockOnly: this.inStockOnly(),
      onSaleOnly: this.onSaleOnly(),
    };
  });

  protected readonly hasFilters = computed(
    () =>
      this.search().trim() !== '' ||
      this.selectedCategories().length > 0 ||
      this.minPrice() !== null ||
      this.maxPrice() !== null ||
      this.inStockOnly() ||
      this.onSaleOnly(),
  );

  protected readonly results = computed(() =>
    sortProducts(
      filterProducts(this.products(), this.filter()),
      this.activeSort(),
    ),
  );
  protected readonly paged = computed(() => this.pageSize() > 0);
  protected readonly pageCount = computed(() =>
    this.paged()
      ? Math.max(1, Math.ceil(this.results().length / this.pageSize()))
      : 1,
  );
  protected readonly currentPage = computed(() =>
    Math.min(this.page(), this.pageCount()),
  );
  protected readonly visible = computed(() => {
    if (!this.paged()) return this.results();
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.results().slice(start, start + this.pageSize());
  });

  /** Runs a filter change and returns to the first page. */
  protected change(update: () => void): void {
    update();
    this.page.set(1);
  }

  protected toggleCategory(category: string): void {
    this.change(() =>
      this.selectedCategories.update((current) =>
        current.includes(category)
          ? current.filter((c) => c !== category)
          : [...current, category],
      ),
    );
  }

  protected clearFilters(): void {
    this.change(() => {
      this.search.set('');
      this.selectedCategories.set([]);
      this.minPrice.set(null);
      this.maxPrice.set(null);
      this.inStockOnly.set(false);
      this.onSaleOnly.set(false);
    });
  }
}
