import { paginationItems } from './pagination-items';

describe('paginationItems', () => {
  it('should list every page when they all fit', () => {
    expect(paginationItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('should list a single page', () => {
    expect(paginationItems(1, 1)).toEqual([1]);
  });

  it('should collapse the end when near the start', () => {
    expect(paginationItems(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 20]);
    expect(paginationItems(3, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 20]);
  });

  it('should collapse the start when near the end', () => {
    expect(paginationItems(20, 20)).toEqual([
      1,
      'ellipsis-start',
      16,
      17,
      18,
      19,
      20,
    ]);
    expect(paginationItems(18, 20)).toEqual([
      1,
      'ellipsis-start',
      16,
      17,
      18,
      19,
      20,
    ]);
  });

  it('should collapse both sides in the middle', () => {
    expect(paginationItems(10, 20)).toEqual([
      1,
      'ellipsis-start',
      9,
      10,
      11,
      'ellipsis-end',
      20,
    ]);
  });

  it('should keep the same number of slots while paging', () => {
    const lengths = new Set(
      Array.from({ length: 20 }, (_, i) => paginationItems(i + 1, 20).length),
    );

    expect(lengths).toEqual(new Set([7]));
  });

  it('should honor more siblings', () => {
    expect(paginationItems(10, 30, 2)).toEqual([
      1,
      'ellipsis-start',
      8,
      9,
      10,
      11,
      12,
      'ellipsis-end',
      30,
    ]);
  });

  it('should never repeat a page', () => {
    for (let page = 1; page <= 20; page++) {
      const pages = paginationItems(page, 20).filter(
        (item) => typeof item === 'number',
      );
      expect(new Set(pages).size).toBe(pages.length);
    }
  });
});
