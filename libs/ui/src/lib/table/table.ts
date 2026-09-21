import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef,
  CdkHeaderCell,
  CdkHeaderCellDef,
  CdkHeaderRow,
  CdkHeaderRowDef,
  CdkRow,
  CdkRowDef,
  CdkTable,
} from '@angular/cdk/table';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { LcPagination } from '../pagination/pagination';
import { LcSpinner } from '../spinner/spinner';
import { LcCellDef, LcEmptyDef, LcHeaderDef } from './table-defs';
import { cellValue, nextSort, sortRows } from './table-sort';
import { LcTableColumn, LcTableDensity, LcTableSort } from './table.types';

const SELECT_COLUMN = '__lc-select';

/**
 * Data table built on the CDK table, with sorting, pagination, row
 * selection and template slots for cells, headers and the empty state.
 *
 * ```html
 * <lc-table
 *   label="Orders"
 *   [data]="orders"
 *   [columns]="columns"
 *   [pageSize]="10"
 *   selectable
 *   [(selection)]="selected"
 * >
 *   <ng-template lcCell="status" let-value="value"><lc-badge>{{ value }}</lc-badge></ng-template>
 *   <ng-template lcEmpty>No orders yet</ng-template>
 * </lc-table>
 * ```
 *
 * Sorting and paging happen in the browser. For server-side data set
 * `manualSort` and/or `total`: the table then only reports `sort` and `page`
 * changes and shows the rows you give it.
 *
 * Customize with `--lc-table-bg`, `-header-bg`, `-border-color`,
 * `-row-hover-bg`, `-cell-padding-x`, `-cell-padding-y`, `-radius` and
 * `-max-height` (sticky header).
 */
@Component({
  selector: 'lc-table',
  imports: [
    CdkTable,
    CdkColumnDef,
    CdkHeaderCellDef,
    CdkCellDef,
    CdkHeaderCell,
    CdkCell,
    CdkHeaderRowDef,
    CdkRowDef,
    CdkHeaderRow,
    CdkRow,
    NgTemplateOutlet,
    LcPagination,
    LcSpinner,
  ],
  templateUrl: './table.html',
  styleUrl: './table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-density]': 'density()',
    '[attr.data-striped]': 'striped() || null',
    '[attr.data-sticky]': 'stickyHeader() || null',
  },
})
export class LcTable<T> {
  readonly data = input.required<readonly T[]>();
  readonly columns = input.required<readonly LcTableColumn<T>[]>();
  /** Accessible name of the table. */
  readonly label = input.required<string>();
  /** Identifies a row, for selection. Defaults to the row itself. */
  readonly rowId = input<(row: T) => unknown>((row) => row);

  readonly sort = model<LcTableSort | null>(null);
  /** The rows are already sorted (server-side): the table only reports `sort`. */
  readonly manualSort = input(false, { transform: booleanAttribute });

  readonly selectable = input(false, { transform: booleanAttribute });
  readonly selection = model<readonly T[]>([]);

  /** Rows per page. `0` shows every row. */
  readonly pageSize = input(0, { transform: numberAttribute });
  readonly page = model(1);
  /** Total rows across pages. When set, the rows are already the current page (server-side). */
  readonly total = input<number | undefined, unknown>(undefined, {
    transform: (value) => (value == null ? undefined : numberAttribute(value)),
  });

  readonly loading = input(false, { transform: booleanAttribute });
  readonly striped = input(false, { transform: booleanAttribute });
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  readonly density = input<LcTableDensity>('comfortable');

  readonly emptyText = input('No results');
  readonly loadingLabel = input('Loading data');
  readonly selectAllLabel = input('Select all rows');
  readonly selectRowLabel = input('Select row');
  readonly paginationLabel = input('Table pagination');
  readonly summary = input(
    (from: number, to: number, total: number) => `${from}–${to} of ${total}`,
  );

  private readonly cellDefs = contentChildren(LcCellDef);
  private readonly headerDefs = contentChildren(LcHeaderDef);
  protected readonly emptyDef = contentChild(LcEmptyDef);

  protected readonly cellTemplates = computed(
    () => new Map(this.cellDefs().map((def) => [def.key(), def.template])),
  );
  protected readonly headerTemplates = computed(
    () => new Map(this.headerDefs().map((def) => [def.key(), def.template])),
  );

  protected readonly displayedColumns = computed(() => [
    ...(this.selectable() ? [SELECT_COLUMN] : []),
    ...this.columns().map((column) => column.key),
  ]);
  protected readonly selectColumn = SELECT_COLUMN;

  protected readonly sortedRows = computed(() =>
    this.manualSort()
      ? this.data()
      : sortRows(this.data(), this.columns(), this.sort()),
  );
  protected readonly paged = computed(() => this.pageSize() > 0);
  protected readonly totalRows = computed(
    () => this.total() ?? this.sortedRows().length,
  );
  protected readonly pageCount = computed(() =>
    this.paged()
      ? Math.max(1, Math.ceil(this.totalRows() / this.pageSize()))
      : 1,
  );
  protected readonly currentPage = computed(() =>
    Math.min(Math.max(1, this.page()), this.pageCount()),
  );

  protected readonly rows = computed(() => {
    const rows = this.sortedRows();
    if (!this.paged() || this.total() !== undefined) return rows;
    const start = (this.currentPage() - 1) * this.pageSize();
    return rows.slice(start, start + this.pageSize());
  });

  protected readonly summaryText = computed(() => {
    const total = this.totalRows();
    if (total === 0) return '';
    const from = (this.currentPage() - 1) * this.pageSize() + 1;
    const to = Math.min(total, from + this.pageSize() - 1);
    return this.summary()(from, to, total);
  });

  readonly #selectedIds = computed(
    () => new Set(this.selection().map((row) => this.rowId()(row))),
  );
  protected readonly selectedOnPage = computed(
    () =>
      this.rows().filter((row) => this.#selectedIds().has(this.rowId()(row)))
        .length,
  );
  protected readonly allSelected = computed(
    () =>
      this.rows().length > 0 && this.selectedOnPage() === this.rows().length,
  );
  protected readonly someSelected = computed(
    () => this.selectedOnPage() > 0 && !this.allSelected(),
  );

  protected readonly trackBy = (_: number, row: T): unknown =>
    this.rowId()(row);

  protected value(row: T, column: LcTableColumn<T>): unknown {
    return cellValue(row, column);
  }

  protected isSelected(row: T): boolean {
    return this.#selectedIds().has(this.rowId()(row));
  }

  protected ariaSort(
    column: LcTableColumn<T>,
  ): 'ascending' | 'descending' | 'none' | null {
    if (!column.sortable) return null;
    const sort = this.sort();
    if (sort?.key !== column.key) return 'none';
    return sort.direction === 'asc' ? 'ascending' : 'descending';
  }

  protected toggleSort(column: LcTableColumn<T>): void {
    this.sort.set(nextSort(this.sort(), column.key));
  }

  protected toggleRow(row: T): void {
    const id = this.rowId()(row);
    this.selection.set(
      this.#selectedIds().has(id)
        ? this.selection().filter((selected) => this.rowId()(selected) !== id)
        : [...this.selection(), row],
    );
  }

  /** Selects or clears the rows of the current page, keeping selections made on other pages. */
  protected toggleAll(): void {
    const pageIds = new Set(this.rows().map((row) => this.rowId()(row)));
    const others = this.selection().filter(
      (row) => !pageIds.has(this.rowId()(row)),
    );
    this.selection.set(
      this.allSelected() ? others : [...others, ...this.rows()],
    );
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
  }
}
