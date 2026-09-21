export type LcTableAlign = 'start' | 'center' | 'end';
export type LcTableDensity = 'comfortable' | 'compact';
export type LcSortDirection = 'asc' | 'desc';

/** Describes a column of `lc-table`. */
export interface LcTableColumn<T> {
  /** Identifies the column; also the property read from each row unless `value` is set. */
  readonly key: string;
  readonly header: string;
  readonly sortable?: boolean;
  readonly align?: LcTableAlign;
  /** CSS width, e.g. `8rem` or `20%`. */
  readonly width?: string;
  /** Reads the cell value from a row when it is not `row[key]`. Also used for sorting. */
  readonly value?: (row: T) => unknown;
}

export interface LcTableSort {
  readonly key: string;
  readonly direction: LcSortDirection;
}

/** Context passed to `lcCell` templates. */
export interface LcTableCellContext<T> {
  /** The row. */
  $implicit: T;
  value: unknown;
  column: LcTableColumn<T>;
  index: number;
}

/** Context passed to `lcHeader` templates. */
export interface LcTableHeaderContext<T> {
  /** The column. */
  $implicit: LcTableColumn<T>;
}
