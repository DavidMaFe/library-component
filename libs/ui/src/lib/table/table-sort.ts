import { LcTableColumn, LcTableSort } from './table.types';

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

/**
 * Compares two cell values. Empty values (`null`, `undefined`, `''`) always
 * sort after the others; numbers, dates and booleans compare naturally; text
 * uses a locale-aware comparison where `item 2` comes before `item 10`.
 */
export function compareValues(a: unknown, b: unknown): number {
  const aEmpty = a === null || a === undefined || a === '';
  const bEmpty = b === null || b === undefined || b === '';
  if (aEmpty || bEmpty) return Number(aEmpty) - Number(bEmpty);

  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'boolean' && typeof b === 'boolean')
    return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

/** Reads the value a column shows for a row. */
export function cellValue<T>(row: T, column: LcTableColumn<T>): unknown {
  return column.value
    ? column.value(row)
    : (row as Record<string, unknown>)[column.key];
}

/** Returns a sorted copy of `rows`. The sort is stable and empty values stay last in both directions. */
export function sortRows<T>(
  rows: readonly T[],
  columns: readonly LcTableColumn<T>[],
  sort: LcTableSort | null,
): readonly T[] {
  const column =
    sort && columns.find((candidate) => candidate.key === sort.key);
  if (!sort || !column) return rows;

  const factor = sort.direction === 'asc' ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index, value: cellValue(row, column) }))
    .sort((a, b) => {
      const aEmpty =
        a.value === null || a.value === undefined || a.value === '';
      const bEmpty =
        b.value === null || b.value === undefined || b.value === '';
      const result =
        aEmpty || bEmpty
          ? Number(aEmpty) - Number(bEmpty)
          : factor * compareValues(a.value, b.value);
      return result || a.index - b.index;
    })
    .map(({ row }) => row);
}

/** The next sort when a column header is activated: ascending, descending, then none. */
export function nextSort(
  current: LcTableSort | null,
  key: string,
): LcTableSort | null {
  if (current?.key !== key) return { key, direction: 'asc' };
  return current.direction === 'asc' ? { key, direction: 'desc' } : null;
}
