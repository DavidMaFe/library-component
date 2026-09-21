import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { LcSize } from '../shared/ui.types';
import { paginationItems } from './pagination-items';

/**
 * Page navigation for lists and tables. `page` starts at 1.
 *
 * ```html
 * <lc-pagination [total]="orders.length" [pageSize]="10" [(page)]="page" />
 * ```
 *
 * Labels are inputs so they can be translated.
 *
 * Customize with `--lc-pagination-size`, `-radius`, `-bg-current` and
 * `-color-current`.
 */
@Component({
  selector: 'lc-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
  },
})
export class LcPagination {
  /** Total number of items across all pages. */
  readonly total = input.required({ transform: numberAttribute });
  readonly pageSize = input(10, { transform: numberAttribute });
  readonly page = model(1);
  /** Page buttons kept on each side of the current page. */
  readonly siblings = input(1, { transform: numberAttribute });
  readonly size = input<Exclude<LcSize, 'lg'>>('md');

  readonly label = input('Pagination');
  readonly previousLabel = input('Previous page');
  readonly nextLabel = input('Next page');
  readonly pageLabel = input((page: number) => `Page ${page}`);

  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.total() / Math.max(1, this.pageSize()))),
  );
  protected readonly current = computed(() =>
    Math.min(Math.max(1, this.page()), this.pageCount()),
  );
  protected readonly items = computed(() =>
    paginationItems(this.current(), this.pageCount(), this.siblings()),
  );

  protected select(page: number): void {
    if (page < 1 || page > this.pageCount() || page === this.current()) return;
    this.page.set(page);
  }
}
