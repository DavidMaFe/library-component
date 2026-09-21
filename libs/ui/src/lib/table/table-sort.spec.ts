import { cellValue, compareValues, nextSort, sortRows } from './table-sort';
import { LcTableColumn } from './table.types';

interface Dish {
  name: string;
  price: number | null;
  added?: Date;
  vegan?: boolean;
  nested?: { rank: number };
}

const columns: LcTableColumn<Dish>[] = [
  { key: 'name', header: 'Name' },
  { key: 'price', header: 'Price' },
  { key: 'added', header: 'Added' },
  { key: 'vegan', header: 'Vegan' },
  { key: 'rank', header: 'Rank', value: (dish) => dish.nested?.rank },
];

const dishes: Dish[] = [
  {
    name: 'Pasta',
    price: 12,
    added: new Date('2026-03-01'),
    vegan: false,
    nested: { rank: 2 },
  },
  {
    name: 'Salad',
    price: null,
    added: new Date('2026-01-01'),
    vegan: true,
    nested: { rank: 1 },
  },
  { name: 'Pizza', price: 9, added: new Date('2026-02-01'), vegan: false },
  { name: 'Soup', price: 12, vegan: true, nested: { rank: 3 } },
];

const names = (rows: readonly Dish[]) => rows.map((row) => row.name);

describe('compareValues', () => {
  it('should compare numbers numerically', () => {
    expect(compareValues(2, 10)).toBeLessThan(0);
    expect(compareValues(10, 2)).toBeGreaterThan(0);
    expect(compareValues(5, 5)).toBe(0);
  });

  it('should compare text ignoring case and treating digits naturally', () => {
    expect(compareValues('apple', 'Banana')).toBeLessThan(0);
    expect(compareValues('item 2', 'item 10')).toBeLessThan(0);
    expect(compareValues('a', 'A')).toBe(0);
  });

  it('should compare dates and booleans', () => {
    expect(
      compareValues(new Date('2026-01-01'), new Date('2026-02-01')),
    ).toBeLessThan(0);
    expect(compareValues(false, true)).toBeLessThan(0);
  });

  it('should place empty values after everything else', () => {
    for (const empty of [null, undefined, '']) {
      expect(compareValues(empty, 1)).toBeGreaterThan(0);
      expect(compareValues(1, empty)).toBeLessThan(0);
    }
    expect(compareValues(null, undefined)).toBe(0);
  });

  it('should treat zero and false as real values', () => {
    expect(compareValues(0, 1)).toBeLessThan(0);
    expect(compareValues(false, null)).toBeLessThan(0);
  });
});

describe('cellValue', () => {
  it('should read the property named by the column key', () => {
    expect(cellValue(dishes[0], columns[0])).toBe('Pasta');
  });

  it('should prefer the value function', () => {
    expect(cellValue(dishes[0], columns[4])).toBe(2);
  });
});

describe('sortRows', () => {
  it('should return the rows untouched without a sort', () => {
    expect(sortRows(dishes, columns, null)).toBe(dishes);
  });

  it('should ignore a sort on an unknown column', () => {
    expect(sortRows(dishes, columns, { key: 'nope', direction: 'asc' })).toBe(
      dishes,
    );
  });

  it('should sort ascending and descending', () => {
    expect(
      names(sortRows(dishes, columns, { key: 'name', direction: 'asc' })),
    ).toEqual(['Pasta', 'Pizza', 'Salad', 'Soup']);
    expect(
      names(sortRows(dishes, columns, { key: 'name', direction: 'desc' })),
    ).toEqual(['Soup', 'Salad', 'Pizza', 'Pasta']);
  });

  it('should keep empty values last in both directions', () => {
    expect(
      names(sortRows(dishes, columns, { key: 'price', direction: 'asc' })),
    ).toEqual(['Pizza', 'Pasta', 'Soup', 'Salad']);
    expect(
      names(sortRows(dishes, columns, { key: 'price', direction: 'desc' })),
    ).toEqual(['Pasta', 'Soup', 'Pizza', 'Salad']);
  });

  it('should be stable for equal values', () => {
    const asc = names(
      sortRows(dishes, columns, { key: 'price', direction: 'asc' }),
    );
    const desc = names(
      sortRows(dishes, columns, { key: 'price', direction: 'desc' }),
    );

    expect(asc.indexOf('Pasta')).toBeLessThan(asc.indexOf('Soup'));
    expect(desc.indexOf('Pasta')).toBeLessThan(desc.indexOf('Soup'));
  });

  it('should sort by dates with missing values last', () => {
    expect(
      names(sortRows(dishes, columns, { key: 'added', direction: 'asc' })),
    ).toEqual(['Salad', 'Pizza', 'Pasta', 'Soup']);
  });

  it('should sort by a computed value', () => {
    expect(
      names(sortRows(dishes, columns, { key: 'rank', direction: 'asc' })),
    ).toEqual(['Salad', 'Pasta', 'Soup', 'Pizza']);
  });

  it('should not mutate the input', () => {
    const before = [...dishes];

    sortRows(dishes, columns, { key: 'name', direction: 'desc' });

    expect(dishes).toEqual(before);
  });
});

describe('nextSort', () => {
  it('should start ascending', () => {
    expect(nextSort(null, 'name')).toEqual({ key: 'name', direction: 'asc' });
  });

  it('should go ascending, descending, then none', () => {
    const asc = nextSort(null, 'name');
    const desc = nextSort(asc, 'name');

    expect(desc).toEqual({ key: 'name', direction: 'desc' });
    expect(nextSort(desc, 'name')).toBeNull();
  });

  it('should restart ascending when another column is chosen', () => {
    expect(nextSort({ key: 'name', direction: 'desc' }, 'price')).toEqual({
      key: 'price',
      direction: 'asc',
    });
  });
});
