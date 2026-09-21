export type LcPaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

/**
 * Builds the page buttons to show: first and last page are always present,
 * the current page keeps `siblings` neighbours on each side, and gaps become
 * ellipses. The number of slots stays constant while paging.
 */
export function paginationItems(
  page: number,
  pageCount: number,
  siblings = 1,
): LcPaginationItem[] {
  const range = (from: number, to: number) =>
    Array.from(
      { length: Math.max(0, to - from + 1) },
      (_, index) => from + index,
    );

  const slots = siblings * 2 + 5;
  if (pageCount <= slots) return range(1, pageCount);

  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, pageCount);
  const showStartEllipsis = left > 3;
  const showEndEllipsis = right < pageCount - 2;

  if (!showStartEllipsis && showEndEllipsis) {
    return [...range(1, 3 + siblings * 2), 'ellipsis-end', pageCount];
  }
  if (showStartEllipsis && !showEndEllipsis) {
    return [
      1,
      'ellipsis-start',
      ...range(pageCount - (2 + siblings * 2), pageCount),
    ];
  }
  return [
    1,
    'ellipsis-start',
    ...range(left, right),
    'ellipsis-end',
    pageCount,
  ];
}
