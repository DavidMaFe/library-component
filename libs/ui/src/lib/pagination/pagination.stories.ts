import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcPagination } from './pagination';

interface PaginationArgs {
  total: number;
  pageSize: number;
  page: number;
  siblings: number;
  size: 'sm' | 'md';
}

const meta: Meta<PaginationArgs> = {
  title: 'Navigation/Pagination',
  decorators: [moduleMetadata({ imports: [LcPagination] })],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  args: { total: 200, pageSize: 10, page: 1, siblings: 1, size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-pagination [total]="total" [pageSize]="pageSize" [(page)]="page" [siblings]="siblings" [size]="size" />`,
  }),
};
export default meta;

type Story = StoryObj<PaginationArgs>;

export const Default: Story = {};
export const MiddlePage: Story = { args: { page: 10 } };
export const FewPages: Story = { args: { total: 35 } };
export const Small: Story = { args: { size: 'sm', page: 10 } };
