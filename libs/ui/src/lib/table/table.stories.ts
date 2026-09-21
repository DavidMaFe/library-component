import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcBadge } from '../badge/badge';
import { LcButton } from '../button/button';
import { LcCellDef, LcEmptyDef, LcHeaderDef } from './table-defs';
import { LcTable } from './table';
import { LcTableColumn } from './table.types';

interface Order {
  id: number;
  customer: string;
  total: number;
  status: 'paid' | 'pending' | 'refunded';
  placed: Date;
}

const customers = [
  'Giulia Rossi',
  'Marco Bianchi',
  'Sofia Conti',
  'Luca Ferrari',
  'Elena Russo',
  'Paolo Greco',
];
const statuses: Order['status'][] = ['paid', 'pending', 'refunded'];

const orders: Order[] = Array.from({ length: 27 }, (_, i) => ({
  id: 1000 + i,
  customer: customers[i % customers.length],
  total: Math.round((15 + ((i * 37) % 90) + (i % 7) * 0.5) * 100) / 100,
  status: statuses[i % statuses.length],
  placed: new Date(2026, 5, 1 + i),
}));

const columns: LcTableColumn<Order>[] = [
  { key: 'id', header: 'Order', sortable: true, width: '7rem' },
  { key: 'customer', header: 'Customer', sortable: true },
  { key: 'placed', header: 'Placed', sortable: true },
  { key: 'total', header: 'Total', sortable: true, align: 'end' },
  { key: 'status', header: 'Status', sortable: true },
  { key: 'actions', header: 'Actions', align: 'end' },
];

interface TableArgs {
  data: Order[];
  pageSize: number;
  selectable: boolean;
  striped: boolean;
  stickyHeader: boolean;
  loading: boolean;
  density: 'comfortable' | 'compact';
}

const template = `
  <p style="margin:0 0 0.75rem">Selected: {{ selection.length }}</p>
  <lc-table
    label="Orders"
    [data]="data"
    [columns]="columns"
    [rowId]="rowId"
    [pageSize]="pageSize"
    [selectable]="selectable"
    [(selection)]="selection"
    [striped]="striped"
    [stickyHeader]="stickyHeader"
    [loading]="loading"
    [density]="density"
  >
    <ng-template lcCell="placed" let-value="value">{{ value | date: 'mediumDate' }}</ng-template>
    <ng-template lcCell="total" let-value="value">{{ value | currency: 'EUR' }}</ng-template>
    <ng-template lcCell="status" let-value="value">
      <lc-badge [variant]="value === 'paid' ? 'success' : value === 'pending' ? 'warning' : 'neutral'">{{ value }}</lc-badge>
    </ng-template>
    <ng-template lcCell="actions" let-row>
      <button lc-button size="sm" variant="ghost" [attr.aria-label]="'Open order ' + row.id">Open</button>
    </ng-template>
    <ng-template lcEmpty>
      <strong>No orders yet</strong>
      <p style="margin:0.25rem 0 0">New orders will show up here.</p>
    </ng-template>
  </lc-table>`;

// `component` is deliberately not set (see the tooltip story): Storybook would
// write these args onto the component instance and overwrite its signal inputs.
const meta: Meta<TableArgs> = {
  title: 'Data/Table',
  decorators: [
    moduleMetadata({
      imports: [LcTable, LcCellDef, LcHeaderDef, LcEmptyDef, LcBadge, LcButton],
    }),
  ],
  argTypes: {
    density: { control: 'inline-radio', options: ['comfortable', 'compact'] },
    pageSize: { control: 'number' },
  },
  args: {
    data: orders,
    pageSize: 8,
    selectable: true,
    striped: false,
    stickyHeader: false,
    loading: false,
    density: 'comfortable',
  },
  render: (args) => ({
    props: {
      ...args,
      columns,
      selection: [],
      rowId: (order: Order) => order.id,
    },
    template,
  }),
};
export default meta;

type Story = StoryObj<TableArgs>;

/** Click a header to sort, use the checkboxes to select, and the footer to page. */
export const Default: Story = {};
export const Compact: Story = { args: { density: 'compact', striped: true } };
export const StickyHeader: Story = {
  args: { stickyHeader: true, pageSize: 0 },
  parameters: { layout: 'padded' },
};
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
