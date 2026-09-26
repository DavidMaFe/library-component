import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcCellDef, LcEmptyDef, LcHeaderDef } from './table-defs';
import { LcTable } from './table';
import { LcTableColumn, LcTableSort } from './table.types';

interface Dish {
  id: number;
  name: string;
  price: number;
  status: string;
}

const dishes = (count: number): Dish[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Dish ${String.fromCharCode(65 + (count - i - 1))}`,
    price: (i + 1) * 5,
    status: i % 2 ? 'sold out' : 'available',
  }));

@Component({
  imports: [LcTable, LcCellDef, LcHeaderDef, LcEmptyDef],
  template: `
    <lc-table
      label="Dishes"
      [data]="data()"
      [columns]="columns"
      [rowId]="rowId"
      [(sort)]="sort"
      [manualSort]="manualSort()"
      [selectable]="selectable()"
      [(selection)]="selection"
      [pageSize]="pageSize()"
      [(page)]="page"
      [total]="total()"
      [loading]="loading()"
      [summary]="summary()"
      [emptyText]="emptyText()"
    >
      @if (customCells()) {
        <ng-template
          lcCell="status"
          let-row
          let-value="value"
          let-index="index"
        >
          <em class="status">{{ value }}#{{ index }}:{{ row.name }}</em>
        </ng-template>
        <ng-template lcHeader="price" let-column
          ><strong class="price-header"
            >{{ column.header }} (€)</strong
          ></ng-template
        >
      }
      @if (customEmpty()) {
        <ng-template lcEmpty
          ><p class="custom-empty">Nothing on the menu</p></ng-template
        >
      }
    </lc-table>
  `,
})
class HostComponent {
  data = signal<Dish[]>(dishes(5));
  columns: LcTableColumn<Dish>[] = [
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      align: 'end',
      width: '8rem',
    },
    { key: 'status', header: 'Status' },
  ];
  rowId = (dish: Dish) => dish.id;
  sort = signal<LcTableSort | null>(null);
  manualSort = signal(false);
  selectable = signal(false);
  selection = signal<readonly Dish[]>([]);
  pageSize = signal(0);
  page = signal(1);
  total = signal<number | undefined>(undefined);
  loading = signal(false);
  summary = signal(
    (from: number, to: number, total: number) => `${from}–${to} of ${total}`,
  );
  emptyText = signal('No results');
  customCells = signal(false);
  customEmpty = signal(false);
}

describe('LcTable', () => {
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
      headers: () => Array.from(root.querySelectorAll<HTMLElement>('th')),
      rows: () => Array.from(root.querySelectorAll<HTMLElement>('tr[cdk-row]')),
      cells: (row: number) =>
        Array.from(api.rows()[row].querySelectorAll<HTMLElement>('td')),
      column: (index: number) =>
        api
          .rows()
          .map((row) => row.querySelectorAll('td')[index].textContent?.trim()),
      sortButton: (index: number) =>
        root
          .querySelectorAll<HTMLButtonElement>('th')
          [index].querySelector('button') as HTMLButtonElement,
      checkboxes: () =>
        Array.from(
          root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
        ),
      update: () => fixture.whenStable(),
    };
    return api;
  };

  describe('structure', () => {
    it('should render a table with a caption and column headers', async () => {
      const { root, headers } = await setup();

      expect(root.querySelector('table caption')?.textContent).toContain(
        'Dishes',
      );
      expect(headers().map((th) => th.textContent?.trim())).toEqual([
        'Name',
        'Price',
        'Status',
      ]);
      expect(headers().every((th) => th.getAttribute('scope') === 'col')).toBe(
        true,
      );
    });

    it('should render one row per item with the cell values', async () => {
      const { rows, cells } = await setup();

      expect(rows()).toHaveLength(5);
      expect(cells(0).map((cell) => cell.textContent?.trim())).toEqual([
        'Dish E',
        '5',
        'available',
      ]);
    });

    it('should make the scroll area a labelled, focusable region', async () => {
      const { root } = await setup();

      const region = root.querySelector('[role="region"]') as HTMLElement;
      expect(region.getAttribute('aria-label')).toBe('Dishes');
      expect(region.tabIndex).toBe(0);
    });

    it('should apply column alignment and width', async () => {
      const { headers, cells } = await setup();

      expect(headers()[1].getAttribute('data-align')).toBe('end');
      expect(headers()[1].style.width).toBe('8rem');
      expect(cells(0)[1].getAttribute('data-align')).toBe('end');
    });

    it('should react to data changes', async () => {
      const { host, rows, update } = await setup();

      host.data.set(dishes(2));
      await update();

      expect(rows()).toHaveLength(2);
    });
  });

  describe('slots', () => {
    it('should render a custom cell template with the row, value and index', async () => {
      const { host, root, update } = await setup();

      host.customCells.set(true);
      await update();

      const cells = Array.from(root.querySelectorAll('.status')).map(
        (cell) => cell.textContent,
      );
      expect(cells[0]).toBe('available#0:Dish E');
      expect(cells[1]).toBe('sold out#1:Dish D');
    });

    it('should render a custom header template', async () => {
      const { host, root, update } = await setup();

      host.customCells.set(true);
      await update();

      expect(root.querySelector('.price-header')?.textContent).toBe(
        'Price (€)',
      );
    });

    it('should keep the sort button around a custom header', async () => {
      const { host, sortButton, update } = await setup();

      host.customCells.set(true);
      await update();

      expect(sortButton(1).querySelector('.price-header')).not.toBeNull();
    });

    it('should show the default empty message', async () => {
      const { root } = await setup((host) => host.data.set([]));

      expect(root.querySelector('.empty')?.textContent).toContain('No results');
      expect(root.querySelector('.empty')?.getAttribute('role')).toBe('status');
    });

    it('should use a translated empty message', async () => {
      const { host, root, update } = await setup((h) => h.data.set([]));

      host.emptyText.set('Sin resultados');
      await update();

      expect(root.querySelector('.empty')?.textContent).toContain(
        'Sin resultados',
      );
    });

    it('should show a custom empty template', async () => {
      const { root } = await setup((host) => {
        host.data.set([]);
        host.customEmpty.set(true);
      });

      expect(root.querySelector('.custom-empty')?.textContent).toBe(
        'Nothing on the menu',
      );
    });

    it('should not show the empty state when there are rows', async () => {
      const { root } = await setup();

      expect(root.querySelector('.empty')).toBeNull();
    });
  });

  describe('sorting', () => {
    it('should render sortable headers as buttons only', async () => {
      const { headers } = await setup();

      expect(headers()[0].querySelector('button')).not.toBeNull();
      expect(headers()[2].querySelector('button')).toBeNull();
    });

    it('should expose aria-sort only on sortable columns', async () => {
      const { headers } = await setup();

      expect(headers().map((th) => th.getAttribute('aria-sort'))).toEqual([
        'none',
        'none',
        null,
      ]);
    });

    it('should sort ascending, then descending, then restore the original order', async () => {
      const { host, headers, column, sortButton, update } = await setup();
      const original = column(0);

      sortButton(0).click();
      await update();
      expect(column(0)).toEqual([
        'Dish A',
        'Dish B',
        'Dish C',
        'Dish D',
        'Dish E',
      ]);
      expect(headers()[0].getAttribute('aria-sort')).toBe('ascending');
      expect(host.sort()).toEqual({ key: 'name', direction: 'asc' });

      sortButton(0).click();
      await update();
      expect(column(0)).toEqual([
        'Dish E',
        'Dish D',
        'Dish C',
        'Dish B',
        'Dish A',
      ]);
      expect(headers()[0].getAttribute('aria-sort')).toBe('descending');

      sortButton(0).click();
      await update();
      expect(column(0)).toEqual(original);
      expect(headers()[0].getAttribute('aria-sort')).toBe('none');
      expect(host.sort()).toBeNull();
    });

    it('should sort numbers numerically', async () => {
      const { host, column, sortButton, update } = await setup((h) =>
        h.data.set([
          { id: 1, name: 'a', price: 100, status: '' },
          { id: 2, name: 'b', price: 20, status: '' },
          { id: 3, name: 'c', price: 3, status: '' },
        ]),
      );

      sortButton(1).click();
      await update();

      expect(column(1)).toEqual(['3', '20', '100']);
      expect(host.sort()?.key).toBe('price');
    });

    it('should only mark the sorted column', async () => {
      const { headers, sortButton, update } = await setup();

      sortButton(1).click();
      await update();

      expect(headers().map((th) => th.getAttribute('aria-sort'))).toEqual([
        'none',
        'ascending',
        null,
      ]);
    });

    it('should follow an externally controlled sort', async () => {
      const { host, column, update } = await setup();

      host.sort.set({ key: 'price', direction: 'desc' });
      await update();

      expect(column(1)).toEqual(['25', '20', '15', '10', '5']);
    });

    it('should not reorder rows with manualSort but still report the sort', async () => {
      const { host, column, sortButton, update } = await setup((h) =>
        h.manualSort.set(true),
      );
      const original = column(0);

      sortButton(0).click();
      await update();

      expect(column(0)).toEqual(original);
      expect(host.sort()).toEqual({ key: 'name', direction: 'asc' });
    });
  });

  describe('selection', () => {
    const selectable = (host: HostComponent) => host.selectable.set(true);

    it('should not show checkboxes by default', async () => {
      const { checkboxes } = await setup();

      expect(checkboxes()).toHaveLength(0);
    });

    it('should add a labelled checkbox per row and a select-all header', async () => {
      const { checkboxes } = await setup(selectable);

      expect(checkboxes()).toHaveLength(6);
      expect(checkboxes()[0].getAttribute('aria-label')).toBe(
        'Select all rows',
      );
      expect(checkboxes()[1].getAttribute('aria-label')).toBe('Select row');
    });

    it('should draw each checkbox as a decorative box next to the native input', async () => {
      const { root, checkboxes, update } = await setup(selectable);
      const boxes = () => Array.from(root.querySelectorAll('.box'));

      expect(boxes()).toHaveLength(checkboxes().length);
      expect(
        boxes().every((box) => box.getAttribute('aria-hidden') === 'true'),
      ).toBe(true);
      expect(checkboxes()[0].nextElementSibling).toBe(boxes()[0]);
      const headerMark = () =>
        boxes()[0].querySelector('path')?.getAttribute('d');
      expect(headerMark()).toBe('M3.5 8.5l3 3 6-7');

      checkboxes()[1].click();
      await update();

      expect(headerMark()).toBe('M3.5 8h9');
    });

    it('should select and deselect a row', async () => {
      const { host, checkboxes, rows, update } = await setup(selectable);

      checkboxes()[2].click();
      await update();
      expect(host.selection().map((dish) => dish.id)).toEqual([2]);
      expect(rows()[1].hasAttribute('data-selected')).toBe(true);

      checkboxes()[2].click();
      await update();
      expect(host.selection()).toEqual([]);
      expect(rows()[1].hasAttribute('data-selected')).toBe(false);
    });

    it('should select every row from the header checkbox', async () => {
      const { host, checkboxes, update } = await setup(selectable);

      checkboxes()[0].click();
      await update();

      expect(host.selection()).toHaveLength(5);
      expect(checkboxes()[0].checked).toBe(true);
      expect(checkboxes()[0].indeterminate).toBe(false);
    });

    it('should show the mixed state when only some rows are selected', async () => {
      const { checkboxes, update } = await setup(selectable);

      checkboxes()[1].click();
      await update();

      expect(checkboxes()[0].indeterminate).toBe(true);
      expect(checkboxes()[0].checked).toBe(false);
    });

    it('should clear the page from the header checkbox when everything is selected', async () => {
      const { host, checkboxes, update } = await setup(selectable);
      checkboxes()[0].click();
      await update();

      checkboxes()[0].click();
      await update();

      expect(host.selection()).toEqual([]);
    });

    it('should reflect an externally controlled selection', async () => {
      const { host, checkboxes, update } = await setup(selectable);

      host.selection.set([host.data()[0], host.data()[3]]);
      await update();

      expect(checkboxes().map((box) => box.checked)).toEqual([
        false,
        true,
        false,
        false,
        true,
        false,
      ]);
    });

    it('should identify rows by rowId, not by reference', async () => {
      const { host, checkboxes, update } = await setup(selectable);
      host.selection.set([{ ...host.data()[1] }]);
      await update();

      expect(checkboxes()[2].checked).toBe(true);
    });

    it('should disable select-all when there are no rows', async () => {
      const { checkboxes } = await setup((host) => {
        host.selectable.set(true);
        host.data.set([]);
      });

      expect(checkboxes()[0].disabled).toBe(true);
    });
  });

  describe('pagination', () => {
    const paged = (host: HostComponent) => {
      host.data.set(dishes(25));
      host.pageSize.set(10);
    };

    it('should not show pagination without a page size', async () => {
      const { root } = await setup();

      expect(root.querySelector('lc-pagination')).toBeNull();
    });

    it('should show only the current page and a summary', async () => {
      const { root, rows } = await setup(paged);

      expect(rows()).toHaveLength(10);
      expect(root.querySelector('.summary')?.textContent).toBe('1–10 of 25');
      expect(root.querySelector('lc-pagination')).not.toBeNull();
    });

    it('should change page with the pagination', async () => {
      const { host, root, rows, update } = await setup(paged);

      root
        .querySelector<HTMLButtonElement>('button[aria-label="Page 3"]')
        ?.click();
      await update();

      expect(host.page()).toBe(3);
      expect(rows()).toHaveLength(5);
      expect(root.querySelector('.summary')?.textContent).toBe('21–25 of 25');
    });

    it('should clamp a page beyond the last one', async () => {
      const { host, root, rows, update } = await setup(paged);

      host.page.set(99);
      await update();

      expect(rows()).toHaveLength(5);
      expect(root.querySelector('.summary')?.textContent).toBe('21–25 of 25');
    });

    it('should sort across pages before slicing', async () => {
      const { column, sortButton, update } = await setup(paged);

      sortButton(1).click();
      await update();
      sortButton(1).click();
      await update();

      expect(column(1)[0]).toBe('125');
    });

    it('should use a translated summary', async () => {
      const { host, root, update } = await setup(paged);

      host.summary.set((from, to, total) => `${from}-${to} de ${total}`);
      await update();

      expect(root.querySelector('.summary')?.textContent).toBe('1-10 de 25');
    });

    it('should select only the visible page with select-all and keep other pages', async () => {
      const { host, checkboxes, root, update } = await setup((h) => {
        paged(h);
        h.selectable.set(true);
      });

      checkboxes()[0].click();
      await update();
      expect(host.selection()).toHaveLength(10);

      root
        .querySelector<HTMLButtonElement>('button[aria-label="Page 2"]')
        ?.click();
      await update();
      checkboxes()[0].click();
      await update();
      expect(host.selection()).toHaveLength(20);

      checkboxes()[0].click();
      await update();
      expect(host.selection()).toHaveLength(10);
    });

    it('should not slice rows when the total is given (server-side paging)', async () => {
      const { root, rows } = await setup((host) => {
        host.data.set(dishes(10));
        host.pageSize.set(10);
        host.total.set(95);
      });

      expect(rows()).toHaveLength(10);
      expect(root.querySelector('.summary')?.textContent).toBe('1–10 of 95');
      expect(root.querySelector('button[aria-label="Page 10"]')).not.toBeNull();
    });

    it('should hide the footer when there are no rows', async () => {
      const { root } = await setup((host) => {
        host.data.set([]);
        host.pageSize.set(10);
      });

      expect(root.querySelector('.footer')).toBeNull();
    });
  });

  describe('loading', () => {
    it('should mark the table busy and announce a spinner', async () => {
      const { root } = await setup((host) => host.loading.set(true));

      expect(root.querySelector('table')?.getAttribute('aria-busy')).toBe(
        'true',
      );
      expect(root.querySelector('.loading lc-spinner')?.textContent).toContain(
        'Loading data',
      );
    });

    it('should not show the empty state while loading', async () => {
      const { root } = await setup((host) => {
        host.data.set([]);
        host.loading.set(true);
      });

      expect(root.querySelector('.empty')).toBeNull();
    });

    it('should clear the busy state when loaded', async () => {
      const { host, root, update } = await setup((h) => h.loading.set(true));

      host.loading.set(false);
      await update();

      expect(root.querySelector('table')?.hasAttribute('aria-busy')).toBe(
        false,
      );
      expect(root.querySelector('.loading')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('should have no violations in the basic state', async () => {
      const { fixture } = await setup();

      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('should have no violations with sorting, selection and pagination', async () => {
      const { fixture, sortButton, update } = await setup((host) => {
        host.data.set(dishes(25));
        host.pageSize.set(10);
        host.selectable.set(true);
        host.customCells.set(true);
      });
      sortButton(2).click();
      await update();

      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('should have no violations when empty', async () => {
      const { fixture } = await setup((host) => host.data.set([]));

      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });
  });
});
